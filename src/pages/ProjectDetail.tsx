import { Link, useParams } from 'react-router-dom';
import { enrichedProjects } from '../data/enriched';
import { fmtMusd } from '../lib/stats';
import { contactKey } from '../lib/contactos';
import { realByProject, realKey, realStateOf, telHref, waHref } from '../lib/realContacts';
import { SECTOR_LABEL } from '../data/types';
import {
  ContactoNivelBadge,
  CrmBadge,
  LinkedInIcon,
  OrigenBadge,
  NormativaChip,
  PipeBadge,
  PipeIcon,
  PipelineServiceChip,
  PriorityBadge,
  RelevanceIndicator,
  SectionTitle,
  ServiceChip,
  StageBadge,
  UnconfirmedFlag,
} from '../components/ui';
import { CrmControl } from '../components/CrmControl';
import { useApp } from '../context/AppContext';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { contacted, toggleContacted, crm } = useApp();
  const project = enrichedProjects.find((p) => p.id === id);

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

  const related = enrichedProjects
    .filter((p) => p.sector === project.sector && p.id !== project.id && p.stage !== 'Desistido')
    .sort((a, b) => (b.investmentMUSD ?? -1) - (a.investmentMUSD ?? -1))
    .slice(0, 4);

  const isContacted = contacted.has(project.id);
  const isPipeline = project.categoria === 'pipeline';
  const contactos = [...project.contactosClave].sort(
    (a, b) => a.prioridad - b.prioridad || a.empresa.localeCompare(b.empresa, 'es'),
  );
  const realcontactos = realByProject[project.id] ?? [];
  const realTop = realcontactos.slice(0, 8);

  return (
    <div className="space-y-6">
      <Link to="/catalogo" className="text-sm font-semibold text-steel-500 hover:text-navy-800">
        ← Volver al catálogo
      </Link>

      <div className={`rounded-lg border bg-white p-6 shadow-sm ${isPipeline ? 'border-sky-300 border-t-4 border-t-sky-500' : 'border-steel-200'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={project.priority} size="lg" />
              <StageBadge stage={project.stage} />
              {isPipeline && <PipeBadge />}
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

        {/* Componente Pipeline / Ductos */}
        {isPipeline ? (
          <div className="mt-6 rounded-lg border-2 border-sky-200 bg-sky-50/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-sky-800">
                <PipeIcon className="h-5 w-5" /> Componente Pipeline / Ductos
              </h2>
              <RelevanceIndicator r={project.relevanciaArcanchile} showLabel />
            </div>
            <p className="text-sm text-steel-700">{project.pipelineComponent}</p>

            {project.pipelineServices.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-steel-500">
                  Servicios de ductos de ARCANCHILE que aplican
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.pipelineServices.map((s) => (
                    <PipelineServiceChip key={s} label={s} />
                  ))}
                </div>
              </div>
            )}

            {project.normativas.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wide text-steel-500">Normativas aplicables</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.normativas.map((n) => (
                    <NormativaChip key={n} label={n} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-steel-200 bg-steel-50 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-steel-600">Componente Pipeline / Ductos</h2>
            <p className="mt-1 text-sm text-steel-500">
              Este proyecto está <strong>fuera del core de ductos/pipeline</strong> de ARCANCHILE (transmisión, obra civil,
              edificación o monitoreo sin cañerías). Se rastrea para posibles alianzas o servicios complementarios.
            </p>
          </div>
        )}

        {/* Contactos reales de la BBDD */}
        {realcontactos.length > 0 && (
          <div className="mt-6 rounded-lg border-2 border-emerald-200 bg-emerald-50/40 p-4">
            <SectionTitle
              right={
                <Link to="/gestion-comercial" className="text-xs font-semibold text-emerald-700 hover:underline">
                  {realcontactos.length} en la BBDD · ver CRM →
                </Link>
              }
            >
              Contactos reales de la BBDD ({realcontactos.length})
            </SectionTitle>
            <div className="overflow-x-auto rounded border border-emerald-200 bg-white">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="border-b border-steel-200 bg-steel-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Contacto</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Empresa</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Teléfono</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {realTop.map((c) => {
                    const tel = telHref(c.fono);
                    const wa = waHref(c.fono);
                    return (
                      <tr key={c.id} className="border-b border-steel-100 align-top">
                        <td className="px-3 py-2 text-sm">
                          <span className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
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
                        <td className="px-3 py-2">
                          <CrmBadge state={realStateOf(crm, c)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {realcontactos.length > realTop.length && (
              <p className="mt-2 text-xs text-steel-500">
                +{realcontactos.length - realTop.length} contactos más de esta empresa en la BBDD —{' '}
                <Link to="/gestion-comercial" className="font-semibold text-emerald-700 hover:underline">
                  gestionarlos en el CRM
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {/* Contactos Clave para Gestión Comercial (perfiles objetivo) */}
        {contactos.length > 0 && (
          <div className="mt-6">
            <SectionTitle
              right={
                <Link to="/gestion-comercial" className="text-xs font-semibold text-amber-600 hover:underline">
                  Ver CRM completo →
                </Link>
              }
            >
              Perfiles de cargo objetivo (a quién buscar)
            </SectionTitle>
            <div className="overflow-x-auto rounded-lg border border-steel-200">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="border-b border-steel-200 bg-steel-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Prio.</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Cargo / departamento</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Empresa</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Canal sugerido</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Objetivo de la reunión</th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {contactos.map((c) => (
                    <tr key={`${c.empresa}-${c.cargo}`} className="border-b border-steel-100 align-top">
                      <td className="px-3 py-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white"
                          title={`Prioridad ${c.prioridad}`}
                        >
                          {c.prioridad}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <span className="flex flex-wrap items-center gap-1.5 font-semibold text-navy-900">
                          {c.cargo}
                          <ContactoNivelBadge nivel={c.nivel} />
                          {c.nivel !== 'acceso' && <LinkedInIcon className="h-3.5 w-3.5 text-sky-700" />}
                        </span>
                        <span className="text-xs text-steel-500">{c.departamento}</span>
                      </td>
                      <td className="px-3 py-2 text-sm text-steel-600">{c.empresa}</td>
                      <td className="max-w-56 px-3 py-2 text-xs text-steel-600">{c.canalSugerido}</td>
                      <td className="max-w-md px-3 py-2 text-xs text-steel-600">{c.objetivo}</td>
                      <td className="px-3 py-2">
                        <CrmControl contactKey={contactKey(project.id, c)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-steel-400">
              Cargos genéricos según el tipo de empresa (mandante y/o EPC), no personas reales. Ordenados por prioridad de
              contacto.
            </p>
          </div>
        )}

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
                className={`group rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
                  p.categoria === 'pipeline' ? 'border-sky-300 border-l-4 border-l-sky-500' : 'border-steel-200'
                }`}
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
