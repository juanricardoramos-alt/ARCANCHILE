import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Activity, CrmState, Rol, Usuario } from '../data/types';
import { hasSupabase, supabase } from '../lib/supabase';
import { loadCrm, pushActivity, pushRestore, subscribeCrm } from '../lib/crmDb';

export interface LogExtra {
  monto?: number | null;
  fechaReunion?: string | null;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppState {
  /** Modo backend: true si hay Supabase configurado, false si es demo local. */
  backendReady: boolean;
  usaSupabase: boolean;
  /** Sesión de autenticación resuelta (evita parpadeo al cargar). */
  authReady: boolean;
  isAuthed: boolean;
  usuario: Usuario | null;
  login: (email: string, pass: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Registra un nuevo usuario (solo admin en modo Supabase). */
  registrarUsuario: (email: string, pass: string, nombre: string, rol: Rol) => Promise<AuthResult>;
  contacted: Set<string>;
  toggleContacted: (id: string) => void;
  checklistDone: Set<string>;
  toggleChecklist: (id: string) => void;
  /** Estado CRM actual por contacto (clave = projectId::empresa::cargo o rc::id). */
  crmState: Record<string, CrmState>;
  /** Historial de actividades por contacto. */
  crmActivities: Record<string, Activity[]>;
  /** Cargando datos del CRM desde la base de datos. */
  crmLoading: boolean;
  /** Último error de sincronización con la base de datos (o null). */
  crmError: string | null;
  stateOf: (key: string) => CrmState;
  activitiesOf: (key: string) => Activity[];
  /** Registra una actividad: cambia el estado y anota fecha/usuario/nota. */
  logActivity: (key: string, to: CrmState, nota: string, extra?: LogExtra) => void;
  /** Reemplaza todo el estado CRM (para restaurar un backup). */
  restoreCrm: (state: Record<string, CrmState>, activities: Record<string, Activity[]>) => void;
}

const AppContext = createContext<AppState | null>(null);

const CRM_STATE_KEY = 'arc_crm_state';
const CRM_ACT_KEY = 'arc_crm_activities';
const LOCAL_USER_KEY = 'arc_user';

const DEMO_USER: Usuario = { id: 'local-admin', email: 'admin', nombre: 'Admin', rol: 'admin' };

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
function nowIso(): string {
  return new Date().toISOString();
}

// Migración: elimina el estado CRM del modelo antiguo (todos parten en "Pendiente").
try {
  localStorage.removeItem('arc_crm');
} catch {
  /* noop */
}

/** Traduce un usuario de Supabase Auth a nuestro modelo Usuario. */
function toUsuario(id: string, email: string | undefined, meta: Record<string, unknown> | undefined): Usuario {
  const nombre = (meta?.nombre as string) || (email ? email.split('@')[0] : 'Usuario');
  const rol = ((meta?.rol as Rol) || 'comercial') as Rol;
  return { id, email: email ?? '', nombre, rol };
}

export function AppProvider({ children }: { children: ReactNode }) {
  // ── Autenticación ──
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    if (hasSupabase) return null;
    return loadJson<Usuario | null>(LOCAL_USER_KEY, null);
  });
  const [authReady, setAuthReady] = useState(!hasSupabase);

  // ── Preferencias locales (personales) ──
  const [contacted, setContacted] = useState<Set<string>>(() => loadSet('arc_contacted'));
  const [checklistDone, setChecklistDone] = useState<Set<string>>(() => loadSet('arc_checklist'));

