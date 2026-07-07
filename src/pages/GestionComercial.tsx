import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { allContacts, empresasList, exportContactsCsv } from '../lib/contactos';
import type { FlatContact } from '../lib/contactos';
import { CRM_LABEL, CRM_STATES } from '../data/types';
import type { ContactoNivel, CrmState } from '../data/types';
import { useApp } from '../context/AppContext';
import { ContactoNivelBadge, KpiCard, LinkedInIcon, PipeBadge, SectionTitle } from '../components/ui';
import { CrmControl } from '../components/CrmControl';

const FUNNEL: { state: CrmState; color: string }[] = [
  { state: 'pendiente', color: '#94a3b8' },
  { state: 'contactado', color: '#0ea5e9' },
  { state: 'reunion', color: '#f59e0b' },
  { state: 'propuesta', color: '#8b5cf6' },
  { state: 'seguimiento', color: '#10b981' },
];

const NIVELES: ContactoNivel[] = ['decisor', 'influenciador', 'tecnico', 'acceso'];

export function GestionComercial() {
  const { crm } = useApp();
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
        const hay = `${f.projectName} ${f.c.empresa} ${f.c.cargo} ${f.c.departamento}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }
      return true;
    });
  }, [empresa, nivel, prioridad, q]);

  const counts = useMemo(() => {
    const acc: Record<CrmState, number> = { pendiente: 0, contactado: 0, reunion: 0, propuesta: 0, seguimiento: 0 };
    for (const f of filtered) acc[stateOf(f.key)] += 1;
    return acc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, crm]);

  const maxFunnel = Math.max(1, ...FUNNEL.map((s) => counts[s.state]));

  const sorted = [...filtered].sort(
    (a, b) => a.c.prioridad - b.c.prioridad || a.projectName.localeCompare(b.projectName, 'es'),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Gestión comercial · CRM de contactos</h1>
          <p className="text-sm text-steel-500">
            Cargos clave por proyecto para agendar reuniones y presentar a ARCANCHILE · {filtered.length} contactos en vista
          </p>
        </div>
        <button
          onClick={() => exportContactsCsv(sorted, stateOf)}
          className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-navy-950 hover:bg-amber-400"
        >
          ⬇ Exportar contactos CSV
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Pendientes" value={counts.pendiente} sub="sin gestionar" />
        <KpiCard label="Contactados" value={counts.contactado} />
        <KpiCard label="Reuniones agendadas" value={counts.reunion} accent />
        <KpiCard label="Propuestas enviadas" value={counts.propuesta} />
        <KpiCard label="En seguimiento" value={counts.seguimiento} />
      </div>

      {/* Funnel */}
      <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
        <SectionTitle>Embudo de gestión (vista actual)</SectionTitle>
        <div className="space-y-2">
          {FUNNEL.map((s) => (
            <div key={s.state} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-xs font-semibold text-steel-600">{CRM_LABEL[s.state]}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-steel-100">
                <div
                  className="flex h-full items-center justify-end rounded px-2 text-[11px] font-bold text-white transition-all"
                  style={{ width: `${Math.max(6, (counts[s.state] / maxFunnel) * 100)}%`, backgroundColor: s.color }}
                >
                  {counts[s.state]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-steel-200 bg-white p-3 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar proyecto, empresa o cargo…"
          className="min-w-52 flex-1 rounded border border-steel-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500"
        />
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500"
        >
          <option value="">Toda prioridad</option>
          <option value="1">Prioridad 1 (contactar primero)</option>
          <option value="2">Prioridad 2</option>
          <option value="3">Prioridad 3</option>
        </select>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500"
        >
          <option value="">Todo nivel</option>
          {NIVELES.map((n) => (
            <option key={n} value={n}>
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className="max-w-56 rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500"
        >
          <option value="">Toda empresa</option>
          {empresasList.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        {(q || empresa || nivel || prioridad !== '1') && (
          <button
            onClick={() => {
              setQ('');
              setEmpresa('');
              setNivel('');
              setPrioridad('1');
            }}
            className="text-sm font-medium text-steel-500 underline hover:text-navy-800"
          >
            Reiniciar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-steel-200 bg-white shadow-sm">
        <table className="w-full min-w-[1040px] border-collapse">
          <thead className="border-b-2 border-navy-900 bg-steel-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Proyecto</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Empresa</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Cargo prioritario</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Canal sugerido</th>
              <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado de contacto</th>
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
                  <span className="text-xs text-steel-500">{f.sector}</span>
                </td>
                <td className="px-3 py-2 text-sm text-steel-600">{f.c.empresa}</td>
                <td className="px-3 py-2 text-sm">
                  <span className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-[11px] font-bold text-white" title={`Prioridad ${f.c.prioridad}`}>
                      {f.c.prioridad}
                    </span>
                    {f.c.cargo}
                    <ContactoNivelBadge nivel={f.c.nivel} />
                    {f.c.nivel !== 'acceso' && <LinkedInIcon className="h-3.5 w-3.5 text-sky-700" />}
                  </span>
                  <span className="mt-0.5 block max-w-md text-xs text-steel-500">{f.c.objetivo}</span>
                </td>
                <td className="max-w-64 px-3 py-2 text-xs text-steel-600">{f.c.canalSugerido}</td>
                <td className="px-3 py-2">
                  <CrmControl contactKey={f.key} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
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
        Los contactos son <strong>cargos genéricos</strong> adaptados al tipo de empresa y al contexto del proyecto, no
        personas reales. El estado CRM se guarda localmente en este navegador.
      </p>
    </div>
  );
}
