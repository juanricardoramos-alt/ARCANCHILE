import type { ReactNode } from 'react';
import type { ContactoNivel, CrmState, Priority, RelevanciaArcanchile, Stage } from '../data/types';
import { CRM_LABEL } from '../data/types';

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
      <div className="text-[11px] font-semibold uppercase tracking-wide text-steel-500 sm:text-xs">{label}</div>
      <div className="mt-1 break-words text-xl font-bold leading-tight text-navy-900 sm:text-2xl">{value}</div>
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

const nivelMeta: Record<ContactoNivel, { label: string; cls: string }> = {
  decisor: { label: 'Decisor', cls: 'bg-red-100 text-red-700 border-red-300' },
  influenciador: { label: 'Influenciador', cls: 'bg-orange-100 text-orange-700 border-orange-300' },
  tecnico: { label: 'Técnico', cls: 'bg-sky-100 text-sky-700 border-sky-300' },
  acceso: { label: 'Acceso', cls: 'bg-steel-200 text-steel-700 border-steel-300' },
};

export function ContactoNivelBadge({ nivel }: { nivel: ContactoNivel }) {
  const m = nivelMeta[nivel];
  return <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-[11px] font-bold ${m.cls}`}>{m.label}</span>;
}

export function OrigenBadge({ origen }: { origen: 'LinkedIn' | 'Pipeline II' | 'Ambas' }) {
  const cls =
    origen === 'Pipeline II'
      ? 'bg-sky-100 text-sky-800 border-sky-300'
      : origen === 'Ambas'
        ? 'bg-violet-100 text-violet-800 border-violet-300'
        : 'bg-steel-100 text-steel-600 border-steel-300';
  const label = origen === 'Pipeline II' ? 'Pipeline II' : origen === 'Ambas' ? 'LinkedIn + Pipeline II' : 'LinkedIn';
  return (
    <span
      title={origen === 'Pipeline II' ? 'Asistente al evento Pipeline II (MineGroup) — lead tibio' : `Fuente: ${origen}`}
      className={`inline-block whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-bold ${cls}`}
    >
      {label}
    </span>
  );
}

export function LinkedInIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="LinkedIn" role="img">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const crmMeta: Record<CrmState, string> = {
  pendiente: 'bg-steel-100 text-steel-600 border-steel-300',
  contactado: 'bg-sky-100 text-sky-700 border-sky-300',
  reunion: 'bg-amber-100 text-amber-700 border-amber-300',
  propuesta: 'bg-violet-100 text-violet-700 border-violet-300',
  seguimiento: 'bg-emerald-100 text-emerald-700 border-emerald-300',
};

export function CrmBadge({ state }: { state: CrmState }) {
  return <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-[11px] font-semibold ${crmMeta[state]}`}>{CRM_LABEL[state]}</span>;
}

export const crmSelectClass: Record<CrmState, string> = crmMeta;
