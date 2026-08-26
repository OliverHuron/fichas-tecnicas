import SiNo from './SiNo.jsx';
import './ficha.css';

export default function FichaPreviewPage2({ solicitud }) {
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

      <table className="ficha-table ficha-table-fixed">
        <colgroup>
          {Array.from({ length: 10 }).map((_, i) => (
            <col key={i} style={{ width: '10%' }} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            <td className="ficha-label" colSpan={3}>Objetivo de la actividad</td>
            <td className="ficha-value" colSpan={7}>{s.objetivoActividad}</td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={3}>Autoridades invitadas (Grado Académico, Nombre y Cargo)</td>
            <td className="ficha-value" colSpan={7}>{s.autoridadesInvitadas}</td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={3}>Programa del evento o actividad</td>
            <td className="ficha-value" colSpan={7}>{s.programaEvento}</td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={3}>
              Datos estadísticos <span className="ficha-hint">(Beneficiarios del evento o actividad)</span>
            </td>
            <td className="ficha-value" colSpan={7}>{s.datosEstadisticos}</td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={3}>
              Información de contraste <span className="ficha-hint">(Información histórica del evento)</span>
            </td>
            <td className="ficha-value" colSpan={7}>{s.informacionContraste}</td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={3}>
              Presupuesto estimado desglosado <span className="ficha-hint">(Agregar cotizaciones)</span>
            </td>
            <td className="ficha-value" colSpan={7}>{s.presupuestoEstimado}</td>
          </tr>

          <tr>
            <td className="ficha-checkbox-label" colSpan={3}>Se requiere Diseño Gráfico</td>
            <td className="ficha-checkbox-value" colSpan={7}>
              <SiNo value={s.requiereDiseno} />
              <span className="ficha-coord-note">Si, Programar con la M.A. Alicia Contreras Lugo</span>
              {s.requiereDiseno && s.disenoDescripcion ? <div>{s.disenoDescripcion}</div> : null}
            </td>
          </tr>
          <tr>
            <td className="ficha-checkbox-label" colSpan={3}>Se requiere Publicación en la Página y Redes Sociales</td>
            <td className="ficha-checkbox-value" colSpan={7}>
              <SiNo value={s.requierePublicacion} />
              <span className="ficha-coord-note">Si, Programar con el I.S.C. Héctor Ulises Gaona Campos</span>
              {s.requierePublicacion && s.publicacionDescripcion ? <div>{s.publicacionDescripcion}</div> : null}
            </td>
          </tr>
          <tr>
            <td className="ficha-checkbox-label" colSpan={3}>Se requiere Transmisión en vivo y/o grabación del evento</td>
            <td className="ficha-checkbox-value" colSpan={7}>
              <SiNo value={s.requiereTransmision} />
              <span className="ficha-coord-note">Si, Programar con el L.C. y L.I.A. Aldo Flores Morales</span>
              {s.requiereTransmision && s.transmisionDescripcion ? <div>{s.transmisionDescripcion}</div> : null}
            </td>
          </tr>
          <tr>
            <td className="ficha-checkbox-label" colSpan={3}>Se requiere Equipo Informático</td>
            <td className="ficha-checkbox-value" colSpan={7}>
              <SiNo value={s.requiereEquipoInformatico} />
              <span className="ficha-coord-note">Si, Programar con el C.P. Iván Fernández Mandujano</span>
              {s.requiereEquipoInformatico && s.equipoInformaticoDescripcion ? <div>{s.equipoInformaticoDescripcion}</div> : null}
            </td>
          </tr>
          <tr>
            <td className="ficha-label" colSpan={6}>¿La actividad deriva de un compromiso de la Rectora?</td>
            <td className="ficha-value" colSpan={4}>
              <SiNo value={s.derivaRectora} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="ficha-signature-block">
        <span className="ficha-signature-line">
          {s.firmaNombre || '-'} {s.firmaCargo ? `· ${s.firmaCargo}` : ''}
        </span>
      </div>

      <div className="ficha-folio">Folio de Control Interno: {s.folio}</div>
    </div>
  );
}
