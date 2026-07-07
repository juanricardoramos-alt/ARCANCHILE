import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import type { Project } from '../data/types';
import { exportProjectsCsv, fmtMusd } from '../lib/stats';
import { PriorityBadge, ServiceChip, StageBadge, UnconfirmedFlag } from '../components/ui';
import { useApp } from '../context/AppContext';

type SortKey = 'name' | 'owner' | 'sector' | 'region' | 'investmentMUSD' | 'stage' | 'priority';

const INV_RANGES: { value: string; label: string; test: (p: Project) => boolean }[] = [
  { value: '', label: 'Cualquier inversión', test: () => true },
  { value: '0-100', label: '< US$100M', test: (p) => p.investmentMUSD !== null && p.investmentMUSD < 100 },
  { value: '100-500', label: 'US$100–500M', test: (p) => p.investmentMUSD !== null && p.investmentMUSD >= 100 && p.investmentMUSD < 500 },
  { value: '500-1000', label: 'US$500–1.000M', test: (p) => p.investmentMUSD !== null && p.investmentMUSD >= 500 && p.investmentMUSD < 1000 },
  { value: '1000-5000', label: 'US$1.000–5.000M', test: (p) => p.investmentMUSD !== null && p.investmentMUSD >= 1000 && p.investmentMUSD < 5000 },
  { value: '5000+', label: '> US$5.000M', test: (p) => p.investmentMUSD !== null && p.investmentMUSD >= 5000 },
  { value: 'nd', label: 'Sin monto publicado', test: (p) => p.investmentMUSD === null },
];