  // ── CRM ──
  const [crmState, setCrmState] = useState<Record<string, CrmState>>(() =>
    hasSupabase ? {} : loadJson(CRM_STATE_KEY, {}),
  );
  const [crmActivities, setCrmActivities] = useState<Record<string, Activity[]>>(() =>
    hasSupabase ? {} : loadJson(CRM_ACT_KEY, {}),
  );
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmError, setCrmError] = useState<string | null>(null);

  const usuarioRef = useRef<Usuario | null>(usuario);
  usuarioRef.current = usuario;
  const crmStateRef = useRef(crmState);
  crmStateRef.current = crmState;
  const crmActivitiesRef = useRef(crmActivities);
  crmActivitiesRef.current = crmActivities;

  // ── Sesión de Supabase ──
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data.session;
      setUsuario(s ? toUsuario(s.user.id, s.user.email, s.user.user_metadata) : null);
      setAuthReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session ? toUsuario(session.user.id, session.user.email, session.user.user_metadata) : null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ── Carga + realtime del CRM (modo Supabase, cuando hay usuario) ──
  const reloadCrm = useCallback(async () => {
    if (!hasSupabase) return;
    try {
      const snap = await loadCrm();
      setCrmState(snap.crmState);
      setCrmActivities(snap.crmActivities);
      setCrmError(null);
    } catch (e) {
      setCrmError(e instanceof Error ? e.message : 'Error al cargar el CRM.');
    }
  }, []);

  useEffect(() => {
    if (!hasSupabase || !usuario) return;
    let active = true;
    setCrmLoading(true);
    loadCrm()
      .then((snap) => {
        if (!active) return;
        setCrmState(snap.crmState);
        setCrmActivities(snap.crmActivities);
        setCrmError(null);
      })
      .catch((e) => active && setCrmError(e instanceof Error ? e.message : 'Error al cargar el CRM.'))
      .finally(() => active && setCrmLoading(false));

    const unsub = subscribeCrm(() => {
      void reloadCrm();
    });
    return () => {
      active = false;
      unsub();
    };
  }, [usuario, reloadCrm]);

  // ── Auth actions ──
  const login = useCallback(async (email: string, pass: string): Promise<AuthResult> => {
    if (hasSupabase && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass });
      if (error) return { ok: false, error: 'Credenciales incorrectas. Intente nuevamente.' };
      return { ok: true };
    }
    // Modo local (demo)
    if (email.trim() === 'admin' && pass === 'arcanchile2026') {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEMO_USER));
      setUsuario(DEMO_USER);
      return { ok: true };
    }
    return { ok: false, error: 'Credenciales incorrectas. Intente nuevamente.' };
  }, []);

  const logout = useCallback(async () => {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
      setUsuario(null);
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
      setUsuario(null);
    }
  }, []);

  const registrarUsuario = useCallback(
    async (email: string, pass: string, nombre: string, rol: Rol): Promise<AuthResult> => {
      if (!hasSupabase || !supabase) {
        return { ok: false, error: 'El registro de usuarios requiere Supabase configurado.' };
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: { data: { nombre: nombre.trim(), rol } },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [],
  );

  // ── Preferencias personales ──
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

  // ── CRM ──
  const stateOf = useCallback((key: string): CrmState => crmState[key] ?? 'pendiente', [crmState]);
  const activitiesOf = useCallback((key: string): Activity[] => crmActivities[key] ?? [], [crmActivities]);

  const logActivity = useCallback((key: string, to: CrmState, nota: string, extra?: LogExtra) => {
    const u = usuarioRef.current;
    const from = crmStateRef.current[key] ?? 'pendiente';
    const act: Activity = {
      id: makeId(),
      fecha: nowIso(),
      from,
      to,
      nota,
      usuario: u?.nombre ?? 'Usuario',
      monto: extra?.monto ?? null,
      fechaReunion: extra?.fechaReunion ?? null,
      motivoDescarte: to === 'descartado' ? nota : null,
    };

    // Se calculan los próximos valores desde refs (sin efectos dentro de los updaters).
    const nextActs = { ...crmActivitiesRef.current, [key]: [...(crmActivitiesRef.current[key] ?? []), act] };
    const nextState = { ...crmStateRef.current };
    if (to === 'pendiente') delete nextState[key];
    else nextState[key] = to;

    // Actualización optimista de la UI.
    setCrmActivities(nextActs);
    setCrmState(nextState);

    if (hasSupabase) {
      // Persistencia en base de datos; realtime reconciliará al confirmarse.
      pushActivity(key, act, u?.id ?? null)
        .then(() => setCrmError(null))
        .catch((e) => {
          setCrmError(e instanceof Error ? e.message : 'No se pudo guardar la actividad.');
          void reloadCrm();
        });
    } else {
      localStorage.setItem(CRM_ACT_KEY, JSON.stringify(nextActs));
      localStorage.setItem(CRM_STATE_KEY, JSON.stringify(nextState));
    }
  }, [reloadCrm]);

  const restoreCrm = useCallback(
    (state: Record<string, CrmState>, activities: Record<string, Activity[]>) => {
      setCrmState(state);
      setCrmActivities(activities);
      if (hasSupabase) {
        setCrmLoading(true);
        pushRestore(state, activities, usuarioRef.current?.id ?? null)
          .then(() => setCrmError(null))
          .catch((e) => setCrmError(e instanceof Error ? e.message : 'No se pudo restaurar el backup.'))
          .finally(() => setCrmLoading(false));
      } else {
        localStorage.setItem(CRM_STATE_KEY, JSON.stringify(state));
        localStorage.setItem(CRM_ACT_KEY, JSON.stringify(activities));
      }
    },
    [],
  );

  const value = useMemo<AppState>(
    () => ({
      backendReady: authReady,
      usaSupabase: hasSupabase,
      authReady,
      isAuthed: usuario != null,
      usuario,
      login,
      logout,
      registrarUsuario,
      contacted,
      toggleContacted,
      checklistDone,
      toggleChecklist,
      crmState,
      crmActivities,
      crmLoading,
      crmError,
      stateOf,
      activitiesOf,
      logActivity,
      restoreCrm,
    }),
    [
      authReady,
      usuario,
      login,
      logout,
      registrarUsuario,
      contacted,
      toggleContacted,
      checklistDone,
      toggleChecklist,
      crmState,
      crmActivities,
      crmLoading,
      crmError,
      stateOf,
      activitiesOf,
      logActivity,
      restoreCrm,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
