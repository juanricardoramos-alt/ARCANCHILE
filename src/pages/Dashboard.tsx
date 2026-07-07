import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  actionableProjects,
  activeProjects,
  categoriaBySector,
  fmtMusd,
  investmentBySector,
  projectsByPriority,
  projectsByStage,
  relevanciaCounts,
  topByInvestment,
  totalInvestment,
} from '../lib/stats';
import { contactosReales, realStateOf } from '../lib/realContacts';
import type { Categoria, CrmState } from '../data/types';
import { CRM_LABEL } from '../data/types';
import { KpiCard, PipeIcon, SectionTitle } from '../components/ui';
import { ChileMap } from '../components/ChileMap';
import { useApp } from '../context/AppContext';

const STAGE_COLORS: Record<string, string> = {
  'Estudio / Prefactibilidad': '#94a3b8',
  'EIA en trámite': '#5583b6',
  'Aprobado (RCA/FID)': '#10b981',
  'En licitación': '#f59e0b',
  Construcción: '#1e4265',
  'Puesta en marcha': '#06b6d4',
  Operación: '#047857',
  Recurrente: '#64748b',
  'Suspendido / En riesgo': '#ea580c',
  Desistido: '#b91c1c',
};

type Scope = 'todos' | Categoria;

const PIPE_BLUE = '#0369a1';
const OTROS_GRAY = '#94a3b8';

const FUNNEL: { state: CrmState; color: string }[] = [
  { state: 'pendiente', color: '#94a3b8' },
  { state: 'contactado', color: '#0ea5e9' },
  { state: 'reunion', color: '#f59e0b' },
  { state: 'propuesta', color: '#8b5cf6' },
  { state: 'seguimiento', color: '#10b981' },
];

