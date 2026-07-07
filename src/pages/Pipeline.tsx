import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { pipelineActive } from '../lib/stats';
import { fmtMusd, totalInvestment } from '../lib/stats';
import { PIPELINE_SERVICE_ORDER } from '../data/types';
import type { PipelineServiceCategory, Priority } from '../data/types';
import { KpiCard, NormativaChip, PipeIcon, PriorityBadge, RelevanceIndicator, StageBadge } from '../components/ui';

const SERVICE_DESC: Record<PipelineServiceCategory, string> = {
  'Diseño / Ingeniería de ductos':
    'Ingeniería conceptual, básica y de detalle; ruteo, isométricos, análisis de flexibilidad y stress, soportes y selección de materiales.',
  'Inspección END de soldaduras': 'UT, PAUT, TOFD, RT, MT, PT y VT en soldaduras de ductos y cañerías (API 1104 / ASME IX).',
  'QA/QC de piping': 'Aseguramiento y control de calidad en fabricación y montaje de spools y cañerías de proceso.',
  'ITO de montaje': 'Inspección técnica de obra del montaje de cañerías, ductos, estanques y equipos a presión.',
  'Inspección en servicio': 'API 570/574 (cañerías), API 510 (equipos a presión), API 653 (estanques) y API 579 (fitness for service).',
  'Comisionamiento y pruebas': 'Pruebas hidrostáticas y neumáticas, limpieza, precomisionamiento y puesta en marcha de sistemas de piping.',
};

const PRIORITY_RANK: Record<Priority, number> = { A: 0, B: 1, C: 2 };

export function Pipeline() {
  const [openCat, setOpenCat] = useState<PipelineServiceCategory | 'all'>('all');

  const groups = useMemo(() => {
    return PIPELINE_SERVICE_ORDER.map((cat) => {
      const list = pipelineActive
        .filter((p) => p.pipelineServices.includes(cat))
        .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (b.investmentMUSD ?? -1) - (a.investmentMUSD ?? -1));
      return { cat, list };
    });
  }, []);

  const alta = pipelineActive.filter((p) => p.relevanciaArcanchile === 'alta').length;
  const media = pipelineActive.filter((p) => p.relevanciaArcanchile === 'media').length;
  const prioA = pipelineActive.filter((p) => p.priority === 'A').length;
  const inv = totalInvestment(pipelineActive.filter((p) => p.stage !== 'Suspendido / En riesgo'));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-black text-sky-900">
          <PipeIcon className="h-7 w-7" /> Oportunidades Pipeline / Ductos
        </h1>
        <p className="mt-1 text-sm text-steel-600">
          El core de ARCANCHILE: ingeniería e inspección de ductos, cañerías de proceso, mineroductos, acueductos,
          salmueroductos, gasoductos y equipos a presión. Organizado por tipo de servicio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Oportunidades Pipeline" value={pipelineActive.length} sub="con componente de ductos/piping" accent />
        <KpiCard label="Inversión asociada" value={fmtMusd(inv)} sub="excluye suspendidos" />
        <KpiCard
          label="Por relevancia"
          value={
            <span className="flex items-center gap-2 text-lg">
              <span className="rounded bg-sky-700 px-2 py-0.5 text-sm font-bold text-white">Alta {alta}</span>
              <span className="rounded bg-sky-500 px-2 py-0.5 text-sm font-bold text-white">Media {media}</span>
            </span>
          }
          sub="alta = ductos puros"
        />
        <KpiCard label="Acción inmediata" value={prioA} sub="prioridad A (0-6 meses)" />
      </div>

      {/* Filtro por tipo de servicio */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setOpenCat('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
            openCat === 'all' ? 'bg-sky-700 text-white' : 'border border-sky-300 bg-white text-sky-700 hover:bg-sky-50'
          }`}
        >
          Todos los servicios
        </button>
        {PIPELINE_SERVICE_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => setOpenCat(c)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              openCat === c ? 'bg-sky-700 text-white' : 'border border-sky-300 bg-white text-sky-700 hover:bg-sky-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grupos por servicio */}
      <div className="space-y-6">
        {groups
          .filter((g) => openCat === 'all' || g.cat === openCat)
          .map((g) => (
            <div key={g.cat} className="rounded-lg border border-steel-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-steel-200 bg-sky-50 px-4 py-3">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-sky-800">
                    <PipeIcon className="h-4 w-4" /> {g.cat}
                    <span className="rounded-full bg-sky-700 px-2 py-0.5 text-xs text-white">{g.list.length}</span>
                  </h2>
                  <p className="mt-0.5 max-w-3xl text-xs text-steel-500">{SERVICE_DESC[g.cat]}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead className="border-b border-steel-200 bg-steel-50">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">P.</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Proyecto</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Relev.</th>
                      <th className="px-3 py-2 text-right text-xs font-bold uppercase text-navy-800">Inversión</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Cuándo se necesita</th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Normativas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.list.map((p) => (
                      <tr key={p.id} className="border-b border-steel-100 hover:bg-sky-50/50">
                        <td className="px-3 py-2">
                          <PriorityBadge priority={p.priority} />
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <Link to={`/proyectos/${p.id}`} className="font-semibold text-navy-900 hover:text-sky-700 hover:underline">
                            {p.name}
                          </Link>
                          <div className="text-xs text-steel-500">{p.owner} · {p.region}</div>
                        </td>
                        <td className="px-3 py-2">
                          <RelevanceIndicator r={p.relevanciaArcanchile} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-bold text-navy-800">
                          {fmtMusd(p.investmentMUSD)}
                        </td>
                        <td className="max-w-64 px-3 py-2 text-xs text-steel-600">
                          <StageBadge stage={p.stage} />
                          <div className="mt-1">{p.timeline}</div>
                        </td>
                        <td className="max-w-52 px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {p.normativas.slice(0, 4).map((n) => (
                              <NormativaChip key={n} label={n} />
                            ))}
                            {p.normativas.length > 4 && (
                              <span className="text-[11px] text-steel-400">+{p.normativas.length - 4}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {g.list.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-steel-500">
                          Sin oportunidades en esta categoría.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      <p className="text-[11px] text-steel-400">
        Un proyecto puede aparecer en varias categorías de servicio. "Cuándo se necesita" combina el estado del proyecto con
        su ventana de contratación. La clasificación pipeline es análisis propio de ARCANCHILE, no dato de fuente.
      </p>
    </div>
  );
}
