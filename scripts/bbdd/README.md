# BBDD comercial iMercados — carga

Scripts para incorporar la base comercial (empresas + contactos) a Supabase,
por fases y sin tocar los datos existentes.

## ⚠️ Privacidad (Ley 21.719)

Los archivos `.xlsx` de entrada y los `.csv` de salida contienen **datos
personales** (nombres, correos, teléfonos). **Nunca** se versionan en git — el
`.gitignore` de la raíz los excluye. Guárdalos solo en tu equipo.

## Migraciones (SQL versionado)

- `supabase/migrations/20260827100001_staging_contactos_imercados.sql` — tabla de staging (crudo).
- `supabase/migrations/20260827100002_bbdd_comercial_definitivas.sql` — 6 tablas definitivas.
- (Fase 5) índices, extensiones `pg_trgm`/`unaccent` y RLS — pendiente.

Son idempotentes: se pueden volver a aplicar sin romper nada.

## Fase 3 — limpieza (este script)

Transforma el Excel crudo en archivos listos para cargar y genera reportes de
control para revisión humana. No modifica el Excel ni la base de datos.

```bash
python scripts/bbdd/clean_imercados.py \
  --input ".../BBDD_iMercados.xlsx" \
  --outdir "scripts/bbdd/output"
```

Requisitos: `python 3.x` y `pip install openpyxl`.

Genera en `--outdir`:

- **Archivos de carga** (Fase 4): `companies.csv`, `company_industries.csv`,
  `contacts.csv`, `contact_company.csv`, `contact_emails.csv`,
  `contact_phones.csv`, `staging_contactos_imercados.csv`.
- **Archivos de control** (revisión): `empresas_posibles_duplicados.csv`,
  `contactos_fusionados.csv`, `contactos_conflicto.csv`,
  `descartados_invalidos.csv`, `resumen.txt`.

Reglas: dedup de empresas por razón social normalizada (fusión solo si el
normalizado es idéntico); dedup de contactos por correo+nombre (o
nombre+empresa si no hay correo); teléfonos a E.164 chileno con lo inválido
marcado (no borrado); correos en minúscula con flag de validez.

## Fase 4 — carga a Supabase (pendiente)

Script para ejecutar **localmente en Windows (PowerShell)**, en lotes de 500,
con reintentos y reanudable, usando la `service_role` desde `.env.local`
(que va en `.gitignore` y nunca se escribe en código). Se entrega tras aprobar
los reportes de la Fase 3.
