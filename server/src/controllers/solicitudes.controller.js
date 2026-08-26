const pool = require('../config/db');
const { nextFolio } = require('../utils/folio');
const { FLAGS } = require('../utils/comisiones');
const eventBus = require('../utils/events');

function firstDate(dias) {
  if (!Array.isArray(dias) || dias.length === 0) return null;
  return [...dias].sort()[0];
}

function toRow(body) {
  const fechaEventoDias = Array.isArray(body.fechaEventoDias) ? body.fechaEventoDias : [];
  const fechaMontajeDias = Array.isArray(body.fechaMontajeDias) ? body.fechaMontajeDias : [];

  return {
    nombre_coordinacion: body.nombreCoordinacion,
    nombre_coordinador: body.nombreCoordinador,
    nombre_evento: body.nombreEvento,
    fecha_tipo: body.fechaTipo,
    fecha_evento: firstDate(fechaEventoDias),
    fecha_evento_dias: fechaEventoDias,
    hora_evento: body.horaEvento || null,
    requiere_montaje: !!body.requiereMontaje,
    fecha_montaje: firstDate(fechaMontajeDias),
    fecha_montaje_dias: fechaMontajeDias,
    hora_montaje: body.horaMontaje || null,
    lugar: body.lugar || null,
    domicilio: body.domicilio || null,
    duracion_estimada: body.duracionEstimada || null,
    responsable_contacto: body.responsableContacto || null,
    participantes_publico: body.participantesPublico || null,
    objetivo_actividad: body.objetivoActividad || null,
    autoridades_invitadas: body.autoridadesInvitadas || null,
    programa_evento: body.programaEvento || null,
    datos_estadisticos: body.datosEstadisticos || null,
    informacion_contraste: body.informacionContraste || null,
    presupuesto_estimado: body.presupuestoEstimado || null,
    requiere_diseno: !!body.requiereDiseno,
    diseno_descripcion: body.disenoDescripcion || null,
    requiere_publicacion: !!body.requierePublicacion,
    publicacion_descripcion: body.publicacionDescripcion || null,
    requiere_transmision: !!body.requiereTransmision,
    transmision_descripcion: body.transmisionDescripcion || null,
    requiere_equipo_informatico: !!body.requiereEquipoInformatico,
    equipo_informatico_descripcion: body.equipoInformaticoDescripcion || null,
    deriva_rectora: !!body.derivaRectora,
    firma_nombre: body.firmaNombre || null,
    firma_cargo: body.firmaCargo || null,
  };
}

function mapEstado(e) {
  return {
    comisionId: e.comision_id,
    comisionTipo: e.comision_tipo,
    comisionNombre: e.comision_nombre,
    estado: e.estado,
    nota: e.nota,
    visto: e.visto,
    vistoAt: e.visto_at,
    actualizadoPor: e.actualizado_por_nombre || null,
    actualizadoAt: e.actualizado_at,
  };
}

function toApi(row, estados = []) {
  return {
    id: row.id,
    folio: row.folio,
    fechaEnvio: row.fecha_envio,
    nombreCoordinacion: row.nombre_coordinacion,
    nombreCoordinador: row.nombre_coordinador,
    nombreEvento: row.nombre_evento,
    fechaTipo: row.fecha_tipo,
    fechaEvento: row.fecha_evento,
    fechaEventoDias: row.fecha_evento_dias || [],
    horaEvento: row.hora_evento,
    requiereMontaje: row.requiere_montaje,
    fechaMontaje: row.fecha_montaje,
    fechaMontajeDias: row.fecha_montaje_dias || [],
    horaMontaje: row.hora_montaje,
    lugar: row.lugar,
    domicilio: row.domicilio,
    duracionEstimada: row.duracion_estimada,
    responsableContacto: row.responsable_contacto,
    participantesPublico: row.participantes_publico,
    objetivoActividad: row.objetivo_actividad,
    autoridadesInvitadas: row.autoridades_invitadas,
    programaEvento: row.programa_evento,
    datosEstadisticos: row.datos_estadisticos,
    informacionContraste: row.informacion_contraste,
    presupuestoEstimado: row.presupuesto_estimado,
    requiereDiseno: row.requiere_diseno,
    disenoDescripcion: row.diseno_descripcion,
    requierePublicacion: row.requiere_publicacion,
    publicacionDescripcion: row.publicacion_descripcion,
    requiereTransmision: row.requiere_transmision,
    transmisionDescripcion: row.transmision_descripcion,
    requiereEquipoInformatico: row.requiere_equipo_informatico,
    equipoInformaticoDescripcion: row.equipo_informatico_descripcion,
    derivaRectora: row.deriva_rectora,
    firmaNombre: row.firma_nombre,
    firmaCargo: row.firma_cargo,
    createdAt: row.created_at,
    estados: estados.map(mapEstado),
  };
}

const REQUIRED_FIELDS = ['nombreCoordinacion', 'nombreCoordinador', 'nombreEvento', 'fechaTipo'];

