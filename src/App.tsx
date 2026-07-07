import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useApp } from './context/AppContext';
import type { Rol } from './data/types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { ProjectDetail } from './pages/ProjectDetail';
import { Pipeline } from './pages/Pipeline';
import { GestionComercial } from './pages/GestionComercial';
import { Companies } from './pages/Companies';
import { ActionPlan } from './pages/ActionPlan';
import { Alerts } from './pages/Alerts';

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-700 border-t-amber-500" />
        <p className="text-sm text-steel-400">Cargando…</p>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed, authReady } = useApp();
  if (!authReady) return <Splash />;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { usuario, authReady } = useApp();
  if (!authReady) return <Splash />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/gestion-comercial" element={<GestionComercial />} />
        <Route path="/proyectos/:id" element={<ProjectDetail />} />
        <Route path="/empresas" element={<Companies />} />
        <Route path="/plan" element={<ActionPlan />} />
        <Route path="/alertas" element={<Alerts />} />
        <Route
          path="/registro"
          element={
            <RequireRole roles={['admin']}>
              <Register />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
