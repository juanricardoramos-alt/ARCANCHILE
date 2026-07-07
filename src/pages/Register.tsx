import { useState } from 'react';
import type { FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { ROL_LABEL } from '../data/types';
import type { Rol } from '../data/types';

const ROLES: Rol[] = ['director', 'comercial', 'admin'];

export function Register() {
  const { registrarUsuario, usaSupabase } = useApp();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<Rol>('comercial');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await registrarUsuario(email, pass, nombre, rol);
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: `Usuario ${email} creado. Debe confirmar su correo si la verificación está activada.` });
      setEmail('');
      setNombre('');
      setPass('');
      setRol('comercial');
    } else {
      setMsg({ ok: false, text: res.error ?? 'No se pudo crear el usuario.' });
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Registrar usuario</h1>
      <p className="mt-1 text-sm text-steel-500">Alta de usuarios del equipo comercial (solo administradores).</p>

      {!usaSupabase && (
        <div className="mt-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          El registro de usuarios requiere Supabase configurado. En modo demo local no está disponible; consulte{' '}
          <code>SETUP.md</code>.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-steel-200 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-900">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Nombre completo</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            placeholder="Nombre Apellido"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Correo electrónico</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            placeholder="nombre@arcanchile.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Rol</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
            className="w-full rounded border border-steel-300 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROL_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-steel-500">Contraseña temporal</label>
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            required
            minLength={6}
            className="w-full rounded border border-steel-300 px-3 py-2 text-sm outline-none focus:border-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {msg && (
          <div
            className={`rounded border px-3 py-2 text-sm ${
              msg.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-700'
            }`}
          >
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !usaSupabase}
          className="flex w-full items-center justify-center gap-2 rounded bg-navy-900 py-2.5 font-bold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {busy ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}
