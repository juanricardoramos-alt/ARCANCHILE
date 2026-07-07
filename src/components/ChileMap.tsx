import { fmtMusd, investmentByRegion } from '../lib/stats';
import type { Project } from '../data/types';

/** Mapa esquemático de Chile continental (franja norte→sur) coloreado por inversión. */
const REGIONS: { name: string; short: string; w: number; x: number }[] = [
  { name: 'Arica y Parinacota', short: 'XV', w: 30, x: 46 },
  { name: 'Tarapacá', short: 'I', w: 34, x: 44 },
  { name: 'Antofagasta', short: 'II', w: 40, x: 42 },
  { name: 'Atacama', short: 'III', w: 36, x: 44 },
  { name: 'Coquimbo', short: 'IV', w: 28, x: 48 },
  { name: 'Valparaíso', short: 'V', w: 26, x: 48 },
  { name: 'Metropolitana', short: 'RM', w: 26, x: 50 },
  { name: "O'Higgins", short: 'VI', w: 24, x: 50 },
  { name: 'Maule', short: 'VII', w: 24, x: 50 },
  { name: 'Ñuble', short: 'XVI', w: 22, x: 50 },
  { name: 'Biobío', short: 'VIII', w: 24, x: 50 },
  { name: 'La Araucanía', short: 'IX', w: 22, x: 52 },
  { name: 'Los Ríos', short: 'XIV', w: 20, x: 52 },
  { name: 'Los Lagos', short: 'X', w: 24, x: 52 },
  { name: 'Aysén', short: 'XI', w: 30, x: 50 },
  { name: 'Magallanes', short: 'XII', w: 38, x: 46 },
];

const ROW_H = 30;
const GAP = 3;

function colorFor(investment: number, max: number): string {
  if (investment <= 0) return '#e2e8f0';
  const t = Math.sqrt(investment / max); // escala suave
  if (t > 0.8) return '#f59e0b';
  if (t > 0.55) return '#d97706';
  if (t > 0.35) return '#35648f';
  if (t > 0.18) return '#5583b6';
  return '#b3cbe4';
}

export function ChileMap({ list }: { list: Project[] }) {
  const byRegion = investmentByRegion(list);
  const max = Math.max(1, ...[...byRegion.values()].map((v) => v.investment));
  const others = ['Interregional', 'Nacional']
    .map((r) => ({ name: r, data: byRegion.get(r) }))
    .filter((o) => o.data);

  const height = REGIONS.length * (ROW_H + GAP) + 10;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <svg viewBox={`0 0 130 ${height}`} className="h-[420px] w-24 shrink-0" role="img" aria-label="Mapa de Chile por región">
        {REGIONS.map((r, i) => {
          const d = byRegion.get(r.name) ?? { count: 0, investment: 0 };
          const y = 5 + i * (ROW_H + GAP);
          return (
            <g key={r.name}>
              <rect
                x={r.x}
                y={y}
                width={r.w}
                height={ROW_H}
                rx={5}
                fill={colorFor(d.investment, max)}
                stroke="#0f2a43"
                strokeOpacity={0.25}
              >
                <title>{`${r.name}: ${d.count} proyecto(s) · ${fmtMusd(d.investment)}`}</title>
              </rect>
              <text x={r.x + r.w / 2} y={y + ROW_H / 2 + 3.5} textAnchor="middle" fontSize={9} fill="#0f2a43" fontWeight={700}>
                {r.short}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="min-w-0 flex-1">
        <ul className="grid grid-cols-1 gap-x-4 text-sm sm:grid-cols-2">
          {REGIONS.map((r) => {
            const d = byRegion.get(r.name) ?? { count: 0, investment: 0 };
            return (
              <li key={r.name} className="flex items-center justify-between gap-2 border-b border-steel-100 py-1.5">
                <span className="flex items-center gap-2 truncate">
                  <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: colorFor(d.investment, max) }} />
                  <span className="truncate text-steel-700">{r.name}</span>
                </span>
                <span className="whitespace-nowrap text-xs text-steel-500">
                  {d.count > 0 ? `${d.count} · ${d.investment > 0 ? fmtMusd(d.investment) : 's/d'}` : '—'}
                </span>
              </li>
            );
          })}
        </ul>
        {others.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((o) => (
              <span key={o.name} className="rounded-full bg-navy-900 px-3 py-1 text-xs font-medium text-navy-100">
                {o.name}: {o.data!.count} proyecto(s) · {fmtMusd(o.data!.investment)}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-steel-400">
          Mapa esquemático; intensidad de color según inversión identificada (excluye desistidos/suspendidos).
        </p>
      </div>
    </div>
  );
}
