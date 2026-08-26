import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/formatDate.js';
import { ESTADO_LABEL } from '../constants.js';

export default function SolicitudesListPage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listarSolicitudes()
      .then(setSolicitudes)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!solicitudes) return <div>Cargando…</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>
          {user.role === 'directivo' ? 'Todas las solicitudes' : `Solicitudes para ${user.comisionNombre}`}
        </div>
        <div style={{ fontSize: 13, color: 'var(--gris-texto)' }}>{solicitudes.length} en total</div>
      </div>

      {solicitudes.length === 0 ? (
        <div style={{ color: 'var(--gris-texto)' }}>No hay solicitudes por ahora.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Evento</th>
              <th>Coordinación</th>
              <th>Fecha</th>
              {user.role === 'directivo' ? <th>Comisiones / avance</th> : <th>Estado</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id}>
                <td>{s.folio}</td>
                <td>{s.nombreEvento}</td>
                <td>{s.nombreCoordinacion}</td>
                <td>{s.fechaEvento ? formatDate(s.fechaEvento) : <em>{s.fechaTipo}</em>}</td>
                <td>
                  {user.role === 'directivo' ? (
                    s.estados.length === 0 ? (
                      <span style={{ color: 'var(--gris-texto)' }}>Sin comisiones asignadas</span>
                    ) : (
                      s.estados.map((e) => (
                        <span key={e.comisionId} className={`badge badge-${e.estado}`} style={{ marginRight: 6 }}>
                          {e.comisionNombre}: {ESTADO_LABEL[e.estado]}
                        </span>
                      ))
                    )
                  ) : (
                    (() => {
                      const mine = s.estados.find((e) => e.comisionTipo === user.comisionTipo);
                      return mine ? (
                        <span className={`badge badge-${mine.estado}`}>{ESTADO_LABEL[mine.estado]}</span>
                      ) : null;
                    })()
                  )}
                </td>
                <td>
                  <Link className="btn btn-secondary" to={`/solicitudes/${s.id}`}>
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
