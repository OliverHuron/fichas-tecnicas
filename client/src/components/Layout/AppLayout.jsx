import { Outlet, useLocation, useMatch } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import './layout.css';

function useTitle() {
  const location = useLocation();
  const isDetail = useMatch('/solicitudes/:id');

  if (isDetail) return 'Detalle de solicitud';
  if (location.pathname.startsWith('/usuarios')) return 'Usuarios';
  if (location.pathname.startsWith('/perfil')) return 'Mi cuenta';
  return 'Solicitudes';
}

export default function AppLayout() {
  const title = useTitle();

  return (
    <div className="app-shell">
      <Sidebar />
      <Topbar title={title} />
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
}
