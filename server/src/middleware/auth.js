const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  // EventSource (SSE) no puede mandar headers personalizados, así que para esa
  // conexión el token viaja como query param en vez de Authorization.
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token || null;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.nombre_completo, u.cargo, u.role, u.activo,
              u.debe_cambiar_password, u.comision_id, c.tipo AS comision_tipo, c.nombre AS comision_nombre
       FROM users u
       LEFT JOIN comisiones c ON c.id = u.comision_id
       WHERE u.id = $1`,
      [payload.sub]
    );
    const user = rows[0];
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Cuenta inválida o deshabilitada.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión inválida o expirada.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
