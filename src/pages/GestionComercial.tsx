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
import { CRM_LABEL, SECTOR_LABEL } from '../data/types';
import type { ContactoNivel, ContactOrigen, ContactSector, CrmState } from '../data/types';
import { useApp } from '../context/AppContext';
import { ContactoNivelBadge, KpiCard, LinkedInIcon, OrigenBadge, PipeBadge, SectionTitle } from '../components/ui';
import { CrmControl } from '../components/CrmControl';

const FUNNEL: { state: CrmState; color: string }[] = [
  { state: 'pendiente', color: '#94a3b8' },
  { state: 'contactado', color: '#0ea5e9' },
  { state: 'reunion', color: '#f59e0b' },
  { state: 'propuesta', color: '#8b5cf6' },
  { state: 'seguimiento', color: '#10b981' },
];

const NIVELES: ContactoNivel[] = ['decisor', 'influenciador', 'tecnico', 'acceso'];
const SECTORES: ContactSector[] = ['MINERO', 'EPC', 'ENERGIA', 'OIL_GAS', 'PIPELINE', 'AGUA', 'CELULOSA', 'INSPECCION', 'INDUSTRIAL'];

export function GestionComercial() {
  const { crm } = useApp();
  const [mode, setMode] = useState<'reales' | 'perfiles'>('reales');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Gestión comercial · CRM de contactos</h1>
          <p className="text-sm text-steel-500">
            {mode === 'reales'
              ? `${contactosReales.length} contactos reales de ARCANCHILE (BBDD LinkedIn + asistentes al evento Pipeline II)`
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

      {mode === 'reales' ? <RealesView crm={crm} /> : <PerfilesView crm={crm} />}
    </div>
  );
}

// ───────────────────────── Contactos reales (BBDD) ─────────────────────────
function RealesView({ crm }: { crm: Record<string, CrmState> }) {
  const [q, setQ] = useState('');
  const [origen, setOrigen] = useState('');
  const [sector, setSector] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [nivel, setNivel] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [estado, setEstado] = useState('');
  const [soloVinculados, setSoloVinculados] = useState(false);

  const stateOf = (c: (typeof contactosReales)[number]) => realStateOf(crm, c);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return contactosReales.filter((c) => {
      if (origen && c.origen !== origen && !(origen === 'Pipeline II' && c.origen === 'Ambas') && !(origen === 'LinkedIn' && c.origen === 'Ambas')) return false;
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
  }, [q, origen, sector, empresa, nivel, prioridad, estado, soloVinculados, crm]);

  const counts = useMemo(() => {
    const acc: Record<CrmState, number> = { pendiente: 0, contactado: 0, reunion: 0, propuesta: 0, seguimiento: 0 };
    for (const c of filtered) acc[stateOf(c)] += 1;
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, crm]);
  const maxFunnel = Math.max(1, ...FUNNEL.map((s) => counts[s.state]));

  return (
    <>
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
        <KpiCard label="Contactados" value={counts.contactado} />
        <KpiCard label="Reuniones agendadas" value={counts.reunion} accent />
        <KpiCard label="Propuestas enviadas" value={counts.propuesta} />
        <KpiCard label="En seguimiento" value={counts.seguimiento} />
      </div>

      <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
        <SectionTitle>Embudo de gestión (vista actual)</SectionTitle>
        <div className="space-y-2">
          {FUNNEL.map((s) => (
            <div key={s.state} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-xs font-semibold text-steel-600">{CRM_LABEL[s.state]}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-steel-100">
                <div
                  className="flex h-full items-center justify-end rounded px-2 text-[11px] font-bold text-white"
                  style={{ width: `${Math.max(4, (counts[s.state] / maxFunnel) * 100)}%`, backgroundColor: s.color }}
                >
                  {counts[s.state]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          {FUNNEL.map((s) => (
            <option key={s.state} value={s.state}>{CRM_LABEL[s.state]}</option>
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
        {filtered.map((c) => {
          const tel = telHref(c.fono);
          const wa = waHref(c.fono);
          return (
            <div key={c.id} className="rounded-lg border border-steel-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white">{c.prioridad}</span>
                    <span className="font-bold text-navy-900">{c.nombre}</span>
                    <LinkedInIcon className="h-3.5 w-3.5 text-sky-700" />
                  </div>
                  <div className="mt-0.5 text-xs text-steel-600">{c.cargo}</div>
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
              {c.nota && <div className="mt-2 text-[11px] text-steel-500">{c.nota}</div>}
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
                <span className="ml-auto">
                  <CrmControl contactKey={realKey(c)} initial={c.crmInicial} />
                </span>
              </div>
            </div>
          );
        })}
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
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Nota BBDD</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado</th>
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
                  <td className="max-w-56 px-3 py-2 text-xs text-steel-500">{c.nota || '—'}</td>
                  <td className="px-3 py-2">
                    <CrmControl contactKey={realKey(c)} initial={c.crmInicial} />
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-steel-500">
                  No hay contactos para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-steel-400">
        Contactos reales de la BBDD comercial de ARCANCHILE (prospección LinkedIn + asistentes al evento Pipeline II de
        MineGroup). El estado inicial se derivó de las notas de gestión originales; los cambios se guardan localmente en este
        navegador. Teléfonos habilitados para llamada y WhatsApp; correos con enlace directo.
      </p>
    </>
  );
}

// ───────────────────────── Perfiles objetivo (cargos) ─────────────────────────
function PerfilesView({ crm }: { crm: Record<string, CrmState> }) {
  const stateOf = (key: string): CrmState => crm[key] ?? 'pendiente';
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
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-steel-200 bg-white p-3 shadow-sm">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar proyecto, empresa o cargo…" className="min-w-52 flex-1 rounded border border-steel-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500" />
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
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado</th>
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
                  <CrmControl contactKey={f.key} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
