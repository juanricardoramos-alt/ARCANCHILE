import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FabAction {
  label: string;
  icon: string;
  onClick: () => void;
}

/** Botón de acción flotante (móvil): accesos rápidos a las tareas comerciales frecuentes. */
export function Fab() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const actions: FabAction[] = [
    { label: 'Gestión comercial', icon: '📇', onClick: () => navigate('/gestion-comercial') },
    { label: 'Alertas y licitaciones', icon: '🔔', onClick: () => navigate('/alertas') },
    { label: 'Volver arriba', icon: '⬆️', onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  ];

  return (
    <div className="fab-safe fixed right-4 z-30 flex flex-col items-end gap-3 md:hidden">
      {open && (
        <button
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 cursor-default bg-black/20"
        />
      )}
      {open &&
        actions.map((a) => (
          <button
            key={a.label}
            onClick={() => {
              a.onClick();
              setOpen(false);
            }}
            className="flex min-h-12 items-center gap-2 rounded-full bg-white py-2 pl-4 pr-5 text-base font-semibold text-navy-900 shadow-lg active:bg-steel-100 dark:bg-navy-800 dark:text-white dark:active:bg-navy-700"
          >
            <span className="text-lg">{a.icon}</span>
            {a.label}
          </button>
        ))}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Acciones rápidas"
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-navy-950 shadow-xl transition-transform active:scale-95"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-7 w-7 transition-transform ${open ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
