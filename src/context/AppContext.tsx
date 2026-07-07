import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CrmState } from '../data/types';

interface AppState {
  isAuthed: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  contacted: Set<string>;
  toggleContacted: (id: string) => void;
  checklistDone: Set<string>;
  toggleChecklist: (id: string) => void;
  /** Estado CRM por contacto (clave = projectId::empresa::cargo). 'pendiente' no se almacena. */
  crm: Record<string, CrmState>;
  setCrm: (key: string, state: CrmState) => void;
}

const AppContext = createContext<AppState | null>(null);

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>): void {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function loadCrm(): Record<string, CrmState> {
  try {
    const raw = localStorage.getItem('arc_crm');
    return raw ? (JSON.parse(raw) as Record<string, CrmState>) : {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('arc_auth') === '1');
  const [contacted, setContacted] = useState<Set<string>>(() => loadSet('arc_contacted'));
  const [checklistDone, setChecklistDone] = useState<Set<string>>(() => loadSet('arc_checklist'));
  const [crm, setCrmState] = useState<Record<string, CrmState>>(() => loadCrm());

  const login = useCallback((user: string, pass: string) => {
    if (user === 'admin' && pass === 'arcanchile2026') {
      sessionStorage.setItem('arc_auth', '1');
      setIsAuthed(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('arc_auth');
    setIsAuthed(false);
  }, []);

  const toggleContacted = useCallback((id: string) => {
    setContacted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet('arc_contacted', next);
      return next;
    });
  }, []);

  const toggleChecklist = useCallback((id: string) => {
    setChecklistDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet('arc_checklist', next);
      return next;
    });
  }, []);

  const setCrm = useCallback((key: string, state: CrmState) => {
    setCrmState((prev) => {
      const next = { ...prev };
      if (state === 'pendiente') delete next[key];
      else next[key] = state;
      localStorage.setItem('arc_crm', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthed,
      login,
      logout,
      contacted,
      toggleContacted,
      checklistDone,
      toggleChecklist,
      crm,
      setCrm,
    }),
    [isAuthed, login, logout, contacted, toggleContacted, checklistDone, toggleChecklist, crm, setCrm],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
