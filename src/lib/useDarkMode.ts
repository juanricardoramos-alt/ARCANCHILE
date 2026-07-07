import { useCallback, useEffect, useState } from 'react';

const KEY = 'arc_theme';

function initialDark(): boolean {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    /* noop */
  }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/** Aplica/quita la clase `.dark` en <html> y persiste la preferencia. */
export function useDarkMode(): { dark: boolean; toggle: () => void } {
  const [dark, setDark] = useState<boolean>(initialDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
    } catch {
      /* noop */
    }
  }, [dark]);

  const toggle = useCallback(() => setDark((v) => !v), []);
  return { dark, toggle };
}
