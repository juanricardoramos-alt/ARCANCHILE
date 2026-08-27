#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BBDD comercial iMercados · Fase 3 — Limpieza, normalización y deduplicación.

Lee el Excel CRUDO y produce:
  Archivos de carga (para la Fase 4):
    companies.csv, company_industries.csv, contacts.csv,
    contact_company.csv, contact_emails.csv, contact_phones.csv,
    staging_contactos_imercados.csv
  Archivos de CONTROL (para revisión humana, NADA se borra en silencio):
    empresas_posibles_duplicados.csv
    contactos_fusionados.csv
    contactos_conflicto.csv
    descartados_invalidos.csv
  resumen.txt  (conteos / criterios de aceptación)

Uso:
  python clean_imercados.py --input RUTA.xlsx --outdir CARPETA_SALIDA

Determinista e idempotente: correrlo de nuevo produce exactamente lo mismo.
No modifica el Excel de entrada.
"""
import argparse, csv, os, re, sys, unicodedata, collections
from datetime import datetime, date, time

FUENTE = "iMercados"

# ───────────────────────── normalización de texto ─────────────────────────
def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

SUFIJOS = re.compile(
    r"\b(S\.?A\.?C\.?I?|S\.?A\.?|S\.?P\.?A|LTDA|LIMITADA|E\.?I\.?R\.?L|CIA|Y CIA|INC|LLC)\b"
)
def norm_company(s):
    s = strip_accents((s or "").upper()).strip()
    s = re.sub(r"[.,;:/\\\-_'\"()]", " ", s)
    s = SUFIJOS.sub(" ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_name(s):
    s = strip_accents((s or "").upper()).strip()
    s = re.sub(r"[.,;:/\\\-_'\"()]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

# ───────────────────────── correos ─────────────────────────
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$", re.I)
def norm_email(s):
    return re.sub(r"\s+", "", (s or "")).strip().lower()
def valid_email(e):
    return bool(EMAIL_RE.match(e or ""))

# ───────────────────────── teléfonos → E.164 ─────────────────────────
CC_LEN = {  # código de país: rango razonable de dígitos del número nacional
    "34": (9, 9), "51": (8, 9), "54": (10, 11), "55": (10, 11), "57": (10, 10),
    "52": (10, 10), "58": (10, 10), "44": (9, 10), "49": (10, 11), "39": (9, 11),
    "33": (9, 9), "61": (9, 9), "1": (10, 10), "86": (11, 11), "41": (9, 9),
    "47": (8, 8), "31": (9, 9), "351": (9, 9),
}
CC_ISO = {
    "34": "ES", "51": "PE", "54": "AR", "55": "BR", "57": "CO", "52": "MX",
    "58": "VE", "44": "GB", "49": "DE", "39": "IT", "33": "FR", "61": "AU",
    "1": "US", "86": "CN", "41": "CH", "47": "NO", "31": "NL", "351": "PT", "56": "CL",
}
def split_phones(cell):
    if not cell:
        return []
    parts = re.split(r"[|/;]| y | Y |,", str(cell))
    return [p.strip() for p in parts if p and p.strip()]

def norm_phone(raw):
    """Devuelve (e164 | None, tipo, pais, valido)."""
    txt = str(raw)
    if re.search(r"[a-zA-Z]", txt):            # 'Anexo 7573', textos → revisar
        return (None, "desconocido", None, False)
    d = re.sub(r"\D", "", txt)
    if not d:
        return (None, "desconocido", None, False)
    # Chile con código país
    if d.startswith("56"):
        rest = d[2:]
        if len(rest) == 9 and rest[0] == "9":
            return ("+56" + rest, "movil", "CL", True)
        if len(rest) == 9 and rest[0] in "2345678":
            return ("+56" + rest, "fijo", "CL", True)
        return (None, "desconocido", "CL", False)     # 56 + largo raro
    # Chile sin código país
    if len(d) == 9 and d[0] == "9":
        return ("+569" + d[1:], "movil", "CL", True)
    if len(d) == 8:                                    # fijo sin área ni país → revisar
        return (None, "fijo", "CL", False)
    # Extranjeros por prefijo de código de país
    for cc in ("351", "86", "54", "55", "57", "52", "58", "34", "51", "44", "49",
               "39", "33", "61", "41", "47", "31", "1"):
        if d.startswith(cc):
            lo, hi = CC_LEN.get(cc, (7, 12))
            nat = d[len(cc):]
            if lo <= len(nat) <= hi:
                return ("+" + d, "desconocido", CC_ISO.get(cc), True)
    return (None, "desconocido", None, False)          # a revisar

# ───────────────────────── separación de nombre (tentativa) ─────────────────────────
PARTICULAS = {"DE", "DEL", "LA", "LAS", "LOS", "SAN", "SANTA", "VON", "VAN", "DA", "DI", "MC", "MAC", "DELA"}
def split_name(nombre_completo):
    n = norm_name(nombre_completo)
    words = [w for w in n.split(" ") if w]
    confiable = True
    if len(words) >= 4:
        confiable = False
    if any(w in PARTICULAS for w in words):
        confiable = False
    if any(len(w) == 1 for w in words):   # iniciales sueltas
        confiable = False
    if len(words) == 0:
        return ("", "", False)
    if len(words) == 1:
        return (words[0].title(), "", False)
    if len(words) == 2:
        nombre, apellido = words[0], words[1]
    elif len(words) == 3:                  # patrón chileno: 1 nombre + 2 apellidos
        nombre, apellido = words[0], " ".join(words[1:])
    else:                                  # 4+: 2 nombres + resto apellidos (no confiable)
        nombre, apellido = " ".join(words[:2]), " ".join(words[2:])
    return (nombre.title(), apellido.title(), confiable)

# ───────────────────────── trigramas (empresas parecidas) ─────────────────────────
def trigrams(s):
    s = " " + s + " "
    return set(s[i:i+3] for i in range(len(s) - 2))
def jaccard(a, b):
    if not a or not b:
        return 0.0
    inter = len(a & b)
    return inter / len(a | b) if (a or b) else 0.0

# ───────────────────────── carga del Excel ─────────────────────────
def read_rows(path):
    import openpyxl
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    it = ws.iter_rows(values_only=True)
    header = next(it)
    cols = ["columna1", "razon_social", "nombre_fantasia", "persona",
            "trabajador_en_empresa", "cargo", "correo_corporativo", "correo_persona",
            "telefono_1", "telefono_2", "rubro", "industria1", "industrias2", "industrias4"]
    for i, r in enumerate(it, start=2):   # fila 2 = primera de datos
        vals = list(r) + [None] * (14 - len(r))
        d = {}
        for j, c in enumerate(cols):
            v = vals[j]
            d[c] = v.strip() if isinstance(v, str) else ("" if v is None else str(v))
        d["_fila"] = i
        yield d
    wb.close()

def w(outdir, name, header, rows):
    with open(os.path.join(outdir, name), "w", newline="", encoding="utf-8-sig") as f:
        wr = csv.writer(f)
        wr.writerow(header)
        wr.writerows(rows)

# ───────────────────────── proceso principal ─────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--outdir", required=True)
    a = ap.parse_args()
    os.makedirs(a.outdir, exist_ok=True)
    rows = list(read_rows(a.input))
    n = len(rows)

    # ---- EMPRESAS ----
    comp = {}            # norm -> dict(id, razon_social, nombre_fantasia, rubro, industrias{orden->set})
    for r in rows:
        rs = r["razon_social"] or ""
        cn = norm_company(rs)
        if not cn:
            continue
        c = comp.get(cn)
        if not c:
            c = comp[cn] = {"id": len(comp) + 1, "razon_social": rs,
                            "nombre_fantasia": r["nombre_fantasia"] or "",
                            "rubro": r["rubro"] or "", "ind": {}}
        for orden, key in ((1, "industria1"), (2, "industrias2"), (4, "industrias4")):
            val = (r[key] or "").strip()
            if val:
                c["ind"].setdefault(orden, set()).add(val)

    # empresas posibles duplicados (trigram > 0.85, sin fusionar)
    norms = list(comp.keys())
    tg = {cn: trigrams(cn) for cn in norms}
    inv = collections.defaultdict(list)
    for cn in norms:
        for t in tg[cn]:
            inv[t].append(cn)
    posibles = []
    seen_pairs = set()
    for cn in norms:
        cand = collections.Counter()
        for t in tg[cn]:
            post = inv[t]
            if len(post) > 150:          # trigramas muy comunes no discriminan
                continue
            for other in post:
                if other != cn:
                    cand[other] += 1
        for other, sh in cand.items():
            if sh < 0.6 * len(tg[cn]):
                continue
            key = tuple(sorted((cn, other)))
            if key in seen_pairs:
                continue
            seen_pairs.add(key)
            sim = jaccard(tg[cn], tg[other])
            if sim > 0.85:
                posibles.append((round(sim, 3), comp[cn]["razon_social"], comp[other]["razon_social"]))
    posibles.sort(reverse=True)

    # ---- CONTACTOS (dedup) ----
    def primary_email(r):
        c = norm_email(r["correo_corporativo"])
        p = norm_email(r["correo_persona"])
        return c or p

    def dedup_key(r):
        pe = primary_email(r)
        nn = norm_name(r["persona"] or r["trabajador_en_empresa"] or "")
        if pe:
            return "email:" + pe + "|" + nn
        return "noemail:" + nn + "|" + norm_company(r["razon_social"] or "")

    groups = collections.OrderedDict()
    for r in rows:
        groups.setdefault(dedup_key(r), []).append(r)

    # conflictos: mismo correo -> más de un nombre normalizado distinto
    email_names = collections.defaultdict(set)
    for r in rows:
        pe = primary_email(r)
        if pe:
            email_names[pe].add(norm_name(r["persona"] or ""))
    conflict_emails = {e: ns for e, ns in email_names.items() if len(ns) > 1}

    contacts = []            # dict por contacto
    key_to_cid = {}
    for k, grp in groups.items():
        cid = len(contacts) + 1
        key_to_cid[k] = cid
        persona = next((g["persona"] for g in grp if g["persona"]), "") or \
                  next((g["trabajador_en_empresa"] for g in grp if g["trabajador_en_empresa"]), "")
        alt = ""
        for g in grp:
            if g["trabajador_en_empresa"] and g["trabajador_en_empresa"] != g["persona"]:
                alt = g["trabajador_en_empresa"]; break
        nota = next((g["columna1"] for g in grp if g["columna1"]), "")
        nt, at, conf = split_name(persona)
        pe = primary_email(grp[0])
        rev = bool(pe and pe in conflict_emails)
        contacts.append({"id": cid, "key": k, "nombre_completo": persona,
                         "nombre_tentativo": nt, "apellido_tentativo": at,
                         "confiable": conf, "alt": alt, "nota": nota,
                         "rev": rev, "grp": grp, "pe": pe})

    # ---- puente, correos, teléfonos ----
    bridge = {}              # (cid, company_id) -> dict
    emails = []              # filas contact_emails
    phones = []              # filas contact_phones
    email_seen = set()
    phone_seen = set()
    contact_has_valid_email = set()
    contact_has_valid_phone = set()
    contact_companies = collections.defaultdict(list)

    for ct in contacts:
        cid = ct["id"]
        # correos del contacto
        corp = norm_email(next((g["correo_corporativo"] for g in ct["grp"] if g["correo_corporativo"]), ""))
        pers = norm_email(next((g["correo_persona"] for g in ct["grp"] if g["correo_persona"]), ""))
        principal_set = False
        for em, tipo in ((corp, "corporativo"), (pers, "personal")):
            if not em:
                continue
            if (cid, em) in email_seen:
                continue
            email_seen.add((cid, em))
            v = valid_email(em)
            es_ppal = (not principal_set) and (tipo == "corporativo" or not corp)
            if es_ppal:
                principal_set = True
            if v:
                contact_has_valid_email.add(cid)
            emails.append([cid, em, tipo, v, es_ppal, FUENTE])
        # teléfonos del contacto
        orden = 0
        for g in ct["grp"]:
            for cell in (g["telefono_1"], g["telefono_2"]):
                for tok in split_phones(cell):
                    if (cid, tok) in phone_seen:
                        continue
                    phone_seen.add((cid, tok))
                    orden += 1
                    e164, tipo, pais, v = norm_phone(tok)
                    if v:
                        contact_has_valid_phone.add(cid)
                    phones.append([cid, tok, e164 or "", tipo or "", pais or "", v, orden, FUENTE])
        # empresas del contacto (puente)
        for g in ct["grp"]:
            cn = norm_company(g["razon_social"] or "")
            if not cn or cn not in comp:
                continue
            comp_id = comp[cn]["id"]
            if (cid, comp_id) not in bridge:
                bridge[(cid, comp_id)] = {"cargo": g["cargo"] or "", "ppal": False}
                contact_companies[cid].append(comp_id)
        # marcar es_principal = primera empresa del contacto
        if contact_companies[cid]:
            bridge[(cid, contact_companies[cid][0])]["ppal"] = True

    # ---- ESCRITURA: archivos de carga ----
    w(a.outdir, "companies.csv",
      ["id", "razon_social", "razon_social_norm", "nombre_fantasia", "rubro",
       "rut", "region", "comuna", "direccion", "sitio_web", "tamano", "telefono_central", "fuente"],
      [[c["id"], c["razon_social"], cn, c["nombre_fantasia"], c["rubro"],
        "", "", "", "", "", "", "", FUENTE] for cn, c in comp.items()])

    ind_rows = []
    for cn, c in comp.items():
        for orden, vals in sorted(c["ind"].items()):
            for industria in sorted(vals):
                ind_rows.append([c["id"], industria, orden, FUENTE])
    w(a.outdir, "company_industries.csv", ["company_id", "industria", "orden", "fuente"], ind_rows)

    w(a.outdir, "contacts.csv",
      ["id", "nombre_completo", "nombre_tentativo", "apellido_tentativo",
       "nombre_separacion_confiable", "nombre_alternativo", "nota_original",
       "dedup_key", "revision_manual", "fuente"],
      [[ct["id"], ct["nombre_completo"], ct["nombre_tentativo"], ct["apellido_tentativo"],
        ct["confiable"], ct["alt"], ct["nota"], ct["key"], ct["rev"], FUENTE] for ct in contacts])

    w(a.outdir, "contact_company.csv",
      ["contact_id", "company_id", "cargo", "es_principal", "fuente"],
      [[cid, comp_id, v["cargo"], v["ppal"], FUENTE] for (cid, comp_id), v in bridge.items()])

    w(a.outdir, "contact_emails.csv",
      ["contact_id", "email", "tipo", "valido", "es_principal", "fuente"], emails)

    w(a.outdir, "contact_phones.csv",
      ["contact_id", "numero_raw", "numero_e164", "tipo", "pais", "valido", "orden", "fuente"], phones)

    w(a.outdir, "staging_contactos_imercados.csv",
      ["fila_origen", "columna1", "razon_social", "nombre_fantasia", "persona",
       "trabajador_en_empresa", "cargo", "correo_corporativo", "correo_persona",
       "telefono_1", "telefono_2", "rubro", "industria1", "industrias2", "industrias4"],
      [[r["_fila"], r["columna1"], r["razon_social"], r["nombre_fantasia"], r["persona"],
        r["trabajador_en_empresa"], r["cargo"], r["correo_corporativo"], r["correo_persona"],
        r["telefono_1"], r["telefono_2"], r["rubro"], r["industria1"], r["industrias2"], r["industrias4"]]
       for r in rows])

    # ---- ESCRITURA: archivos de control ----
    w(a.outdir, "empresas_posibles_duplicados.csv",
      ["similitud", "empresa_a", "empresa_b"], posibles)

    fus = [[ct["key"], ct["nombre_completo"], ct["pe"], len(ct["grp"]),
            " | ".join(sorted({g["razon_social"] for g in ct["grp"] if g["razon_social"]})),
            "mismo correo+nombre" if ct["pe"] else "mismo nombre+empresa (sin correo)"]
           for ct in contacts if len(ct["grp"]) > 1]
    w(a.outdir, "contactos_fusionados.csv",
      ["dedup_key", "nombre_completo", "correo_principal", "filas_unidas", "empresas", "motivo"], fus)

    conf_rows = []
    for e, ns in sorted(conflict_emails.items()):
        conf_rows.append([e, len(ns), " || ".join(sorted(ns))])
    w(a.outdir, "contactos_conflicto.csv",
      ["correo", "nombres_distintos", "nombres"], conf_rows)

    desc = []
    for ct in contacts:
        for row in emails:
            pass
    for cid, em, tipo, v, ppal, _ in emails:
        if not v:
            desc.append(["correo_invalido", cid, em, "formato inválido (ej. TLD cortado)"])
    for cid, raw, e164, tipo, pais, v, orden, _ in phones:
        if not v:
            desc.append(["telefono_revisar", cid, raw, "no se pudo normalizar a E.164 (call center/anexo/incompleto)"])
    w(a.outdir, "descartados_invalidos.csv",
      ["tipo", "contact_id", "valor", "motivo"], desc)

    # ---- RESUMEN / criterios de aceptación ----
    sin_empresa = sum(1 for ct in contacts if not contact_companies[ct["id"]])
    con_email = len(contact_has_valid_email)
    con_tel = len(contact_has_valid_phone)
    ambos = len(contact_has_valid_email & contact_has_valid_phone)
    ext = sum(1 for p in phones if p[4] and p[4] != "CL" and p[5])
    resumen = f"""RESUMEN FASE 3 — limpieza BBDD iMercados
