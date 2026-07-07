import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { ProjectDetail } from './pages/ProjectDetail';
import { Companies } from './pages/Companies';
import { ActionPlan } from './pages/ActionPlan';
import { Alerts } from './pages/Alerts';

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed } = useApp();
  if (!isAuthed) return <Navigate to="/login" replace />;
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
        <Route path="/proyectos/:id" element={<ProjectDetail />} />
        <Route path="/empresas" element={<Companies />} />
        <Route path="/plan" element={<ActionPlan />} />
        <Route path="/alertas" element={<Alerts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
