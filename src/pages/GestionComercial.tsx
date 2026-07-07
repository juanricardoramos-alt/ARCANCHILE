import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { allContacts, empresasList, exportContactsCsv } from '../lib/contactos';
import type { FlatContact } from '../lib/contactos';
import {
  contactosReales,
  empresasReales,
  exportRealContactsCsv,
  realKey,
  realStateOf,
  telHref,
  waHref,
} from '../lib/realContacts';
import { CRM_LABEL, CRM_STATES, SECTOR_LABEL } from '../data/types';
import type { ContactoNivel, ContactSector, CrmState } from '../data/types';
import { CRM_COLOR } from '../lib/crm';
import { useApp } from '../context/AppContext';
import { ContactoNivelBadge, KpiCard, LinkedInIcon, OrigenBadge, PipeBadge, SectionTitle } from '../components/ui';
import { CrmManager, CrmModal } from '../components/CrmManager';
import { CrmActions } from '../components/CrmActions';
import { useSwipe } from '../lib/useSwipe';

const FUNNEL = CRM_STATES.map((state) => ({ state, color: CRM_COLOR[state] }));
const NIVELES: ContactoNivel[] = ['decisor', 'influenciador', 'tecnico', 'acceso'];
const SECTORES: ContactSector[] = ['MINERO', 'EPC', 'ENERGIA', 'OIL_GAS', 'PIPELINE', 'AGUA', 'CELULOSA', 'INSPECCION', 'INDUSTRIAL'];

const EN_GESTION: CrmState[] = ['contactado', 'respuesta', 'reunion_agendada', 'reunion_realizada', 'propuesta', 'negociacion'];

/** Orden lineal del embudo para avanzar/retroceder con swipe (descartado se maneja en el modal). */
const ADVANCE: CrmState[] = ['pendiente', 'contactado', 'respuesta', 'reunion_agendada', 'reunion_realizada', 'propuesta', 'negociacion', 'adjudicado'];
function nextState(s: CrmState): CrmState {
  const i = ADVANCE.indexOf(s);
  return i < 0 || i >= ADVANCE.length - 1 ? s : ADVANCE[i + 1];
}
function prevState(s: CrmState): CrmState {
  const i = ADVANCE.indexOf(s);
  return i <= 0 ? s : ADVANCE[i - 1];
}

function emptyCounts(): Record<CrmState, number> {
  return Object.fromEntries(CRM_STATES.map((s) => [s, 0])) as Record<CrmState, number>;
}

export function GestionComercial() {
  const { usuario } = useApp();
  const [mode, setMode] = useState<'reales' | 'perfiles'>('reales');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white">Gestión comercial · CRM de contactos</h1>
          <p className="text-sm text-steel-500">
            {mode === 'reales'
              ? `${contactosReales.length} contactos reales de ARCANCHILE (BBDD LinkedIn + evento Pipeline II) · gestionando como ${usuario?.nombre ?? 'Usuario'}`
              : 'Perfiles de cargos objetivo por proyecto (cuándo no hay contacto real, a quién buscar)'}
          </p>
        </div>
        <div className="flex overflow-hidden rounded border border-steel-300">
          <button
            onClick={() => setMode('reales')}
            className={`px-3 py-1.5 text-sm font-semibold ${mode === 'reales' ? 'bg-navy-900 text-white' : 'bg-white text-steel-600'}`}
          >
            Contactos reales (BBDD)
          </button>
          <button
            onClick={() => setMode('perfiles')}
            className={`px-3 py-1.5 text-sm font-semibold ${mode === 'perfiles' ? 'bg-navy-900 text-white' : 'bg-white text-steel-600'}`}
          >
            Perfiles objetivo
          </button>
        </div>
      </div>

      {/* Barra de acciones: informe, backup y CSV */}
      <div className="rounded-lg border border-steel-200 bg-white p-3 shadow-sm">
        <CrmActions />
      </div>

      {mode === 'reales' ? <RealesView /> : <PerfilesView />}
    </div>
  );
}

