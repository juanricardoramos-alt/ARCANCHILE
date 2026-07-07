import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useDarkMode } from '../lib/useDarkMode';
import { PipeIcon } from './ui';
import { Fab } from './Fab';
import { InstallPrompt } from './InstallPrompt';

const links = [
  { to: '/', label: 'Dashboard', end: true, pipe: false },
  { to: '/catalogo', label: 'Proyectos', pipe: false },
  { to: '/pipeline', label: 'Pipeline', pipe: true },
  { to: '/gestion-comercial', label: 'Gestión Comercial', pipe: false },
  { to: '/empresas', label: 'Empresas', pipe: false },
  { to: '/plan', label: 'Plan de Acción', pipe: false },
  { to: '/alertas', label: 'Alertas', pipe: false },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 font-black text-navy-950">A</span>
      <span className={`text-lg font-black tracking-wider ${dark ? 'text-navy-900' : 'text-white'}`}>
        ARCANCHILE
        <span className="ml-2 hidden text-[10px] font-semibold tracking-normal text-steel-400 lg:inline">
          INGENIERÍA · INSPECCIÓN
        </span>
      </span>
    </span>
  );
}

function linkClass(isActive: boolean, pipe: boolean): string {
  return `flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? pipe
        ? 'bg-sky-500 text-navy-950'
        : 'bg-amber-500 text-navy-950'
      : pipe
        ? 'text-sky-300 hover:bg-navy-800 hover:text-sky-100'
        : 'text-steel-300 hover:bg-navy-800 hover:text-white'
  }`;
}

/** Estilo de link táctil grande dentro del drawer móvil (altura mínima 56 px). */
function drawerLinkClass(isActive: boolean, pipe: boolean): string {
  return `flex min-h-14 items-center gap-3 rounded-xl px-4 text-lg font-semibold transition-colors ${
    isActive
      ? pipe
        ? 'bg-sky-500 text-navy-950'
        : 'bg-amber-500 text-navy-950'
      : pipe
        ? 'bg-navy-900 text-sky-300 active:bg-navy-800'
        : 'bg-navy-900 text-steel-100 active:bg-navy-800'
  }`;
}

function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="flex h-11 w-11 items-center justify-center rounded border border-navy-600 text-steel-300 hover:bg-navy-800 hover:text-white"
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}

/** Panel de navegación a pantalla completa para móvil (drawer). */
function MobileDrawer({
  open,
  onClose,
  navLinks,
  dark,
  toggle,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  navLinks: { to: string; label: string; end?: boolean; pipe: boolean }[];
  dark: boolean;
  toggle: () => void;
  onLogout: () => void;
}) {
  useEffect(() => {
    document.body.classList.toggle('drawer-open', open);
    return () => document.body.classList.remove('drawer-open');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú de navegación">
      <div className="safe-top safe-x flex h-full flex-col bg-navy-950">
        {/* Cabecera del drawer */}
        <div className="flex items-center justify-between px-4 py-4">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-navy-700 text-white active:bg-navy-800"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Links grandes */}
        <nav className="safe-bottom flex-1 space-y-2.5 overflow-y-auto px-4 pb-6 pt-2">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={onClose}
              className={({ isActive }) => drawerLinkClass(isActive, l.pipe)}
            >
              {l.pipe && <PipeIcon className="h-6 w-6" />}
              {l.label}
            </NavLink>
          ))}

          <div className="my-4 border-t border-navy-800" />

          <button
            onClick={() => {
              onClose();
              toggle();
            }}
            className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-navy-900 px-4 text-lg font-semibold text-steel-100 active:bg-navy-800"
          >
            <span className="text-2xl">{dark ? '☀️' : '🌙'}</span>
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-navy-700 px-4 text-lg font-semibold text-steel-200 active:bg-navy-800"
          >
            <span className="text-2xl">⏻</span>
            Cerrar sesión
          </button>
        </nav>
      </div>
    </div>
  );
}

export function Layout() {
  const { logout, usuario } = useApp();
  const { dark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = usuario?.rol === 'admin' ? [...links, { to: '/registro', label: 'Usuarios', pipe: false }] : links;

  // Cierra el drawer al cambiar de ruta (por si se navega desde otro lugar).
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  async function doLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="safe-top safe-x sticky top-0 z-20 border-b border-navy-800 bg-navy-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4">
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-3 py-3">
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              <Logo />
            </NavLink>

            {/* Nav en desktop/tablet */}
            <nav className="hidden flex-1 flex-wrap items-center gap-1 md:flex">
              {navLinks.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => linkClass(isActive, l.pipe)}>
                  {l.pipe && <PipeIcon className="h-4 w-4" />}
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle dark={dark} toggle={toggle} />
              <button
                onClick={doLogout}
                className="rounded border border-navy-600 px-3 py-1.5 text-sm text-steel-300 transition-colors hover:bg-navy-800 hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Botón hamburguesa en móvil (44 px) */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded border border-navy-600 text-white active:bg-navy-800 md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navLinks={navLinks}
        dark={dark}
        toggle={toggle}
        onLogout={doLogout}
      />

      <main
        className="safe-x mx-auto max-w-7xl overflow-x-hidden px-3 pb-28 pt-5 sm:px-4 sm:pt-6 md:pb-6"
        key={location.pathname}
      >
        <Outlet />
      </main>
      <footer className="safe-x safe-bottom mx-auto max-w-7xl px-4 pb-6 text-center text-xs text-steel-400">
        Plataforma interna de inteligencia comercial · Datos de investigación con corte 7-jul-2026 · Las carteras son
        proyecciones, no inversión garantizada.
      </footer>
      <Fab />
      <InstallPrompt />
    </div>
  );
}
