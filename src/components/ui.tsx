import type { ReactNode } from 'react';
import type { Priority, Stage } from '../data/types';

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