export function Dashboard() {
  const [scope, setScope] = useState<Scope>('todos');
  const { crm } = useApp();

  // CRM: contactos reales de la BBDD
  const crmCounts: Record<CrmState, number> = { pendiente: 0, contactado: 0, reunion: 0, propuesta: 0, seguimiento: 0 };
  for (const c of contactosReales) crmCounts[realStateOf(crm, c)] += 1;
  const maxFunnel = Math.max(1, ...FUNNEL.map((s) => crmCounts[s.state]));

  const inScope = (categoria: Categoria) => scope === 'todos' || scope === categoria;
  const scActive = activeProjects.filter((p) => inScope(p.categoria));
  const scActionable = actionableProjects.filter((p) => inScope(p.categoria));

  const bySector = investmentBySector(scActionable);
  const byStage = projectsByStage(scActive);
  const byPriority = projectsByPriority(scActive);
  const top10 = topByInvestment(scActionable, 10);
  const totalInv = totalInvestment(scActionable);
  const regions = new Set(scActive.map((p) => p.region));
  const stacked = categoriaBySector(actionableProjects);

  // Comparación Pipeline vs Otros (siempre ambos, independiente del filtro)
  const pipeActive = activeProjects.filter((p) => p.categoria === 'pipeline');
  const otrosActiveList = activeProjects.filter((p) => p.categoria === 'otros');
  const pipeInv = totalInvestment(actionableProjects.filter((p) => p.categoria === 'pipeline'));
  const otrosInv = totalInvestment(actionableProjects.filter((p) => p.categoria === 'otros'));
  const rel = relevanciaCounts(pipeActive);

  const scopeLabel = scope === 'pipeline' ? 'Core Pipeline' : scope === 'otros' ? 'Otros proyectos' : 'todos los sectores';

  const tabs: { key: Scope; label: string; icon?: boolean }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pipeline', label: 'Core ARCANCHILE (Pipeline)', icon: true },
    { key: 'otros', label: 'Otros Proyectos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Dashboard de mercado 2026-2030</h1>
        <p className="text-sm text-steel-500">
          Cartera Cochilco 2025-2034: US$104.549M (+25,7%, récord en 11 años) · Catastro CBC: 853 proyectos por US$87.702M ·
          Corte de investigación: 7-jul-2026
        </p>
      </div>

      {/* Filtro principal Pipeline / Otros / Todos */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-steel-200 bg-white p-2 shadow-sm">
        <span className="px-2 text-xs font-bold uppercase tracking-wide text-steel-400">Ver:</span>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setScope(t.key)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold transition-colors ${
              scope === t.key
                ? t.key === 'pipeline'
                  ? 'bg-sky-700 text-white'
                  : 'bg-navy-900 text-white'
                : 'text-steel-600 hover:bg-steel-100'
            }`}
          >
            {t.icon && <PipeIcon className="h-4 w-4" />}
            {t.label}
          </button>
        ))}
        <Link
          to="/pipeline"
          className="ml-auto text-xs font-semibold text-sky-700 hover:underline"
        >
          Ir a Oportunidades Pipeline →
        </Link>
      </div>

      {/* KPIs (scoped) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label={`Oportunidades (${scopeLabel})`} value={scActive.length} sub="activas, excluye desistidos" />
        <KpiCard label="Inversión identificada" value={fmtMusd(totalInv)} sub="excluye desistidos y suspendidos" accent />
        <KpiCard
          label="Por prioridad"
          value={
            <span className="flex items-center gap-2 text-lg">
              <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-700">A {byPriority.A}</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-700">B {byPriority.B}</span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">C {byPriority.C}</span>
            </span>
          }
          sub="A: 0-6 meses · B: 6-18 · C: 2028+"
        />
        <KpiCard label="Sectores" value={bySector.length} sub="minería lidera el catastro CBC (41%)" />
        <KpiCard label="Regiones con proyectos" value={regions.size} sub="foco: Antofagasta (US$40.209M Cochilco)" />
      </div>

      {/* Comparación Pipeline vs Otros (siempre ambos) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border-2 border-sky-300 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-sky-800">
              <PipeIcon className="h-5 w-5" /> Core ARCANCHILE · Pipeline / Ductos
            </span>
            <Link to="/pipeline" className="text-xs font-semibold text-sky-700 hover:underline">
              Ver detalle →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <div className="text-3xl font-black text-sky-900">{pipeActive.length}</div>
              <div className="text-xs text-steel-500">oportunidades con piping</div>
            </div>
            <div>
              <div className="text-3xl font-black text-sky-900">{fmtMusd(pipeInv)}</div>
              <div className="text-xs text-steel-500">inversión asociada</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-sky-700 px-2.5 py-1 font-bold text-white">Alta {rel.alta}</span>
            <span className="rounded-full bg-sky-500 px-2.5 py-1 font-bold text-white">Media {rel.media}</span>
            <span className="text-steel-500">Alta = ductos puros · Media = incluye piping de proceso</span>
          </div>
        </div>

        <div className="rounded-lg border border-steel-300 bg-white p-4 shadow-sm">
          <div className="text-sm font-black uppercase tracking-wide text-steel-600">Otros proyectos (fuera del core)</div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <div className="text-3xl font-black text-steel-700">{otrosActiveList.length}</div>
              <div className="text-xs text-steel-500">sin componente de ductos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-steel-700">{fmtMusd(otrosInv)}</div>
              <div className="text-xs text-steel-500">inversión asociada</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-steel-500">
            Transmisión eléctrica, BESS, obras civiles, puertos, edificación y monitoreo geotécnico sin ductos. Se rastrean
            para alianzas y subcontratos, pero no son el foco de ARCANCHILE.
          </p>
        </div>
      </div>

      {/* Gestión comercial: contactos por gestionar + mini funnel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">Contactos por gestionar</div>
          <div className="mt-1 text-4xl font-black text-navy-900">{crmCounts.pendiente}</div>
          <div className="mt-1 text-xs text-steel-500">de {contactosReales.length} contactos reales en la BBDD</div>
          <Link to="/gestion-comercial" className="mt-3 inline-block text-xs font-bold text-amber-600 hover:underline">
            Ir a gestión comercial →
          </Link>
        </div>
        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm md:col-span-2">
          <SectionTitle>Embudo de gestión comercial · contactos reales de la BBDD</SectionTitle>
          <div className="space-y-1.5">
            {FUNNEL.map((s) => (
              <div key={s.state} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs font-semibold text-steel-600">{CRM_LABEL[s.state]}</span>
                <div className="h-5 flex-1 overflow-hidden rounded bg-steel-100">
                  <div
                    className="flex h-full items-center justify-end rounded px-2 text-[11px] font-bold text-white"
                    style={{ width: `${Math.max(5, (crmCounts[s.state] / maxFunnel) * 100)}%`, backgroundColor: s.color }}
                  >
                    {crmCounts[s.state]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos: sector + estado */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm xl:col-span-2">
          <SectionTitle>Inversión identificada por sector · {scopeLabel} (MUSD)</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bySector} margin={{ top: 5, right: 10, left: 10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#475569' }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value, name) => (name === 'inversion' ? [fmtMusd(Number(value)), 'Inversión'] : [value, name])}
                labelStyle={{ fontWeight: 700 }}
              />
              <Bar dataKey="inversion" fill={scope === 'pipeline' ? PIPE_BLUE : '#f59e0b'} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
          <SectionTitle>Proyectos por estado</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={byStage} dataKey="count" nameKey="stage" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byStage.map((s) => (
                  <Cell key={s.stage} fill={STAGE_COLORS[s.stage] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} proyecto(s)`, name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribución Pipeline vs Otros por sector (siempre todos) */}
      <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
        <SectionTitle>Distribución Pipeline vs Otros por sector (n° de proyectos)</SectionTitle>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={stacked} margin={{ top: 5, right: 10, left: 10, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#475569' }} angle={-25} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
            <Tooltip labelStyle={{ fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="pipeline" stackId="a" name="Core Pipeline" fill={PIPE_BLUE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="otros" stackId="a" name="Otros" fill={OTROS_GRAY} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 + mapa */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
          <SectionTitle
            right={
              <span className="flex items-center gap-3 text-[11px] text-steel-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: PIPE_BLUE }} /> Pipeline
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: OTROS_GRAY }} /> Otros
                </span>
              </span>
            }
          >
            Top 10 proyectos por inversión · {scopeLabel} (MUSD)
          </SectionTitle>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <YAxis
                type="category"
                dataKey="name"
                width={210}
                tick={{ fontSize: 10.5, fill: '#334155' }}
                tickFormatter={(v: string) => (v.length > 34 ? `${v.slice(0, 33)}…` : v)}
              />
              <Tooltip formatter={(value) => [fmtMusd(Number(value)), 'Inversión']} labelStyle={{ fontWeight: 700 }} />
              <Bar dataKey="investmentMUSD" radius={[0, 3, 3, 0]}>
                {top10.map((p) => (
                  <Cell key={p.id} fill={p.categoria === 'pipeline' ? PIPE_BLUE : OTROS_GRAY} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
          <SectionTitle
            right={
              <Link to="/catalogo" className="text-xs font-semibold text-amber-600 hover:underline">
                Ver catálogo completo →
              </Link>
            }
          >
            Distribución regional · {scopeLabel}
          </SectionTitle>
          <ChileMap list={scActionable} />
        </div>
      </div>
    </div>
  );
}
