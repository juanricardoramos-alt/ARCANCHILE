import { useState } from 'react';
import { useInstallPrompt } from '../lib/useInstallPrompt';

const DISMISS_KEY = 'arc_install_dismissed';

/** Banner inferior "Instalar ARCANCHILE" (aparece cuando el navegador lo permite). */
export function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!canInstall || dismissed) return null;

  function close() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* noop */
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-400 bg-navy-900 px-4 py-3 shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm sm:rounded-xl sm:border">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500 text-lg font-black text-navy-950">
          A
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">Instalar ARCANCHILE</p>
          <p className="text-xs text-steel-400">Acceso rápido desde tu pantalla de inicio, incluso sin conexión.</p>
        </div>
        <button
          onClick={promptInstall}
          className="flex-shrink-0 rounded bg-amber-500 px-3 py-1.5 text-sm font-bold text-navy-950 hover:bg-amber-400"
        >
          Instalar
        </button>
        <button onClick={close} className="flex-shrink-0 rounded p-1 text-steel-400 hover:text-white" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
