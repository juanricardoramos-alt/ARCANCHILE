import type { CrmState } from '../data/types';

/** Color por estado del embudo (para badges, barras y gráficos). */
export const CRM_COLOR: Record<CrmState, string> = {
  pendiente: '#94a3b8',
  contactado: '#0ea5e9',
  respuesta: '#06b6d4',
  reunion_agendada: '#f59e0b',
  reunion_realizada: '#f97316',
  propuesta: '#8b5cf6',
  negociacion: '#6366f1',
  adjudicado: '#10b981',
  descartado: '#ef4444',
};

/** Clases Tailwind por estado (badge). */
export const CRM_BADGE_CLASS: Record<CrmState, string> = {
  pendiente: 'bg-steel-100 text-steel-600 border-steel-300',
  contactado: 'bg-sky-100 text-sky-700 border-sky-300',
  respuesta: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  reunion_agendada: 'bg-amber-100 text-amber-700 border-amber-300',
  reunion_realizada: 'bg-orange-100 text-orange-700 border-orange-300',
  propuesta: 'bg-violet-100 text-violet-700 border-violet-300',
  negociacion: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  adjudicado: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  descartado: 'bg-red-100 text-red-700 border-red-300',
};

export function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