function uniqueSorted<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded border border-steel-300 bg-white px-2 py-1.5 text-sm text-steel-700 outline-none focus:border-amber-500"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Catalog() {
  const navigate = useNavigate();
  const { contacted } = useApp();
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [region, setRegion] = useState('');
  const [service, setService] = useState('');
  const [stage, setStage] = useState('');
  const [priority, setPriority] = useState('');
  const [invRange, setInvRange] = useState('');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const sectors = uniqueSorted(projects.map((p) => p.sector));
  const regions = uniqueSorted(projects.map((p) => p.region));
  const stages = uniqueSorted(projects.map((p) => p.stage));
  const services = uniqueSorted(projects.flatMap((p) => p.services));

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    const rangeTest = INV_RANGES.find((r) => r.value === invRange)?.test ?? (() => true);
    const list = projects.filter((p) => {
      if (sector && p.sector !== sector) return false;
      if (region && p.region !== region) return false;
      if (stage && p.stage !== stage) return false;
      if (priority && p.priority !== priority) return false;
      if (service && !p.services.includes(service as Project['services'][number])) return false;
      if (!rangeTest(p)) return false;
      if (text) {
        const hay = `${p.name} ${p.owner} ${p.description} ${p.region} ${p.sector} ${p.timeline}`.toLowerCase();
        if (!hay.includes(text)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'investmentMUSD') {
        cmp = (a.investmentMUSD ?? -1) - (b.investmentMUSD ?? -1);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), 'es');
      }
      if (cmp === 0) cmp = (b.investmentMUSD ?? -1) - (a.investmentMUSD ?? -1);
      return cmp * sortDir;
    });
  }, [q, sector, region, service, stage, priority, invRange, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(key === 'investmentMUSD' ? -1 : 1);
    }
  }

  const Th = ({ label, k, className = '' }: { label: string; k: SortKey; className?: string }) => (
    <th
      onClick={() => onSort(k)}
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-navy-800 hover:text-amber-600 ${className}`}
    >
      {label} {sortKey === k ? (sortDir === 1 ? '▲' : '▼') : ''}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Catálogo de proyectos</h1>
          <p className="text-sm text-steel-500">
            {filtered.length} de {projects.length} oportunidades · datos con corte 7-jul-2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border border-steel-300">
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 text-sm font-medium ${view === 'table' ? 'bg-navy-900 text-white' : 'bg-white text-steel-600'}`}
            >
              Tabla
            </button>
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-1.5 text-sm font-medium ${view === 'cards' ? 'bg-navy-900 text-white' : 'bg-white text-steel-600'}`}
            >
              Tarjetas
            </button>
          </div>
          <button
            onClick={() => exportProjectsCsv(filtered)}
            className="rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-navy-950 hover:bg-amber-400"
          >
            ⬇ Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-steel-200 bg-white p-3 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar proyecto, mandante, descripción…"
          className="min-w-52 flex-1 rounded border border-steel-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500"
        />
        <Select value={sector} onChange={setSector} placeholder="Sector" options={sectors.map((s) => ({ value: s, label: s }))} />
        <Select value={region} onChange={setRegion} placeholder="Región" options={regions.map((r) => ({ value: r, label: r }))} />
        <Select value={service} onChange={setService} placeholder="Servicio" options={services.map((s) => ({ value: s, label: s }))} />
        <Select value={stage} onChange={setStage} placeholder="Estado" options={stages.map((s) => ({ value: s, label: s }))} />
        <Select
          value={priority}
          onChange={setPriority}
          placeholder="Prioridad"
          options={[
            { value: 'A', label: 'A · 0-6 meses' },
            { value: 'B', label: 'B · 6-18 meses' },
            { value: 'C', label: 'C · 2028+' },
          ]}
        />
        <Select
          value={invRange}
          onChange={setInvRange}
          placeholder="Inversión"
          options={INV_RANGES.filter((r) => r.value !== '').map((r) => ({ value: r.value, label: r.label }))}
        />
        {(q || sector || region || service || stage || priority || invRange) && (
          <button
            onClick={() => {
              setQ('');
              setSector('');
              setRegion('');
              setService('');
              setStage('');
              setPriority('');
              setInvRange('');
            }}
            className="text-sm font-medium text-steel-500 underline hover:text-navy-800"
          >
            Limpiar
          </button>
        )}
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-lg border border-steel-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="border-b-2 border-navy-900 bg-steel-50">
              <tr>
                <th className="w-10 px-3 py-2 text-left text-xs font-bold uppercase text-navy-800">P.</th>
                <Th label="Proyecto" k="name" />
                <Th label="Mandante" k="owner" />
                <Th label="Sector" k="sector" />
                <Th label="Región" k="region" />
                <Th label="Inversión" k="investmentMUSD" className="text-right" />
                <Th label="Estado" k="stage" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/proyectos/${p.id}`)}
                  className="cursor-pointer border-b border-steel-100 transition-colors hover:bg-amber-50"
                >
                  <td className="px-3 py-2">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="px-3 py-2 text-sm font-semibold text-navy-900">
                    {p.name} {contacted.has(p.id) && <span className="text-emerald-600" title="Contactado">✓</span>}{' '}
                    {p.unconfirmed && <UnconfirmedFlag />}
                  </td>
                  <td className="max-w-56 truncate px-3 py-2 text-sm text-steel-600">{p.owner}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-steel-600">{p.sector}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-steel-600">{p.region}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right text-sm font-bold text-navy-800">
                    {fmtMusd(p.investmentMUSD)}
                  </td>
                  <td className="px-3 py-2">
                    <StageBadge stage={p.stage} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-steel-500">
                    Ningún proyecto coincide con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/proyectos/${p.id}`}
              className="group flex flex-col rounded-lg border border-steel-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold leading-snug text-navy-900 group-hover:text-amber-600">{p.name}</h3>
                <PriorityBadge priority={p.priority} />
              </div>
              <p className="mt-0.5 text-xs text-steel-500">{p.owner}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <StageBadge stage={p.stage} />
                <span className="text-steel-500">{p.region}</span>
                {p.unconfirmed && <UnconfirmedFlag />}
                {contacted.has(p.id) && <span className="font-semibold text-emerald-600">✓ Contactado</span>}
              </div>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-steel-600">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.services.slice(0, 4).map((s) => (
                  <ServiceChip key={s} label={s} />
                ))}
                {p.services.length > 4 && <span className="text-[11px] text-steel-400">+{p.services.length - 4}</span>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-steel-100 pt-2">
                <span className="text-sm font-black text-navy-900">{fmtMusd(p.investmentMUSD)}</span>
                <span className="text-[11px] text-steel-400">{p.sector}</span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-steel-500">Ningún proyecto coincide con los filtros.</p>
          )}
        </div>
      )}
    </div>
  );
}
