import { useEffect, useState } from 'react';
import { api } from '../api/client';

const emptyForm = {
  username: '',
  password: '',
  nombreCompleto: '',
  cargo: '',
  role: 'coordinador',
  comisionId: '',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState(null);
  const [comisiones, setComisiones] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
    api.listarComisiones().then(setComisiones);
  }, []);

  function load() {
    api.listarUsuarios().then(setUsuarios).catch((err) => setError(err.message));
  }

  function startEdit(u) {
    setEditingUser(u);
    setForm({
      username: u.username,
      password: '',
      nombreCompleto: u.nombreCompleto,
      cargo: u.cargo || '',
      role: u.role,
      comisionId: u.comisionId ? String(u.comisionId) : '',
    });
    setError('');
    setSuccess('');
  }

  function cancelEdit() {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.actualizarUsuario(editingUser.id, {
          nombreCompleto: form.nombreCompleto,
          cargo: form.cargo,
          comisionId: form.role === 'coordinador' ? Number(form.comisionId) : null,
        });
        setSuccess('Usuario actualizado correctamente.');
        setEditingUser(null);
        setForm(emptyForm);
      } else {
        await api.crearUsuario({
          ...form,
          comisionId: form.role === 'coordinador' ? Number(form.comisionId) : null,
        });
        setSuccess('Usuario creado correctamente.');
        setForm(emptyForm);
      }
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActivo(u) {
    await api.actualizarUsuario(u.id, { activo: !u.activo });
    load();
  }

  async function handleResetPassword(u) {
    const newPassword = window.prompt(`Nueva contraseña temporal para ${u.username} (mínimo 8 caracteres):`);
    if (!newPassword) return;
    try {
      await api.resetPassword(u.id, newPassword);
      setSuccess(`Contraseña de ${u.username} actualizada.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          {editingUser ? `Editar usuario · ${editingUser.username}` : 'Nuevo usuario'}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Usuario</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <div className="form-field">
                <label>Contraseña temporal</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                />
              </div>
            )}
            <div className="form-field">
              <label>Nombre completo</label>
              <input
                type="text"
                value={form.nombreCompleto}
                onChange={(e) => setForm((f) => ({ ...f, nombreCompleto: e.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label>Cargo</label>
              <input type="text" value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={!!editingUser}
              >
                <option value="coordinador">Coordinador de comisión</option>
                <option value="directivo">Directivo</option>
              </select>
            </div>
            {form.role === 'coordinador' && (
              <div className="form-field">
                <label>Comisión asignada</label>
                <select
                  value={form.comisionId}
                  onChange={(e) => setForm((f) => ({ ...f, comisionId: e.target.value }))}
                  required
                >
                  <option value="">Selecciona una comisión…</option>
                  {comisiones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            {editingUser ? (
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Cancelar
              </button>
            ) : (
              <span />
            )}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginTop: 0 }}>Usuarios existentes</div>
        {!usuarios ? (
          <div>Cargando…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Comisión</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>
                    {u.nombreCompleto}
                    {u.cargo ? ` (${u.cargo})` : ''}
                  </td>
                  <td>{u.role === 'directivo' ? 'Directivo' : 'Coordinador'}</td>
                  <td>{u.comisionNombre || '-'}</td>
                  <td>{u.activo ? 'Sí' : 'No'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => startEdit(u)}>
                      Editar
                    </button>
                    <button className="btn btn-secondary" onClick={() => toggleActivo(u)}>
                      {u.activo ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleResetPassword(u)}>
                      Restablecer contraseña
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
