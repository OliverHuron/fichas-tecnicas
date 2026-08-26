import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, getToken } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import { ESTADO_LABEL } from '../constants.js';
import { formatDateTime } from '../utils/formatDate.js';
import FichaPreviewPage1 from '../components/Ficha/FichaPreviewPage1.jsx';
import FichaPreviewPage2 from '../components/Ficha/FichaPreviewPage2.jsx';
import Modal from '../components/Modal.jsx';
import { IconZoomIn, IconZoomOut, IconMessage, IconEye } from '../components/icons.jsx';
import './solicitudDetail.css';

const ZOOM_MIN = 0.35;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;
const ZOOM_DEFAULT = 1;

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [solicitud, setSolicitud] = useState(null);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Solo directivos ven cuándo cada comisión abre la ficha, en tiempo real vía SSE.
  useEffect(() => {
    if (user.role !== 'directivo') return undefined;

    const source = new EventSource(`/api/solicitudes/${id}/stream?token=${encodeURIComponent(getToken())}`);
    source.onmessage = (event) => {
      const estados = JSON.parse(event.data);
      setSolicitud((prev) => (prev ? { ...prev, estados } : prev));
    };
    return () => source.close();
  }, [id, user.role]);

  function load() {
    api
      .obtenerSolicitud(id)
      .then(setSolicitud)
      .catch((err) => setError(err.message));
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!solicitud) return <div>Cargando…</div>;

  return (
    <div>
      <div className="no-print" style={{ marginBottom: 16 }}>
        <Link to="/solicitudes" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="detail-grid">
        <div className="card no-print avance-panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Avance por comisión</div>
          {solicitud.estados.length === 0 ? (
            <div style={{ color: 'var(--gris-texto)' }}>Esta solicitud no requirió apoyo de ninguna comisión.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Comisión</th>
                  <th>Estado</th>
                  {user.role === 'directivo' && <th>Visto</th>}
                  <th>Mensaje</th>
                  <th>Última actualización</th>
                </tr>
              </thead>
              <tbody>
                {solicitud.estados.map((e) => (
                  <EstadoRow
                    key={e.comisionId}
                    estado={e}
                    editable={user.role === 'coordinador' && e.comisionTipo === user.comisionTipo}
                    showVisto={user.role === 'directivo'}
                    onUpdated={load}
                    solicitudId={solicitud.id}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        <PreviewPanel solicitud={solicitud} zoom={zoom} setZoom={setZoom} />
      </div>
    </div>
  );
}

function EstadoRow({ estado, editable, showVisto, onUpdated, solicitudId }) {
  const [estadoValue, setEstadoValue] = useState(estado.estado);
  const [nota, setNota] = useState(estado.nota || '');
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await api.actualizarEstado(solicitudId, { estado: estadoValue, nota, comisionId: estado.comisionId });
      setShowModal(false);
      onUpdated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td>{estado.comisionNombre}</td>
      <td>
        {editable ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={estadoValue} onChange={(e) => setEstadoValue(e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="aceptado">Aceptado</option>
              <option value="completado">Completado</option>
            </select>
            {estadoValue !== estado.estado && (
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            )}
          </div>
        ) : (
          <span className={`badge badge-${estado.estado}`}>{ESTADO_LABEL[estado.estado]}</span>
        )}
      </td>
      {showVisto && (
        <td>
          <span
            className={estado.visto ? 'visto-badge visto-si' : 'visto-badge visto-no'}
            title={estado.visto ? (estado.vistoAt ? `Visto: ${formatDateTime(estado.vistoAt)}` : 'Visto') : 'Aún no lo abren'}
          >
            <IconEye />
          </span>
        </td>
      )}
      <td>
        <button className="icon-btn" onClick={() => setShowModal(true)} title="Ver / escribir mensaje">
          <IconMessage />
        </button>
        {showModal && (
          <Modal title={`Mensaje · ${estado.comisionNombre}`} onClose={() => setShowModal(false)}>
            {editable ? (
              <>
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label>Nota para esta comisión</label>
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Escribe una nota…"
                    rows={4}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </>
            ) : (
              <p style={{ margin: 0, color: 'var(--texto)', whiteSpace: 'pre-wrap' }}>
                {estado.nota || 'Sin notas.'}
              </p>
            )}
          </Modal>
        )}
      </td>
      <td>{estado.actualizadoAt ? formatDateTime(estado.actualizadoAt) : '-'}</td>
    </tr>
  );
}

function PreviewPanel({ solicitud, zoom, setZoom }) {
  const [generating, setGenerating] = useState(false);

  function zoomIn() {
    setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  }
  function zoomOut() {
    setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  }

  async function handleDownloadPdf() {
    setGenerating(true);
    const prevZoom = zoom;
    setZoom(1);
    // Espera a que React vuelva a pintar a 100% (sin el transform del zoom)
    // antes de capturar, para que el PDF no salga escalado.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    try {
      const { exportFichaPdf } = await import('../utils/exportPdf.js');
      const elements = document.querySelectorAll('.preview-zoom-wrap .ficha-a4');
      await exportFichaPdf(elements, `${solicitud.folio || 'ficha'}.pdf`);
    } finally {
      setZoom(prevZoom);
      setGenerating(false);
    }
  }

  return (
    <div className="preview-panel">
      <div className="preview-toolbar no-print">
        <div style={{ fontWeight: 700, fontSize: 13 }}>Vista previa de la ficha</div>
        <div className="preview-zoom-controls">
          <button className="zoom-btn" onClick={zoomOut} title="Alejar">
            <IconZoomOut />
          </button>
          <span className="preview-zoom-level">{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={zoomIn} title="Acercar">
            <IconZoomIn />
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            Imprimir
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={generating}>
            {generating ? 'Generando…' : 'PDF'}
          </button>
        </div>
      </div>
      <div className="preview-scroll">
        <div className="preview-zoom-wrap" style={{ transform: `scale(${zoom})` }}>
          <FichaPreviewPage1 solicitud={solicitud} />
          <FichaPreviewPage2 solicitud={solicitud} />
        </div>
      </div>
    </div>
  );
}
