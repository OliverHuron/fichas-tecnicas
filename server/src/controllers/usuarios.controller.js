const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function toApi(row) {
  return {
    id: row.id,
    username: row.username,
    nombreCompleto: row.nombre_completo,
    cargo: row.cargo,
    role: row.role,
    activo: row.activo,
    comisionId: row.comision_id,
    comisionTipo: row.comision_tipo,
    comisionNombre: row.comision_nombre,
    createdAt: row.created_at,
  };
}

const SELECT_BASE = `
  SELECT u.*, c.tipo AS comision_tipo, c.nombre AS comision_nombre
  FROM users u
  LEFT JOIN comisiones c ON c.id = u.comision_id
`;

async function listar(req, res) {
  const { rows } = await pool.query(`${SELECT_BASE} ORDER BY u.role, u.nombre_completo`);
  res.json(rows.map(toApi));
}

async function crear(req, res) {
  const { username, password, nombreCompleto, cargo, role, comisionId } = req.body || {};

  if (!username || !password || !nombreCompleto || !role) {
    return res.status(400).json({ error: 'username, password, nombreCompleto y role son requeridos.' });
  }
  if (!['coordinador', 'directivo'].includes(role)) {
    return res.status(400).json({ error: 'role inválido.' });
  }
  if (role === 'coordinador' && !comisionId) {
    return res.status(400).json({ error: 'Un coordinador debe tener una comisión asignada.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, nombre_completo, cargo, role, comision_id, debe_cambiar_password)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id`,
      [username, passwordHash, nombreCompleto, cargo || null, role, role === 'coordinador' ? comisionId : null]
    );

    const { rows: full } = await pool.query(`${SELECT_BASE} WHERE u.id = $1`, [rows[0].id]);
    res.status(201).json(toApi(full[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese nombre de usuario ya existe.' });
    }
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
}

async function actualizar(req, res) {
  const { id } = req.params;
  const { nombreCompleto, cargo, comisionId, activo } = req.body || {};

  const { rows: existingRows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  const existing = existingRows[0];
  if (!existing) return res.status(404).json({ error: 'Usuario no encontrado.' });

  if (existing.role === 'coordinador' && comisionId === null) {
    return res.status(400).json({ error: 'Un coordinador debe tener una comisión asignada.' });
  }

  const { rows } = await pool.query(
    `UPDATE users SET
       nombre_completo = COALESCE($1, nombre_completo),
       cargo = COALESCE($2, cargo),
       comision_id = CASE WHEN $3::int IS NOT NULL THEN $3 ELSE comision_id END,
       activo = COALESCE($4, activo)
     WHERE id = $5
     RETURNING id`,
    [nombreCompleto || null, cargo || null, comisionId || null, activo === undefined ? null : activo, id]
  );

  const { rows: full } = await pool.query(`${SELECT_BASE} WHERE u.id = $1`, [rows[0].id]);
  res.json(toApi(full[0]));
}

async function resetPassword(req, res) {
  const { id } = req.params;
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const { rowCount } = await pool.query(
    'UPDATE users SET password_hash = $1, debe_cambiar_password = true WHERE id = $2',
    [passwordHash, id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json({ ok: true });
}

module.exports = { listar, crear, actualizar, resetPassword };
