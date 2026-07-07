import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Login() {
  const { login, usaSupabase } = useApp();
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await login(user, pass);
    setBusy(false);
    if (res.ok) navigate('/');
    else setError(res.error ?? 'No se pudo iniciar sesión.');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center rounded-2xl bg-white px-8 py-6 shadow-2xl">
            <img src="/logo-mark.svg" alt="ARCANCHILE" className="h-[120px] w-auto" />
            <div className="mt-2 text-center font-black leading-none tracking-wide">
              <div className="text-2xl text-navy-950">ARCAN</div>
              <div className="text-2xl tracking-[0.2em] text-[#2B93CF]">CHILE</div>
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="rounded-xl border border-navy-700 bg-navy-900/60 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-xl font-bold text-white">Plataforma de Gestión Comercial</h1>
          <p className="mt-1 text-sm text-steel-400">
            Inteligencia comercial de ingeniería e inspección · Chile 2026-2030
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-steel-400">
            {usaSupabase ? 'Correo electrónico' : 'Usuario'}
          </label>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            type={usaSupabase ? 'email' : 'text'}
            autoComplete="username"
            className="mt-1 w-full rounded border border-navy-600 bg-navy-800 px-3 py-2 text-white placeholder-steel-500 outline-none focus:border-amber-500"
            placeholder={usaSupabase ? 'nombre@arcanchile.com' : 'admin'}
          />

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-steel-400">Contraseña</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-navy-600 bg-navy-800 px-3 py-2 text-white placeholder-steel-500 outline-none focus:border-amber-500"
            placeholder="••••••••••••"
          />

          {error && <p className="mt-3 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-amber-500 py-2.5 font-bold text-navy-950 transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/40 border-t-navy-950" />}
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>

          {!usaSupabase && (
            <p className="mt-4 text-center text-xs text-steel-500">
              Acceso demo: <code className="text-steel-400">admin / arcanchile2026</code>
            </p>
          )}
        </form>
        <p className="mt-6 text-center text-xs text-steel-500">Uso interno directorio ARCANCHILE · Datos al 7-jul-2026</p>
      </div>
    </div>
  );
}
