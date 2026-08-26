const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const { rows } = await pool.query(
    `SELECT u.*, c.tipo AS comision_tipo, c.nombre AS comision_nombre
     FROM users u
     LEFT JOIN comisiones c ON c.id = u.comision_id
     WHERE username = $1`,
    [username]
  );
  const user = rows[0];
  if (!user || !user.activo) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      nombreCompleto: user.nombre_completo,
      cargo: user.cargo,
      role: user.role,
      debeCambiarPassword: user.debe_cambiar_password,
      comisionId: user.comision_id,
      comisionTipo: user.comision_tipo,
      comisionNombre: user.comision_nombre,
    },
  });
}));

router.get('/me', requireAuth, (req, res) => {
  const u = req.user;
  res.json({
    id: u.id,
    username: u.username,
    nombreCompleto: u.nombre_completo,
    cargo: u.cargo,
    role: u.role,
    debeCambiarPassword: u.debe_cambiar_password,
    comisionId: u.comision_id,
    comisionTipo: u.comision_tipo,
    comisionNombre: u.comision_nombre,
  });
});

router.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    'UPDATE users SET password_hash = $1, debe_cambiar_password = false WHERE id = $2',
    [newHash, req.user.id]
  );
  res.json({ ok: true });
}));

module.exports = router;
