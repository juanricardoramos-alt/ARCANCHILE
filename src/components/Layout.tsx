import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/catalogo', label: 'Proyectos' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/plan', label: 'Plan de Acción' },
  { to: '/alertas', label: 'Alertas' },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 font-black text-navy-950">A</span>
      <span className={`text-lg font-black tracking-wider ${dark ? 'text-navy-900' : 'text-white'}`}>
        ARCANCHILE
        <span className="ml-2 hidden text-[10px] font-semibold tracking-normal text-steel-400 sm:inline">
          INGENIERÍA · INSPECCIÓN
        </span>
      </span>
    </span>
  );
}

export function Layout() {
  const { logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-navy-800 bg-navy-900 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Logo />
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-amber-500 text-navy-950' : 'text-steel-300 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded border border-navy-600 px-3 py-1.5 text-sm text-steel-300 transition-colors hover:bg-navy-800 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-6 text-center text-xs text-steel-400">
        Plataforma interna de inteligencia comercial · Datos de investigación con corte 7-jul-2026 · Las carteras son
        proyecciones, no inversión garantizada.
      </footer>
    </div>
  );
}