function Funnel({ counts }: { counts: Record<CrmState, number> }) {
  const max = Math.max(1, ...FUNNEL.map((s) => counts[s.state]));
  return (
    <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
      <SectionTitle>Embudo de gestión (vista actual)</SectionTitle>
      <div className="space-y-1.5">
        {FUNNEL.map((s) => (
          <div key={s.state} className="flex items-center gap-2 sm:gap-3">
            <span className="w-28 shrink-0 text-[11px] font-semibold text-steel-600 sm:w-40 sm:text-xs">{CRM_LABEL[s.state]}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-steel-100 sm:h-6">
              <div
                className="flex h-full items-center justify-end rounded px-2 text-[11px] font-bold text-white"
                style={{ width: `${Math.max(4, (counts[s.state] / max) * 100)}%`, backgroundColor: s.color }}
              >
                {counts[s.state]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tarjeta de contacto real en móvil, con swipe para avanzar/retroceder de estado.
function RealMobileCard({ c, current }: { c: (typeof contactosReales)[number]; current: CrmState }) {
  const { logActivity, usuario } = useApp();
  const [swipeTo, setSwipeTo] = useState<CrmState | null>(null);
  const [flash, setFlash] = useState<'next' | 'prev' | null>(null);
  const tel = telHref(c.fono);
  const wa = waHref(c.fono);
  const key = realKey(c);

  function trigger(dir: 'next' | 'prev') {
    const target = dir === 'next' ? nextState(current) : prevState(current);
    if (target === current) return;
    setFlash(dir);
    setSwipeTo(target);
  }
  const swipe = useSwipe({ onSwipeRight: () => trigger('next'), onSwipeLeft: () => trigger('prev') });

  return (
    <div
      {...swipe}
      className={`rounded-lg border bg-white p-3 shadow-sm transition-colors dark:bg-navy-900 ${
        flash === 'next' ? 'border-emerald-300' : flash === 'prev' ? 'border-amber-300' : 'border-steel-200 dark:border-navy-700'
      }`}
      onAnimationEnd={() => setFlash(null)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">{c.prioridad}</span>
            <span className="font-bold text-navy-900 dark:text-white">{c.nombre}</span>
            <LinkedInIcon className="h-3.5 w-3.5 text-sky-700" />
          </div>
          <div className="mt-0.5 text-xs text-steel-600 dark:text-steel-300">{c.cargo}</div>
          <div className="text-xs text-steel-500">
            {c.empresa} · {SECTOR_LABEL[c.sector]}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ContactoNivelBadge nivel={c.nivel} />
          <OrigenBadge origen={c.origen} />
        </div>
      </div>
      {c.projectIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {c.projectIds.slice(0, 3).map((pid) => (
            <Link key={pid} to={`/proyectos/${pid}`} className="rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">
              {pid}
            </Link>
          ))}
          {c.projectIds.length > 3 && <span className="text-[11px] text-steel-400">+{c.projectIds.length - 3}</span>}
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tel && (
          <a href={tel} className="rounded bg-navy-900 px-3 py-1.5 text-xs font-bold text-white">
            Llamar
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
            WhatsApp
          </a>
        )}
        {c.email && (
          <a href={`mailto:${c.email}`} className="rounded border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
            Email
          </a>
        )}
      </div>
      <div className="mt-3 border-t border-steel-100 pt-2 dark:border-navy-700">
        <CrmManager contactKey={key} title={c.nombre} subtitle={`${c.cargo} · ${c.empresa}`} />
      </div>
      {swipeTo && (
        <CrmModal
          contactKey={key}
          title={c.nombre}
          subtitle={`${c.cargo} · ${c.empresa}`}
          current={current}
          presetTo={swipeTo}
          usuario={usuario?.nombre ?? 'Usuario'}
          onClose={() => setSwipeTo(null)}
          onSave={(to, nota, extra) => {
            logActivity(key, to, nota, extra);
            setSwipeTo(null);
          }}
        />
      )}
    </div>
  );
}

// ───────────────────────── Contactos reales (BBDD) ─────────────────────────
function RealesView() {
  const { crmState, crmLoading, crmError } = useApp();
  const [q, setQ] = useState('');
  const [origen, setOrigen] = useState('');
  const [sector, setSector] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nivel, setNivel] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [estado, setEstado] = useState('');
  const [soloVinculados, setSoloVinculados] = useState(false);

  const stateOf = (c: (typeof contactosReales)[number]) => realStateOf(crmState, c);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return contactosReales.filter((c) => {
      if (origen && c.origen !== origen && c.origen !== 'Ambas') return false;
      if (sector && c.sector !== sector) return false;
      if (empresa && c.empresa !== empresa) return false;
      if (nivel && c.nivel !== nivel) return false;
      if (prioridad && String(c.prioridad) !== prioridad) return false;
      if (estado && stateOf(c) !== estado) return false;
      if (soloVinculados && c.projectIds.length === 0) return false;
      if (text) {
        const hay = `${c.nombre} ${c.empresa} ${c.empresaRaw} ${c.cargo} ${c.email}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, origen, sector, empresa, nivel, prioridad, estado, soloVinculados, crmState]);

  const counts = useMemo(() => {
    const acc = emptyCounts();
    for (const c of filtered) acc[stateOf(c)] += 1;
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, crmState]);

  const enGestion = EN_GESTION.reduce((n, s) => n + counts[s], 0);
  const reuniones = counts.reunion_agendada + counts.reunion_realizada;

  return (
    <>
      {crmLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
          Sincronizando gestión con la base de datos…
        </div>
      )}
      {crmError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Problema de sincronización: {crmError}
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => exportRealContactsCsv(filtered, stateOf)}
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-navy-950 hover:bg-amber-400"
        >
          ⬇ Exportar {filtered.length} contactos CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Pendientes" value={counts.pendiente} sub="sin gestionar" />
        <KpiCard label="En gestión" value={enGestion} sub="contactado → negociación" accent />
        <KpiCard label="Reuniones" value={reuniones} sub="agendadas + realizadas" />
        <KpiCard label="Adjudicados" value={counts.adjudicado} />
        <KpiCard label="Descartados" value={counts.descartado} />
      </div>

      <Funnel counts={counts} />

      {/* Filtros */}
      <div className="grid grid-cols-2 items-center gap-2 rounded-lg border border-steel-200 bg-white p-3 shadow-sm sm:flex sm:flex-wrap [&>select]:w-full sm:[&>select]:w-auto">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar nombre, empresa, cargo o correo…"
          className="col-span-2 w-full rounded border border-steel-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500 sm:w-auto sm:min-w-52 sm:flex-1"
        />
        <select value={origen} onChange={(e) => setOrigen(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Toda fuente</option>
          <option value="Pipeline II">Pipeline II (evento)</option>
          <option value="LinkedIn">LinkedIn</option>
        </select>
        <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Todo sector</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>{SECTOR_LABEL[s]}</option>
          ))}
        </select>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Todo nivel</option>
          {NIVELES.map((n) => (
            <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
          ))}
        </select>
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Toda prioridad</option>
          <option value="1">Prioridad 1</option>
          <option value="2">Prioridad 2</option>
          <option value="3">Prioridad 3</option>
        </select>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Todo estado</option>
          {CRM_STATES.map((s) => (
            <option key={s} value={s}>{CRM_LABEL[s]}</option>
          ))}
        </select>
        <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="max-w-52 rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Toda empresa</option>
          {empresasReales.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-steel-600">
          <input type="checkbox" checked={soloVinculados} onChange={(e) => setSoloVinculados(e.target.checked)} className="h-4 w-4 accent-sky-600" />
          Solo con proyecto vinculado
        </label>
      </div>

      {/* Tarjetas en celular */}
      <div className="space-y-3 md:hidden">
        <p className="text-center text-[11px] text-steel-400">
          Desliza una tarjeta → para avanzar de estado · ← para retroceder
        </p>
        {filtered.map((c) => (
          <RealMobileCard key={c.id} c={c} current={stateOf(c)} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-lg border border-steel-200 bg-white py-8 text-center text-sm text-steel-500">
            No hay contactos para los filtros seleccionados.
          </p>
        )}
      </div>

      {/* Tabla en tablet/desktop */}
      <div className="hidden overflow-x-auto rounded-lg border border-steel-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[1080px] border-collapse">
          <thead className="border-b-2 border-navy-900 bg-steel-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Contacto</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Empresa / sector</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Teléfono</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Proyectos</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado / gestión</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const tel = telHref(c.fono);
              const wa = waHref(c.fono);
              const linked = c.projectIds;
              return (
                <tr key={c.id} className="border-b border-steel-100 align-top hover:bg-amber-50/50">
                  <td className="px-3 py-2 text-sm">
                    <span className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white" title={`Prioridad ${c.prioridad}`}>
                        {c.prioridad}
                      </span>
                      {c.nombre}
                      <ContactoNivelBadge nivel={c.nivel} />
                      <LinkedInIcon className="h-3.5 w-3.5 text-sky-700" />
                      <OrigenBadge origen={c.origen} />
                    </span>
                    <span className="text-xs text-steel-500">{c.cargo}</span>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="block text-xs font-medium text-sky-700 hover:underline">
                        {c.email}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-steel-600">
                    {c.empresa}
                    <span className="block text-[11px] text-steel-400">{SECTOR_LABEL[c.sector]}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm">
                    <span className="font-mono text-steel-700">{c.fono || '—'}</span>
                    <span className="mt-1 flex gap-2">
                      {tel && <a href={tel} className="text-xs font-semibold text-navy-700 hover:underline">Llamar</a>}
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline">
                          WhatsApp
                        </a>
                      )}
                    </span>
                  </td>
                  <td className="max-w-52 px-3 py-2 text-xs">
                    {linked.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {linked.slice(0, 2).map((pid) => (
                          <Link key={pid} to={`/proyectos/${pid}`} className="rounded bg-sky-50 px-1.5 py-0.5 font-medium text-sky-700 hover:underline">
                            {pid}
                          </Link>
                        ))}
                        {linked.length > 2 && <span className="text-steel-400">+{linked.length - 2}</span>}
                      </span>
                    ) : (
                      <span className="text-steel-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <CrmManager contactKey={realKey(c)} title={c.nombre} subtitle={`${c.cargo} · ${c.empresa}`} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-steel-500">
                  No hay contactos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-steel-400">
        Contactos reales de la BBDD comercial de ARCANCHILE (prospección LinkedIn + asistentes al evento Pipeline II de
        MineGroup). Todos parten en estado <strong>Pendiente</strong>. Cada cambio de estado exige una nota y queda registrado
        con fecha y usuario en el historial del contacto. Teléfonos con llamada/WhatsApp; correos con enlace directo.
      </p>
    </>
  );
}

// ───────────────────────── Perfiles objetivo (cargos) ─────────────────────────
function PerfilesView() {
  const { stateOf } = useApp();
  const [empresa, setEmpresa] = useState('');
  const [nivel, setNivel] = useState('');
  const [prioridad, setPrioridad] = useState('1');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return allContacts.filter((f) => {
      if (empresa && f.c.empresa !== empresa) return false;
      if (nivel && f.c.nivel !== nivel) return false;
      if (prioridad && String(f.c.prioridad) !== prioridad) return false;
      if (text) {
        const hay = `${f.projectName} ${f.c.empresa} ${f.c.cargo}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }
      return true;
    });
  }, [empresa, nivel, prioridad, q]);

  const sorted = [...filtered].sort(
    (a, b) => a.c.prioridad - b.c.prioridad || a.projectName.localeCompare(b.projectName, 'es'),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-steel-500">{filtered.length} perfiles de cargo en vista</p>
        <button
          onClick={() => exportContactsCsv(sorted, stateOf)}
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-navy-950 hover:bg-amber-400"
        >
          ⬇ Exportar perfiles CSV
        </button>
      </div>
      <div className="grid grid-cols-2 items-center gap-2 rounded-lg border border-steel-200 bg-white p-3 shadow-sm sm:flex sm:flex-wrap [&>select]:w-full sm:[&>select]:w-auto">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar proyecto, empresa o cargo…" className="col-span-2 w-full rounded border border-steel-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500 sm:w-auto sm:min-w-52 sm:flex-1" />
        <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Toda prioridad</option>
          <option value="1">Prioridad 1</option>
          <option value="2">Prioridad 2</option>
          <option value="3">Prioridad 3</option>
        </select>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Todo nivel</option>
          {NIVELES.map((n) => (<option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>))}
        </select>
        <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="max-w-56 rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500">
          <option value="">Toda empresa</option>
          {empresasList.map((e) => (<option key={e} value={e}>{e}</option>))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-steel-200 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] border-collapse">
          <thead className="border-b-2 border-navy-900 bg-steel-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Proyecto</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Empresa</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Cargo objetivo</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Canal sugerido</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado / gestión</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f: FlatContact) => (
              <tr key={f.key} className="border-b border-steel-100 align-top hover:bg-amber-50/50">
                <td className="px-3 py-2 text-sm">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {f.categoria === 'pipeline' && <PipeBadge compact />}
                    <Link to={`/proyectos/${f.projectId}`} className="font-semibold text-navy-900 hover:text-amber-600 hover:underline">
                      {f.projectName}
                    </Link>
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-steel-600">{f.c.empresa}</td>
                <td className="px-3 py-2 text-sm">
                  <span className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">{f.c.prioridad}</span>
                    {f.c.cargo}
                    <ContactoNivelBadge nivel={f.c.nivel} />
                  </span>
                  <span className="mt-0.5 block max-w-md text-xs text-steel-500">{f.c.objetivo}</span>
                </td>
                <td className="max-w-64 px-3 py-2 text-xs text-steel-600">{f.c.canalSugerido}</td>
                <td className="px-3 py-2">
                  <CrmManager contactKey={f.key} title={f.c.cargo} subtitle={`${f.c.empresa} · ${f.projectName}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
