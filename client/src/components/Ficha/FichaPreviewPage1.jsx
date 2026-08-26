import SiNo from './SiNo.jsx';
import { formatDate, formatDateList } from '../../utils/formatDate.js';
import './ficha.css';

export default function FichaPreviewPage1({ solicitud }) {
  const s = solicitud;

  return (
    <div className="ficha-a4">
      <div className="ficha-facultad">
        <h1>Facultad de Contaduría y </h1>
        <h1>Ciencias Administrativas</h1>
      </div>
      <div className="ficha-humanista">
        <h1>&quot;Humanista Por Siempre&quot;</h1>
      </div>

      <div className="ficha-fecha-envio-container">
        <div className="ficha-fecha-envio-label">Fecha de envío:</div>
        <table className="ficha-fecha-envio">
          <tbody>
            <tr>
              <td>{formatDate(s.fechaEnvio)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table className="ficha-table">
        <tbody>
          <tr>
            <td className="ficha-label">Nombre de la Coordinación</td>
            <td className="ficha-value" colSpan={3}>{s.nombreCoordinacion}</td>
          </tr>
          <tr>
            <td className="ficha-label">Nombre del Coordinador</td>
            <td className="ficha-value" colSpan={3}>{s.nombreCoordinador}</td>
          </tr>
          <tr>
            <td className="ficha-label">Nombre del evento o Actividad</td>
            <td className="ficha-value" colSpan={3}>{s.nombreEvento}</td>
          </tr>
          <tr>
            <td className="ficha-label-compact">
              Fecha del evento
              <br />
              Fija ( {s.fechaTipo === 'fija' ? 'X' : ' '} ) &nbsp; Propuesta ( {s.fechaTipo === 'propuesta' ? 'X' : ' '} )
            </td>
            <td className="ficha-value-compact">{formatDateList(s.fechaEventoDias, s.fechaEvento) || '-'}</td>
            <td className="ficha-hour-label">Hora:</td>
            <td className="ficha-hour-value">{s.horaEvento || '-'}</td>
          </tr>
          <tr>
            <td className="ficha-label-compact">Indicar si se requiere montaje anticipado.</td>
            <td className="ficha-value-compact">
              <SiNo value={s.requiereMontaje} />
              {s.requiereMontaje && (s.fechaMontajeDias?.length || s.fechaMontaje) ? (
                <div>{formatDateList(s.fechaMontajeDias, s.fechaMontaje)}</div>
              ) : null}
            </td>
            <td className="ficha-hour-label">Hora:</td>
            <td className="ficha-hour-value">{s.horaMontaje || '-'}</td>
          </tr>
          <tr>
            <td className="ficha-label">Lugar</td>
            <td className="ficha-value" colSpan={3}>{s.lugar}</td>
          </tr>
          <tr>
            <td className="ficha-label">Domicilio completo donde se planea desarrollar el evento</td>
            <td className="ficha-value" colSpan={3}>{s.domicilio}</td>
          </tr>
          <tr>
            <td className="ficha-label">Duración estimada</td>
            <td className="ficha-value" colSpan={3}>{s.duracionEstimada}</td>
          </tr>
          <tr>
            <td className="ficha-label">Responsable, contacto o enlace del evento (nombre, cargo y teléfono)</td>
            <td className="ficha-value" colSpan={3}>{s.responsableContacto}</td>
          </tr>
          <tr>
            <td className="ficha-label">Participantes, asistentes a destacar y/o público al que va dirigido</td>
            <td className="ficha-value" colSpan={3}>{s.participantesPublico}</td>
          </tr>
        </tbody>
      </table>

      <div className="ficha-folio">Folio de Control Interno: {s.folio}</div>
    </div>
  );
}
