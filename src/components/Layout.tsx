import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PipeIcon } from './ui';

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

export function Layout() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function doLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-navy-800 bg-navy-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4">
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-3 py-3">
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              <Logo />
            </NavLink>

            {/* Nav en desktop/tablet */}
            <nav className="hidden flex-1 flex-wrap items-center gap-1 md:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => linkClass(isActive, l.pipe)}>
                  {l.pipe && <PipeIcon className="h-4 w-4" />}
                  {l.label}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={doLogout}
              className="hidden rounded border border-navy-600 px-3 py-1.5 text-sm text-steel-300 transition-colors hover:bg-navy-800 hover:text-white md:block"
            >
              Cerrar sesión
            </button>

            {/* Botón hamburguesa en móvil */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded border border-navy-600 text-white md:hidden"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Menú desplegable en móvil */}
          {menuOpen && (
            <nav className="flex flex-col gap-1 border-t border-navy-800 pb-3 pt-2 md:hidden">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `${linkClass(isActive, l.pipe)} text-base`}
                >
                  {l.pipe && <PipeIcon className="h-5 w-5" />}
                  {l.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  doLogout();
                }}
                className="mt-1 rounded border border-navy-600 px-3 py-2 text-left text-base text-steel-300 hover:bg-navy-800 hover:text-white"
              >
                Cerrar sesión
              </button>
            </nav>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl overflow-x-hidden px-3 py-5 sm:px-4 sm:py-6" key={location.pathname}>
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 text-center text-xs text-steel-400">
        Plataforma interna de inteligencia comercial · Datos de investigación con corte 7-jul-2026 · Las carteras son
        proyecciones, no inversión garantizada.
      </footer>
    </div>
  );
}
