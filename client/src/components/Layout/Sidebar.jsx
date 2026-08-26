import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function IconSolicitudes() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

function IconUsuarios() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCuenta() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/umsnh_logo.png" alt="UMSNH" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/solicitudes" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <IconSolicitudes />
          Solicitudes
        </NavLink>

        {user?.role === 'directivo' && (
          <NavLink to="/usuarios" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <IconUsuarios />
            Usuarios
          </NavLink>
        )}

        <NavLink to="/perfil" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <IconCuenta />
          Mi cuenta
        </NavLink>
      </nav>

      <div className="sidebar-foot">#HumanistaPorSiempre</div>
    </aside>
  );
}
