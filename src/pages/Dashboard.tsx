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
import { projects } from '../data/projects';
import {
  actionableProjects,
  activeProjects,
  fmtMusd,
  investmentBySector,
  projectsByPriority,
  projectsByStage,
  topByInvestment,
  totalInvestment,
} from '../lib/stats';
import { KpiCard, SectionTitle } from '../components/ui';
import { ChileMap } from '../components/ChileMap';

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

export function Dashboard() {
  const bySector = investmentBySector(actionableProjects);
  const byStage = projectsByStage(projects);
  const byPriority = projectsByPriority(activeProjects);
  const top10 = topByInvestment(actionableProjects, 10);
  const totalInv = totalInvestment(actionableProjects);
  const regions = new Set(activeProjects.map((p) => p.region));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Dashboard de mercado 2026-2030</h1>
        <p className="text-sm text-steel-500">
          Cartera Cochilco 2025-2034: US$104.549M (+25,7%, récord en 11 años) · Catastro CBC: 853 proyectos por US$87.702M ·
          Corte de investigación: 7-jul-2026
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Oportunidades activas" value={activeProjects.length} sub="proyectos y contratos catalogados" />
        <KpiCard
          label="Inversión identificada"
          value={fmtMusd(totalInv)}
          sub="excluye desistidos y suspendidos"
          accent
        />
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
        <KpiCard label="Sectores cubiertos" value={bySector.length} sub="minería lidera con 41% del catastro CBC" />
        <KpiCard label="Regiones con proyectos" value={regions.size} sub="foco: Antofagasta (US$40.209M Cochilco)" />
      </div>

      {/* Fila de gráficos 1 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm xl:col-span-2">
          <SectionTitle>Inversión identificada por sector (MUSD)</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bySector} margin={{ top: 5, right: 10, left: 10, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: '#475569' }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value, name) => (name === 'inversion' ? [fmtMusd(Number(value)), 'Inversión'] : [value, name])}
                labelStyle={{ fontWeight: 700 }}
              />
              <Bar dataKey="inversion" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
          <SectionTitle>Proyectos por estado</SectionTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byStage}
                dataKey="count"
                nameKey="stage"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
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

      {/* Fila de gráficos 2 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-steel-200 bg-white p-4 shadow-sm">
          <SectionTitle>Top 10 proyectos por inversión (MUSD)</SectionTitle>
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
              <Bar dataKey="investmentMUSD" fill="#1e4265" radius={[0, 3, 3, 0]} />
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
            Distribución regional
          </SectionTitle>
          <ChileMap list={actionableProjects} />
        </div>
      </div>
    </div>
  );
}
