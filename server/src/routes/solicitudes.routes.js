const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ctrl = require('../controllers/solicitudes.controller');

const router = express.Router();

// Público: cualquier solicitante puede crear una ficha sin iniciar sesión.
router.post('/', asyncHandler(ctrl.crear));

// Protegido: solo coordinadores/directivos autenticados consultan solicitudes.
router.get('/', requireAuth, asyncHandler(ctrl.listar));
router.get('/:id', requireAuth, asyncHandler(ctrl.obtener));
router.patch('/:id/estado', requireAuth, asyncHandler(ctrl.actualizarEstado));

// SSE: solo directivos ven en tiempo real cuándo abre la ficha cada comisión.
router.get('/:id/stream', requireAuth, requireRole('directivo'), asyncHandler(ctrl.streamEstados));

module.exports = router;
