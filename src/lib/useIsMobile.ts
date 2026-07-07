import { useEffect, useState } from 'react';

/** Devuelve true cuando el viewport está en rango de celular (< 768px por defecto). */
export function useIsMobile(query = '(max-width: 767px)'): boolean {
  const [match, setMatch] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatch(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return match;
}
