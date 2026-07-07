import { useState } from 'react';
import { Link } from 'react-router-dom';
import { checklist, timelinePhases } from '../data/actionPlan';
import { enrichedProjects as projects } from '../data/enriched';
import type { Priority } from '../data/types';
import { fmtMusd } from '../lib/stats';
import { PipeBadge, PriorityBadge, SectionTitle, StageBadge } from '../components/ui';
import { useApp } from '../context/AppContext';

export function ActionPlan() {
  const { checklistDone, toggleChecklist } = useApp();
  const [prioFilter, setPrioFilter] = useState<Priority | ''>('');

  const done = checklist.filter((i) => checklistDone.has(i.id)).length;
  const pct = Math.round((done / checklist.length) * 100);

  const master = projects
    .filter((p) => p.stage !== 'Desistido')
    .filter((p) => (prioFilter ? p.priority === prioFilter : true))
    .sort((a, b) => a.priority.localeCompare(b.priority) || (b.investmentMUSD ?? -1) - (a.investmentMUSD ?? -1));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Plan de acción comercial</h1>
        <p className="text-sm text-steel-500">Plan de 90 días + checklist de habilitación + tabla maestra priorizada</p>
      </div>

      {/* Timeline 90 días */}
      <div>
        <SectionTitle>Timeline · primeros 90 días</SectionTitle>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {timelinePhases.map((ph, i) => {
            const items = checklist.filter((c) => c.phase === ph.phase);
            const phDone = items.filter((c) => checklistDone.has(c.id)).length;
            return (
              <div key={ph.phase} className="relative overflow-hidden rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: ph.color }} />
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
                    style={{ backgroundColor: ph.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-steel-500">{ph.days}</span>
                </div>
                <h3 className="mt-2 font-bold text-navy-900">{ph.title}</h3>
                <p className="mt-1 text-sm text-steel-600">{ph.summary}</p>
                <div className="mt-3 text-xs font-semibold text-steel-500">
                  {phDone}/{items.length} tareas completadas
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checklist */}
      <div>
        <SectionTitle
          right={
            <span className="text-xs font-bold text-steel-500">
              {done}/{checklist.length} · {pct}%
            </span>
          }
        >
          Checklist de registros y certificaciones
        </SectionTitle>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-steel-200">
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-6">
          {timelinePhases.map((ph) => (
            <div key={ph.phase}>
              <h3 className="mb-2 text-sm font-bold text-navy-800">
                Fase {ph.phase} · {ph.title}
              </h3>
              <ul className="space-y-2">
                {checklist
                  .filter((c) => c.phase === ph.phase)
                  .map((item) => {
                    const isDone = checklistDone.has(item.id);
                    return (
                      <li key={item.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                            isDone ? 'border-emerald-200 bg-emerald-50' : 'border-steel-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => toggleChecklist(item.id)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-amber-500"
                          />
                          <span>
                            <span className={`block font-semibold ${isDone ? 'text-emerald-800 line-through' : 'text-navy-900'}`}>
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-sm text-steel-600">{item.detail}</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla maestra */}
      <div>
        <SectionTitle
          right={
            <div className="flex gap-1">
              {(['', 'A', 'B', 'C'] as const).map((p) => (
                <button
                  key={p || 'all'}
                  onClick={() => setPrioFilter(p)}
                  className={`rounded px-2.5 py-1 text-xs font-bold ${
                    prioFilter === p
                      ? 'bg-navy-900 text-white'
                      : 'border border-steel-300 bg-white text-steel-600 hover:bg-steel-50'
                  }`}
                >
                  {p === '' ? 'Todas' : `Prioridad ${p}`}
                </button>
              ))}
            </div>
          }
        >
          Tabla maestra de oportunidades (A / B / C)
        </SectionTitle>
        <div className="overflow-x-auto rounded-lg border border-steel-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="border-b-2 border-navy-900 bg-steel-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">P.</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Oportunidad</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Mandante</th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase text-navy-800">Inversión</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Ventana / hito</th>
              </tr>
            </thead>
            <tbody>
              {master.map((p) => (
                <tr key={p.id} className="border-b border-steel-100 hover:bg-amber-50">
                  <td className="px-3 py-2">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="px-3 py-2 text-sm font-semibold text-navy-900">
                    <span className="flex flex-wrap items-center gap-1.5">
                      {p.categoria === 'pipeline' && <PipeBadge compact />}
                      <Link to={`/proyectos/${p.id}`} className="hover:text-amber-600 hover:underline">
                        {p.name}
                      </Link>
                    </span>
                  </td>
                  <td className="max-w-52 truncate px-3 py-2 text-sm text-steel-600">{p.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-bold text-navy-800">
                    {fmtMusd(p.investmentMUSD)}
                  </td>
                  <td className="px-3 py-2">
                    <StageBadge stage={p.stage} />
                  </td>
                  <td className="max-w-72 px-3 py-2 text-xs text-steel-600">{p.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