async function crear(req, res) {
  const body = req.body || {};
  const missing = REQUIRED_FIELDS.filter((f) => !body[f]);
  if (missing.length) {
    return res.status(400).json({ error: `Faltan campos requeridos: ${missing.join(', ')}` });
  }
  if (!['fija', 'propuesta'].includes(body.fechaTipo)) {
    return res.status(400).json({ error: 'fechaTipo debe ser "fija" o "propuesta".' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const folio = await nextFolio(client);
    const row = toRow(body);
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');

    const insertSql = `INSERT INTO solicitudes (folio, ${columns.join(', ')})
      VALUES ($1, ${placeholders}) RETURNING *`;
    const { rows: inserted } = await client.query(insertSql, [folio, ...values]);
    const solicitud = inserted[0];

    const { rows: comisiones } = await client.query('SELECT id, tipo FROM comisiones');
    const comisionByTipo = Object.fromEntries(comisiones.map((c) => [c.tipo, c.id]));

    for (const flag of FLAGS) {
      if (row[dbFlagColumn(flag.flagField)]) {
        const comisionId = comisionByTipo[flag.tipo];
        if (comisionId) {
          await client.query(
            `INSERT INTO solicitud_estados (solicitud_id, comision_id) VALUES ($1, $2)
             ON CONFLICT (solicitud_id, comision_id) DO NOTHING`,
            [solicitud.id, comisionId]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json(toApi(solicitud));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'No se pudo registrar la solicitud.' });
  } finally {
    client.release();
  }
}

function dbFlagColumn(flagField) {
  const map = {
    requiereDiseno: 'requiere_diseno',
    requierePublicacion: 'requiere_publicacion',
    requiereTransmision: 'requiere_transmision',
    requiereEquipoInformatico: 'requiere_equipo_informatico',
  };
  return map[flagField];
}

async function fetchEstados(solicitudIds) {
  if (!solicitudIds.length) return {};
  const { rows } = await pool.query(
    `SELECT se.*, c.tipo AS comision_tipo, c.nombre AS comision_nombre, u.nombre_completo AS actualizado_por_nombre
     FROM solicitud_estados se
     JOIN comisiones c ON c.id = se.comision_id
     LEFT JOIN users u ON u.id = se.actualizado_por
     WHERE se.solicitud_id = ANY($1::int[])
     ORDER BY c.nombre`,
    [solicitudIds]
  );
  const bySolicitud = {};
  for (const r of rows) {
    if (!bySolicitud[r.solicitud_id]) bySolicitud[r.solicitud_id] = [];
    bySolicitud[r.solicitud_id].push(r);
  }
  return bySolicitud;
}

async function listar(req, res) {
  const { user } = req;
  let rows;

  if (user.role === 'directivo') {
    ({ rows } = await pool.query('SELECT * FROM solicitudes ORDER BY created_at DESC'));
  } else {
    ({ rows } = await pool.query(
      `SELECT DISTINCT s.* FROM solicitudes s
       JOIN solicitud_estados se ON se.solicitud_id = s.id
       WHERE se.comision_id = $1
       ORDER BY s.created_at DESC`,
      [user.comision_id]
    ));
  }

  const estadosMap = await fetchEstados(rows.map((r) => r.id));
  const scoped = (id) => scopeEstados(estadosMap[id] || [], user);
  res.json(rows.map((r) => toApi(r, scoped(r.id))));
}

// Un coordinador solo debe ver el estado/nota de su propia comisión, nunca el de las demás.
function scopeEstados(estados, user) {
  if (user.role === 'directivo') return estados;
  return estados.filter((e) => e.comision_id === user.comision_id);
}

async function obtener(req, res) {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM solicitudes WHERE id = $1', [id]);
  const solicitud = rows[0];
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada.' });

  if (req.user.role === 'coordinador') {
    // Abrir la ficha solo marca "visto" — el estado (pendiente/aceptado/
    // completado) lo sigue cambiando el coordinador a mano, nunca solo.
    const { rowCount } = await pool.query(
      `UPDATE solicitud_estados
       SET visto = true,
           visto_at = COALESCE(visto_at, now())
       WHERE solicitud_id = $1 AND comision_id = $2`,
      [id, req.user.comision_id]
    );
    if (!rowCount) {
      return res.status(403).json({ error: 'No tienes acceso a esta solicitud.' });
    }
    eventBus.emit(`solicitud:${id}`);
  }

  const estadosMap = await fetchEstados([solicitud.id]);
  const estados = estadosMap[solicitud.id] || [];

  res.json(toApi(solicitud, scopeEstados(estados, req.user)));
}

// SSE: empuja el arreglo de estados actualizado cada vez que algún coordinador
// abre la ficha (marca "visto"). Solo directivos se suscriben a esto.
async function streamEstados(req, res) {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders?.();
  res.write(':ok\n\n'); // fuerza el primer flush para que la conexión quede abierta de inmediato

  async function pushEstados() {
    const estadosMap = await fetchEstados([id]);
    const estados = estadosMap[id] || [];
    const payload = scopeEstados(estados, req.user).map(mapEstado);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  const onUpdate = () => {
    pushEstados().catch((err) => console.error('Error enviando evento SSE:', err));
  };

  eventBus.on(`solicitud:${id}`, onUpdate);

  const heartbeat = setInterval(() => res.write(':\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.off(`solicitud:${id}`, onUpdate);
    res.end();
  });
}

async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { estado, nota, comisionId } = req.body || {};

  if (!['pendiente', 'aceptado', 'completado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  let targetComisionId = comisionId;
  if (req.user.role === 'coordinador') {
    targetComisionId = req.user.comision_id;
  }
  if (!targetComisionId) {
    return res.status(400).json({ error: 'comisionId es requerido.' });
  }

  const { rows } = await pool.query(
    `UPDATE solicitud_estados
     SET estado = $1, nota = $2, actualizado_por = $3, actualizado_at = now()
     WHERE solicitud_id = $4 AND comision_id = $5
     RETURNING *`,
    [estado, nota || null, req.user.id, id, targetComisionId]
  );

  if (!rows[0]) {
    return res.status(404).json({ error: 'No existe esa comisión asignada a la solicitud.' });
  }

  eventBus.emit(`solicitud:${id}`);
  res.json({ ok: true });
}

module.exports = { crear, listar, obtener, actualizarEstado, streamEstados };
