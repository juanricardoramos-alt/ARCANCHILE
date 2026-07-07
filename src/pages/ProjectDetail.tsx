import { Link, useParams } from 'react-router-dom';
import { projects } from '../data/projects';
import { fmtMusd } from '../lib/stats';
import { PriorityBadge, SectionTitle, ServiceChip, StageBadge, UnconfirmedFlag } from '../components/ui';
import { useApp } from '../context/AppContext';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { contacted, toggleContacted } = useApp();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="rounded-lg border border-steel-200 bg-white p-8 text-center shadow-sm">
        <p className="text-steel-600">Proyecto no encontrado.</p>
        <Link to="/catalogo" className="mt-2 inline-block font-semibold text-amber-600 hover:underline">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  const related = projects
    .filter((p) => p.sector === project.sector && p.id !== project.id && p.stage !== 'Desistido')
    .sort((a, b) => (b.investmentMUSD ?? -1) - (a.investmentMUSD ?? -1))
    .slice(0, 4);

  const isContacted = contacted.has(project.id);

  return (
    <div className="space-y-6">
      <Link to="/catalogo" className="text-sm font-semibold text-steel-500 hover:text-navy-800">
        ← Volver al catálogo
      </Link>

      <div className="rounded-lg border border-steel-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={project.priority} size="lg" />
              <StageBadge stage={project.stage} />
              {project.unconfirmed && <UnconfirmedFlag />}
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight text-navy-900">{project.name}</h1>
            <p className="mt-1 text-steel-600">{project.owner}</p>
          </div>
          <button
            onClick={() => toggleContacted(project.id)}
            className={`shrink-0 rounded px-4 py-2 text-sm font-bold transition-colors ${
              isContacted
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-navy-900 text-white hover:bg-navy-700'
            }`}
          >
            {isContacted ? '✓ Contactado (desmarcar)' : 'Marcar como contactado'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-steel-200 bg-steel-50 p-3">
            <div className="text-xs font-semibold uppercase text-steel-500">Inversión</div>
            <div className="mt-0.5 text-lg font-black text-navy-900">{fmtMusd(project.investmentMUSD)}</div>
            <div className="text-xs text-steel-500">{project.investmentLabel}</div>
          </div>
          <div className="rounded border border-steel-200 bg-steel-50 p-3">
            <div className="text-xs font-semibold uppercase text-steel-500">Sector</div>
            <div className="mt-0.5 text-lg font-bold text-navy-900">{project.sector}</div>
          </div>
          <div className="rounded border border-steel-200 bg-steel-50 p-3">
            <div className="text-xs font-semibold uppercase text-steel-500">Región</div>
            <div className="mt-0.5 text-lg font-bold text-navy-900">{project.region}</div>
          </div>
          <div className="rounded border border-steel-200 bg-steel-50 p-3">
            <div className="text-xs font-semibold uppercase text-steel-500">Fuente</div>
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block truncate text-sm font-semibold text-amber-600 hover:underline"
              title={project.sourceUrl}
            >
              {project.sourceLabel} ↗
            </a>
          </div>
        </div>

        <div className="mt-6">
          <SectionTitle>Descripción</SectionTitle>
          <p className="text-steel-700">{project.description}</p>
        </div>

        <div className="mt-6">
          <SectionTitle>Cronograma / hitos</SectionTitle>
          <p className="rounded border-l-4 border-amber-500 bg-amber-50 px-4 py-2 text-sm text-steel-700">
            {project.timeline}
          </p>
        </div>

        <div className="mt-6">
          <SectionTitle>Servicios ARCANCHILE aplicables</SectionTitle>
          {project.services.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.services.map((s) => (
                <ServiceChip key={s} label={s} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-steel-500">Proyecto desistido — sin servicios aplicables por ahora.</p>
          )}
          <p className="mt-2 text-[11px] text-steel-400">
            La asignación de servicios es análisis propio del informe, no dato de fuente.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <SectionTitle>Proyectos relacionados · {project.sector}</SectionTitle>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/proyectos/${p.id}`}
                className="group rounded-lg border border-steel-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-snug text-navy-900 group-hover:text-amber-600">{p.name}</span>
                  <PriorityBadge priority={p.priority} />
                </div>
                <p className="mt-1 text-xs text-steel-500">{p.owner}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StageBadge stage={p.stage} />
                  <span className="text-sm font-black text-navy-900">{fmtMusd(p.investmentMUSD)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
