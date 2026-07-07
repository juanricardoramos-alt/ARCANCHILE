import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Activity, CrmState } from '../data/types';

interface AppState {
  isAuthed: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  contacted: Set<string>;
  toggleContacted: (id: string) => void;
  checklistDone: Set<string>;
  toggleChecklist: (id: string) => void;
  /** Usuario que registra la gestión (preparado para múltiples usuarios). */
  usuario: string;
  /** Estado CRM actual por contacto (clave = projectId::empresa::cargo o rc::id). */
  crmState: Record<string, CrmState>;
  /** Historial de actividades por contacto. */
  crmActivities: Record<string, Activity[]>;
  /** Estado actual de un contacto (por defecto 'pendiente'). */
  stateOf: (key: string) => CrmState;
  activitiesOf: (key: string) => Activity[];
  /** Registra una actividad: cambia el estado y anota fecha/usuario/nota. */
  logActivity: (key: string, to: CrmState, nota: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const CRM_STATE_KEY = 'arc_crm_state';
const CRM_ACT_KEY = 'arc_crm_activities';

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
function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* noop */
  }
  return `a_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

// Migración: elimina el estado CRM del modelo antiguo (todos parten en "Pendiente").
try {
  localStorage.removeItem('arc_crm');
} catch {
  /* noop */
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('arc_auth') === '1');
  const [contacted, setContacted] = useState<Set<string>>(() => loadSet('arc_contacted'));
  const [checklistDone, setChecklistDone] = useState<Set<string>>(() => loadSet('arc_checklist'));
  const [crmState, setCrmState] = useState<Record<string, CrmState>>(() => loadJson(CRM_STATE_KEY, {}));
  const [crmActivities, setCrmActivities] = useState<Record<string, Activity[]>>(() => loadJson(CRM_ACT_KEY, {}));
  const usuario = 'Admin';

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

  const stateOf = useCallback((key: string): CrmState => crmState[key] ?? 'pendiente', [crmState]);
  const activitiesOf = useCallback((key: string): Activity[] => crmActivities[key] ?? [], [crmActivities]);

  const logActivity = useCallback(
    (key: string, to: CrmState, nota: string) => {
      const from = crmState[key] ?? 'pendiente';
      const act: Activity = { id: makeId(), fecha: new Date().toISOString(), from, to, nota, usuario };
      setCrmActivities((prev) => {
        const next = { ...prev, [key]: [...(prev[key] ?? []), act] };
        localStorage.setItem(CRM_ACT_KEY, JSON.stringify(next));
        return next;
      });
      setCrmState((prev) => {
        const next = { ...prev };
        if (to === 'pendiente') delete next[key];
        else next[key] = to;
        localStorage.setItem(CRM_STATE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [crmState, usuario],
  );

  const value = useMemo(
    () => ({
      isAuthed,
      login,
      logout,
      contacted,
      toggleContacted,
      checklistDone,
      toggleChecklist,
      usuario,
      crmState,
      crmActivities,
      stateOf,
      activitiesOf,
      logActivity,
    }),
    [
      isAuthed,
      login,
      logout,
      contacted,
      toggleContacted,
      checklistDone,
      toggleChecklist,
      crmState,
      crmActivities,
      stateOf,
      activitiesOf,
      logActivity,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
