import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/Layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CrearSolicitudPage from './pages/CrearSolicitudPage.jsx';
import SolicitudesListPage from './pages/SolicitudesListPage.jsx';
import SolicitudDetailPage from './pages/SolicitudDetailPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';
import PerfilPage from './pages/PerfilPage.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 40 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/solicitudes" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/crear-nueva-solicitud" element={<CrearSolicitudPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/solicitudes" replace />} />
        <Route path="solicitudes" element={<SolicitudesListPage />} />
        <Route path="solicitudes/:id" element={<SolicitudDetailPage />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute roles={['directivo']}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
