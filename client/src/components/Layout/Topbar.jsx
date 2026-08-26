import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ROLE_LABEL = {
  directivo: 'Directivo',
  coordinador: 'Coordinador de comisión',
};

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const iniciales = (user?.nombreCompleto || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-user">
        <div className="who">
          <div className="nombre">{user?.nombreCompleto}</div>
          <div className="rol">
            {ROLE_LABEL[user?.role] || user?.role}
            {user?.comisionNombre ? ` · ${user.comisionNombre}` : ''}
          </div>
        </div>
        <div className="avatar">{iniciales}</div>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}
