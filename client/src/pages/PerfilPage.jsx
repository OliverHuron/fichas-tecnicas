import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

export default function PerfilPage() {
  const { user, refresh } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setSuccess('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="section-title" style={{ marginTop: 0 }}>Mi cuenta</div>
      <p style={{ fontSize: 14, color: 'var(--gris-texto)' }}>
        <strong>{user.nombreCompleto}</strong>
        <br />
        {user.cargo ? `${user.cargo} · ` : ''}
        {user.role === 'directivo' ? 'Directivo' : user.comisionNombre}
      </p>

      {user.debeCambiarPassword && (
        <div className="alert alert-error">Por seguridad, cambia tu contraseña temporal.</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field" style={{ marginBottom: 14 }}>
          <label>Contraseña actual</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="form-field" style={{ marginBottom: 20 }}>
          <label>Nueva contraseña</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
