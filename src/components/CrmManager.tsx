import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CRM_LABEL, CRM_STATES } from '../data/types';
import type { CrmState } from '../data/types';
import { fmtFecha } from '../lib/crm';
import { CrmBadge } from './ui';

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
          onSave={(to, nota) => {
            logActivity(contactKey, to, nota);
            setOpen(false);
          }}
          usuario={usuario}
        />
      )}
    </>
  );
}

function CrmModal({
  contactKey,
  title,
  subtitle,
  current,
  onClose,
  onSave,
  usuario,
}: {
  contactKey: string;
  title: string;
  subtitle?: string;
  current: CrmState;
  onClose: () => void;
  onSave: (to: CrmState, nota: string) => void;
  usuario: string;
}) {
  const { activitiesOf } = useApp();
  const [to, setTo] = useState<CrmState>(current);
  const [nota, setNota] = useState('');
  const activities = [...activitiesOf(contactKey)].reverse();
  const isDescartado = to === 'descartado';

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:max-w-lg sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-2 border-b border-steel-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-steel-500">Registrar actividad</div>
            <h3 className="truncate font-black text-navy-900">{title}</h3>
            {subtitle && <p className="truncate text-xs text-steel-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-steel-500 hover:bg-steel-100" aria-label="Cerrar">
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
              className="w-full rounded border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500"
            >
              {CRM_STATES.map((s) => (
                <option key={s} value={s}>
                  {CRM_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

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
              className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500"
            />
            <p className="mt-1 text-[11px] text-steel-400">Se registrará con fecha automática y usuario: {usuario}.</p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded border border-steel-300 px-4 py-2 text-sm font-semibold text-steel-600 hover:bg-steel-50">
              Cancelar
            </button>
            <button
              onClick={() => canSave && onSave(to, nota.trim())}
              disabled={!canSave}
              className={`rounded px-4 py-2 text-sm font-bold text-white ${canSave ? 'bg-navy-900 hover:bg-navy-700' : 'cursor-not-allowed bg-steel-300'}`}
            >
              Guardar actividad
            </button>
          </div>

          {/* Historial */}
          <div className="border-t border-steel-200 pt-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-steel-500">
              Historial de actividades ({activities.length})
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-steel-400">Sin actividades registradas. Este contacto está en estado Pendiente.</p>
            ) : (
              <ol className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="border-l-2 border-navy-200 pl-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <CrmBadge state={a.from} />
                      <span className="text-steel-400">→</span>
                      <CrmBadge state={a.to} />
                    </div>
                    <p className="mt-1 text-sm text-steel-700">{a.nota}</p>
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
