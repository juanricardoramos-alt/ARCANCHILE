import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { LogExtra } from '../context/AppContext';
import { CRM_LABEL, CRM_STATES } from '../data/types';
import type { CrmState } from '../data/types';
import { fmtFecha } from '../lib/crm';
import { CrmBadge } from './ui';

const MONTO_STATES: CrmState[] = ['propuesta', 'negociacion', 'adjudicado'];

/**
 * Control de gestión de un contacto: muestra el estado actual y abre un modal para registrar
 * una actividad (cambio de estado + nota obligatoria + fecha/usuario automáticos) e ver el historial.
 */
export function CrmManager({ contactKey, title, subtitle }: { contactKey: string; title: string; subtitle?: string }) {
  const { stateOf, activitiesOf, logActivity, usuario } = useApp();
  const [open, setOpen] = useState(false);
  const current = stateOf(contactKey);
  const activities = activitiesOf(contactKey);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded hover:opacity-80"
        title="Registrar actividad / cambiar estado"
      >
        <CrmBadge state={current} />
        <span className="whitespace-nowrap text-[11px] font-semibold text-amber-600 underline">
          Gestionar{activities.length > 0 ? ` (${activities.length})` : ''}
        </span>
      </button>
      {open && (
        <CrmModal
          contactKey={contactKey}
          title={title}
          subtitle={subtitle}
          current={current}
          onClose={() => setOpen(false)}
          onSave={(to, nota, extra) => {
            logActivity(contactKey, to, nota, extra);
            setOpen(false);
          }}
          usuario={usuario?.nombre ?? 'Usuario'}
        />
      )}
    </>
  );
}

export function CrmModal({
  contactKey,
  title,
  subtitle,
  current,
  presetTo,
  onClose,
  onSave,
  usuario,
}: {
  contactKey: string;
  title: string;
  subtitle?: string;
  current: CrmState;
  /** Estado preseleccionado al abrir (p. ej. tras un swipe). */
  presetTo?: CrmState;
  onClose: () => void;
  onSave: (to: CrmState, nota: string, extra?: LogExtra) => void;
  usuario: string;
}) {
  const { activitiesOf } = useApp();
  const [to, setTo] = useState<CrmState>(presetTo ?? current);
  const [nota, setNota] = useState('');
  const [monto, setMonto] = useState('');
  const [fechaReunion, setFechaReunion] = useState('');
  const activities = [...activitiesOf(contactKey)].reverse();
  const isDescartado = to === 'descartado';
  const showMonto = MONTO_STATES.includes(to);
  const showReunion = to === 'reunion_agendada';

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const canSave = nota.trim().length > 0;

  function save() {
    if (!canSave) return;
    const extra: LogExtra = {
      monto: showMonto && monto.trim() ? Number(monto.replace(/[^0-9]/g, '')) || null : null,
      fechaReunion: showReunion && fechaReunion ? fechaReunion : null,
    };
    onSave(to, nota.trim(), extra);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:max-w-lg sm:rounded-xl dark:bg-navy-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-2 border-b border-steel-200 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-900">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">Registrar actividad</div>
            <h3 className="truncate font-black text-navy-900 dark:text-white">{title}</h3>
            {subtitle && <p className="truncate text-xs text-steel-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-steel-500 hover:bg-steel-100 dark:hover:bg-navy-800" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-steel-500">Estado actual:</span>
            <CrmBadge state={current} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Nuevo estado</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value as CrmState)}
              className="w-full rounded border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            >
              {CRM_STATES.map((s) => (
                <option key={s} value={s}>
                  {CRM_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          {showMonto && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Monto estimado (CLP)</label>
              <input
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                inputMode="numeric"
                placeholder="Ej: 25000000"
                className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
          )}

          {showReunion && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Fecha de la reunión</label>
              <input
                type="date"
                value={fechaReunion}
                onChange={(e) => setFechaReunion(e.target.value)}
                className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">
              {isDescartado ? 'Motivo del descarte (obligatorio)' : 'Nota / comentario (obligatorio)'}
            </label>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              autoFocus
              placeholder={
                isDescartado
                  ? 'Ej: no tienen presupuesto este año; retomar en 2027.'
                  : 'Qué se hizo, qué se habló, próximo paso…'
              }
              className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            />
            <p className="mt-1 text-[11px] text-steel-400">Se registrará con fecha automática y usuario: {usuario}.</p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded border border-steel-300 px-4 py-2 text-sm font-semibold text-steel-600 hover:bg-steel-50 dark:border-navy-600 dark:text-steel-300 dark:hover:bg-navy-800">
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={!canSave}
              className={`rounded px-4 py-2 text-sm font-bold text-white ${canSave ? 'bg-navy-900 hover:bg-navy-700' : 'cursor-not-allowed bg-steel-300'}`}
            >
              Guardar actividad
            </button>
          </div>

          {/* Historial */}
          <div className="border-t border-steel-200 pt-3 dark:border-navy-700">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-steel-500">
              Historial de actividades ({activities.length})
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-steel-400">Sin actividades registradas. Este contacto está en estado Pendiente.</p>
            ) : (
              <ol className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-navy-200 pl-3 dark:border-navy-700">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <CrmBadge state={a.from} />
                      <span className="text-steel-400">→</span>
                      <CrmBadge state={a.to} />
                    </div>
                    <p className="mt-1 text-sm text-steel-700 dark:text-steel-300">{a.nota}</p>
                    {(a.monto != null || a.fechaReunion) && (
                      <p className="mt-0.5 text-[11px] font-semibold text-navy-600 dark:text-amber-400">
                        {a.monto != null && `Monto: $${a.monto.toLocaleString('es-CL')} CLP`}
                        {a.monto != null && a.fechaReunion && ' · '}
                        {a.fechaReunion && `Reunión: ${a.fechaReunion}`}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-steel-400">
                      {fmtFecha(a.fecha)} · {a.usuario}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
