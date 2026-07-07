import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `true` cuando hay credenciales de Supabase configuradas (.env).
 * Si es `false`, la aplicación funciona en modo local (localStorage) como demo.
 */
export const hasSupabase: boolean = Boolean(url && anon);

/** Cliente de Supabase, o `null` cuando no hay credenciales (modo local). */
export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anon as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
