import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DatePickerCard from '../components/DatePickerCard.jsx';
import './crearSolicitud.css';

const OTRO = '__otro__';

const initialForm = {
  nombreCoordinacion: '',
  nombreCoordinador: '',
  nombreEvento: '',
  fechaTipo: 'fija',
  fechaEventoDias: [],
  horaEvento: '',
  requiereMontaje: false,
  fechaMontajeDias: [],
  horaMontaje: '',
  lugar: '',
  domicilio: '',
  duracionEstimadaHoras: '',
  responsableContacto: '',
  participantesPublico: '',

  objetivoActividad: '',
  autoridadesInvitadas: '',
  programaEvento: '',
  datosEstadisticos: '',
  informacionContraste: '',
  presupuestoEstimado: '',

  requiereDiseno: false,
  disenoDescripcion: '',
  requierePublicacion: false,
  publicacionDescripcion: '',
  requiereTransmision: false,
  transmisionDescripcion: '',
  requiereEquipoInformatico: false,
  equipoInformaticoDescripcion: '',

  derivaRectora: false,
  firmaNombre: '',
  firmaCargo: '',
};

function update(setForm, field, value) {
  setForm((prev) => ({ ...prev, [field]: value }));
}

export default function CrearSolicitudPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [folio, setFolio] = useState(null);
  const [directorio, setDirectorio] = useState([]);
  const [coordinacionOtro, setCoordinacionOtro] = useState(false);
  const [coordinadorOtro, setCoordinadorOtro] = useState(false);

  useEffect(() => {
    api
      .listarDirectorio()
      .then(setDirectorio)
      .catch((err) => console.error('No se pudo cargar el directorio de coordinaciones:', err));
  }, []);

  const coordinacionOptions = directorio.map((d) => d.nombre);
  const coordinadorOptions = [...new Set(directorio.map((d) => d.responsable))];

  function handleCoordinacionChange(value) {
    if (value === OTRO) {
      setCoordinacionOtro(true);
      update(setForm, 'nombreCoordinacion', '');
      return;
    }
    setCoordinacionOtro(false);
    const match = directorio.find((d) => d.nombre === value);
    setForm((prev) => ({
      ...prev,
      nombreCoordinacion: value,
      nombreCoordinador: match && !coordinadorOtro ? match.responsable : prev.nombreCoordinador,
    }));
  }

  function handleCoordinadorChange(value) {
    if (value === OTRO) {
      setCoordinadorOtro(true);
      update(setForm, 'nombreCoordinador', '');
      return;
    }
    setCoordinadorOtro(false);
    update(setForm, 'nombreCoordinador', value);
  }

  function validateStep1() {
    if (!form.nombreCoordinacion || !form.nombreCoordinador || !form.nombreEvento) {
      setError('Completa nombre de la coordinación, coordinador y evento antes de continuar.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const horas = Number(form.duracionEstimadaHoras) || 0;
      const payload = {
        ...form,
        duracionEstimada: horas > 0 ? `${horas} ${horas === 1 ? 'Hora' : 'Horas'}` : '',
        ...(form.requiereMontaje ? null : { fechaMontajeDias: [], horaMontaje: '' }),
      };
      const result = await api.crearSolicitud(payload);
      setFolio(result.folio);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (folio) {
    return (
      <div className="public-page">
        <Header />
        <div className="public-body">
          <div className="card confirmation-box">
            <div>Tu ficha técnica fue registrada correctamente.</div>
            <div className="folio">{folio}</div>
            <div style={{ color: 'var(--gris-texto)', fontSize: 13 }}>
              Guarda este folio de control interno como referencia. Las comisiones necesarias para tu
              evento ya fueron notificadas.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <Header />
      <div className="public-body">
        <div className="steps">
          <div className={`step-pill${step === 1 ? ' active' : ''}`}>1. Datos generales del evento</div>
          <div className={`step-pill${step === 2 ? ' active' : ''}`}>2. Detalle y apoyos requeridos</div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="card">
              <div className="section-title">Datos generales</div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre de la Coordinación</label>
                  <select
                    value={coordinacionOtro ? OTRO : form.nombreCoordinacion}
                    onChange={(e) => handleCoordinacionChange(e.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    {coordinacionOptions.map((nombre) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                    <option value={OTRO}>Otro / especificar manualmente</option>
                  </select>
                  {coordinacionOtro && (
                    <input
                      type="text"
                      style={{ marginTop: 8 }}
                      placeholder="Escribe el nombre de tu coordinación"
                      value={form.nombreCoordinacion}
                      onChange={(e) => update(setForm, 'nombreCoordinacion', e.target.value)}
                      required
                    />
                  )}
                </div>
                <div className="form-field">
                  <label>Nombre del Coordinador</label>
                  <select
                    value={coordinadorOtro ? OTRO : form.nombreCoordinador}
                    onChange={(e) => handleCoordinadorChange(e.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    {coordinadorOptions.map((nombre) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                    <option value={OTRO}>Otro / especificar manualmente</option>
                  </select>
                  {coordinadorOtro && (
                    <input
                      type="text"
                      style={{ marginTop: 8 }}
                      placeholder="Escribe el nombre del coordinador"
                      value={form.nombreCoordinador}
                      onChange={(e) => update(setForm, 'nombreCoordinador', e.target.value)}
                      required
                    />
                  )}
                </div>
                <div className="form-field full">
                  <label>Nombre del evento o Actividad</label>
                  <input
                    type="text"
                    value={form.nombreEvento}
                    onChange={(e) => update(setForm, 'nombreEvento', e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Lugar</label>
                  <input type="text" value={form.lugar} onChange={(e) => update(setForm, 'lugar', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Duración estimada</label>
                  <div className="input-unit-group">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      placeholder="0"
                      value={form.duracionEstimadaHoras}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d+$/.test(v)) update(setForm, 'duracionEstimadaHoras', v);
                      }}
                    />
                    <span className="unit-suffix">Horas</span>
                  </div>
                </div>
                <div className="form-field full">
                  <label>Domicilio completo donde se planea desarrollar el evento</label>
                  <textarea value={form.domicilio} onChange={(e) => update(setForm, 'domicilio', e.target.value)} />
                </div>

                <div className="form-field">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.requiereMontaje}
                      onChange={(e) => update(setForm, 'requiereMontaje', e.target.checked)}
                    />
                    Se requiere montaje anticipado
                  </label>
                </div>
                <div className="form-field">
                  <label>Tipo de fecha</label>
                  <select value={form.fechaTipo} onChange={(e) => update(setForm, 'fechaTipo', e.target.value)}>
                    <option value="fija">Fija</option>
                    <option value="propuesta">Propuesta</option>
                  </select>
                </div>

                <div className="form-field full">
                  <div className="date-cards-row">
                    <DatePickerCard
                      label="Fecha(s) del evento"
                      selectedDates={form.fechaEventoDias}
                      onChange={(dias) => update(setForm, 'fechaEventoDias', dias)}
                      time={form.horaEvento}
                      onTimeChange={(t) => update(setForm, 'horaEvento', t)}
                    />
                    <DatePickerCard
                      label="Fecha(s) de montaje anticipado"
                      selectedDates={form.fechaMontajeDias}
                      onChange={(dias) => update(setForm, 'fechaMontajeDias', dias)}
                      time={form.horaMontaje}
                      onTimeChange={(t) => update(setForm, 'horaMontaje', t)}
                      disabled={!form.requiereMontaje}
                    />
                  </div>
                </div>
                <div className="form-field full">
                  <label>Responsable, contacto o enlace del evento (nombre, cargo y teléfono)</label>
                  <textarea
                    value={form.responsableContacto}
                    onChange={(e) => update(setForm, 'responsableContacto', e.target.value)}
                  />
                </div>
                <div className="form-field full">
                  <label>Participantes, asistentes a destacar y/o público al que va dirigido</label>
                  <textarea
                    value={form.participantesPublico}
                    onChange={(e) => update(setForm, 'participantesPublico', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <span />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => validateStep1() && setStep(2)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <div className="section-title">Detalle de la actividad</div>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Objetivo de la actividad</label>
                  <textarea value={form.objetivoActividad} onChange={(e) => update(setForm, 'objetivoActividad', e.target.value)} />
                </div>
                <div className="form-field full">
                  <label>Autoridades invitadas (Grado Académico, Nombre y Cargo)</label>
                  <textarea
                    value={form.autoridadesInvitadas}
                    onChange={(e) => update(setForm, 'autoridadesInvitadas', e.target.value)}
                  />
                </div>
                <div className="form-field full">
                  <label>Programa del evento o actividad</label>
                  <textarea value={form.programaEvento} onChange={(e) => update(setForm, 'programaEvento', e.target.value)} />
                </div>
                <div className="form-field full">
                  <label>Datos estadísticos (beneficiarios del evento o actividad)</label>
                  <textarea value={form.datosEstadisticos} onChange={(e) => update(setForm, 'datosEstadisticos', e.target.value)} />
                </div>
                <div className="form-field full">
                  <label>Información de contraste (información histórica del evento)</label>
                  <textarea
                    value={form.informacionContraste}
                    onChange={(e) => update(setForm, 'informacionContraste', e.target.value)}
                  />
                </div>
                <div className="form-field full">
                  <label>Presupuesto estimado desglosado (agregar cotizaciones)</label>
                  <textarea
                    value={form.presupuestoEstimado}
                    onChange={(e) => update(setForm, 'presupuestoEstimado', e.target.value)}
                  />
                </div>
              </div>

              <div className="section-title">Apoyos requeridos</div>

              <RequiereField
                label="¿Se requiere Diseño Gráfico?"
                nota="Se enviará a la Comisión Académica de Diseño y Comunicación (M.A. Alicia Contreras Lugo)."
                checked={form.requiereDiseno}
                onCheck={(v) => update(setForm, 'requiereDiseno', v)}
                descripcion={form.disenoDescripcion}
                onDescripcion={(v) => update(setForm, 'disenoDescripcion', v)}
              />

              <RequiereField
                label="¿Se requiere Publicación en Página y Redes Sociales?"
                nota="Se enviará a la Comisión de Proyectos y Sistemas (I.S.C. Héctor Ulises Gaona Campos)."
                checked={form.requierePublicacion}
                onCheck={(v) => update(setForm, 'requierePublicacion', v)}
                descripcion={form.publicacionDescripcion}
                onDescripcion={(v) => update(setForm, 'publicacionDescripcion', v)}
              />

              <RequiereField
                label="¿Se requiere Transmisión en vivo y/o grabación?"
                nota="Se enviará a la Comisión Académica de Infraestructura Informática (L.C. y L.I.A. Aldo Flores Morales)."
                checked={form.requiereTransmision}
                onCheck={(v) => update(setForm, 'requiereTransmision', v)}
                descripcion={form.transmisionDescripcion}
                onDescripcion={(v) => update(setForm, 'transmisionDescripcion', v)}
              />

              <RequiereField
                label="¿Se requiere Equipo Informático?"
                nota="Se enviará a la Comisión Académica de Servicios Informáticos (C.P. Iván Fernández Mandujano)."
                checked={form.requiereEquipoInformatico}
                onCheck={(v) => update(setForm, 'requiereEquipoInformatico', v)}
                descripcion={form.equipoInformaticoDescripcion}
                onDescripcion={(v) => update(setForm, 'equipoInformaticoDescripcion', v)}
              />

              <div className="form-field" style={{ marginTop: 16 }}>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.derivaRectora}
                    onChange={(e) => update(setForm, 'derivaRectora', e.target.checked)}
                  />
                  ¿La actividad deriva de un compromiso de la Rectora?
                </label>
              </div>

              <div className="section-title">Firma</div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre de quien solicita</label>
                  <input type="text" value={form.firmaNombre} onChange={(e) => update(setForm, 'firmaNombre', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Cargo</label>
                  <input type="text" value={form.firmaCargo} onChange={(e) => update(setForm, 'firmaCargo', e.target.value)} />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  Atrás
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function RequiereField({ label, nota, checked, onCheck, descripcion, onDescripcion }) {
  return (
    <div className="requiere-block" style={{ marginBottom: 12 }}>
      <label className="checkbox-row">
        <input type="checkbox" checked={checked} onChange={(e) => onCheck(e.target.checked)} />
        {label}
      </label>
      <span className="coord-note">{nota}</span>
      {checked && (
        <textarea placeholder="Describe lo que se necesita…" value={descripcion} onChange={(e) => onDescripcion(e.target.value)} />
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="public-topbar">
      <div className="public-topbar-brand">
        <img src="/umsnh_logo.png" alt="UMSNH" />
      </div>
      <div className="public-topbar-title">FICHA TÉCNICA · NUEVA SOLICITUD DE EVENTO</div>
    </header>
  );
}
