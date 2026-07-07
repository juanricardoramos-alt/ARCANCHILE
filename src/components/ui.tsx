import type { ReactNode } from 'react';
import type { Priority, RelevanciaArcanchile, Stage } from '../data/types';

export function PriorityBadge({ priority, size = 'sm' }: { priority: Priority; size?: 'sm' | 'lg' }) {
  const styles: Record<Priority, string> = {
    A: 'bg-red-100 text-red-700 border-red-300',
    B: 'bg-amber-100 text-amber-700 border-amber-300',
    C: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  };
  const label: Record<Priority, string> = {
    A: 'Prioridad A · 0-6 meses',
    B: 'Prioridad B · 6-18 meses',
    C: 'Prioridad C · 2028+',
  };
  return (
    <span
      title={label[priority]}
      className={`inline-flex items-center justify-center rounded-full border font-bold ${styles[priority]} ${
        size === 'lg' ? 'px-3 py-1 text-sm' : 'h-6 w-6 text-xs'
      }`}
    >
      {size === 'lg' ? label[priority] : priority}
    </span>
  );
}

const stageStyles: Record<Stage, string> = {
  'Estudio / Prefactibilidad': 'bg-steel-100 text-steel-600 border-steel-300',
  'EIA en trámite': 'bg-sky-50 text-sky-700 border-sky-200',
  'Aprobado (RCA/FID)': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En licitación': 'bg-amber-50 text-amber-700 border-amber-300',
  Construcción: 'bg-navy-50 text-navy-700 border-navy-200',
  'Puesta en marcha': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Operación: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  Recurrente: 'bg-steel-100 text-steel-700 border-steel-300',
  'Suspendido / En riesgo': 'bg-orange-50 text-orange-700 border-orange-300',
  Desistido: 'bg-red-50 text-red-700 border-red-200',
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${stageStyles[stage]}`}>
      {stage}
    </span>
  );
}

export function ServiceChip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded bg-navy-800 px-2 py-0.5 text-[11px] font-medium text-navy-100">{label}</span>
  );
}

/** Chip azul para servicios específicos de pipeline/ductos. */
export function PipelineServiceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
      <PipeIcon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function NormativaChip({ label }: { label: string }) {
  return (
    <span className="inline-block rounded border border-steel-300 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-steel-700">
      {label}
    </span>
  );
}

/** Ícono de segmento de tubería (pipeline). */
export function PipeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} aria-hidden>
      <rect x="2" y="8.5" width="20" height="7" rx="1.5" />
      <line x1="7" y1="8.5" x2="7" y2="15.5" />
      <line x1="17" y1="8.5" x2="17" y2="15.5" />
    </svg>
  );
}

/** Badge distintivo para proyectos del core Pipeline/Ductos. */
export function PipeBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="Core ARCANCHILE — proyecto con componente de ductos / pipeline"
      className="inline-flex items-center gap-1 rounded-full border border-sky-400 bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800"
    >
      <PipeIcon className="h-3.5 w-3.5" />
      {!compact && 'Pipeline'}
    </span>
  );
}

const relevanceMeta: Record<RelevanciaArcanchile, { dots: number; color: string; label: string }> = {
  alta: { dots: 3, color: '#0369a1', label: 'Relevancia alta · core ductos' },
  media: { dots: 2, color: '#0ea5e9', label: 'Relevancia media · incluye piping' },
  baja: { dots: 1, color: '#cbd5e1', label: 'Relevancia baja · fuera del core' },
};

export function RelevanceIndicator({
  r,
  showLabel = false,
}: {
  r: RelevanciaArcanchile;
  showLabel?: boolean;
}) {
  const m = relevanceMeta[r];
  return (
    <span className="inline-flex items-center gap-1.5" title={m.label}>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: i < m.dots ? m.color : '#e2e8f0' }}
          />
        ))}
      </span>
      {showLabel && <span className="text-xs font-semibold capitalize text-steel-600">{r}</span>}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        accent ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-steel-200 bg-white'
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-navy-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-steel-500">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-navy-800">{children}</h2>
      {right}
    </div>
  );
}

export function UnconfirmedFlag() {
  return (
    <span
      title="Dato de fuente única o débil — validar antes de decisiones comerciales"
      className="inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700"
    >
      SIN CONFIRMAR
    </span>
  );
}