Generado: {datetime.now().isoformat(timespec='seconds')}
Archivo: {os.path.basename(a.input)}

FILAS EN EL EXCEL:               {n}

EMPRESAS (dedup por razón social normalizada)
  empresas únicas cargadas:      {len(comp)}
  posibles duplicados a revisar: {len(posibles)}   (similitud>0.85, NO fusionados → empresas_posibles_duplicados.csv)

CONTACTOS (dedup por correo+nombre / nombre+empresa)
  contactos únicos cargados:     {len(contacts)}
  filas que se fusionaron:       {n - len(contacts)}   (detalle → contactos_fusionados.csv)
  conflictos (mismo correo, nombres distintos, NO fusionados): {len(conflict_emails)}   (→ contactos_conflicto.csv)
  marcados revision_manual:      {sum(1 for ct in contacts if ct['rev'])}

CALIDAD
  contactos con email válido:    {con_email}
  contactos con teléfono válido: {con_tel}
  contactos con AMBOS:           {ambos}
  contactos SIN empresa:         {sin_empresa}

DETALLE DE VÍNCULOS
  vínculos persona-empresa:      {len(bridge)}
  correos totales:               {len(emails)}   (inválidos: {sum(1 for e in emails if not e[3])})
  teléfonos totales:             {len(phones)}   (válidos: {sum(1 for p in phones if p[5])}, a revisar: {sum(1 for p in phones if not p[5])}, extranjeros: {ext})

NADA se eliminó: todo lo inválido queda marcado y en descartados_invalidos.csv.
"""
    with open(os.path.join(a.outdir, "resumen.txt"), "w", encoding="utf-8") as f:
        f.write(resumen)
    print(resumen)

if __name__ == "__main__":
    main()
