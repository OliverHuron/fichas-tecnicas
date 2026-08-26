const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ctrl = require('../controllers/usuarios.controller');

const router = express.Router();

router.use(requireAuth, requireRole('directivo'));

router.get('/', asyncHandler(ctrl.listar));
router.post('/', asyncHandler(ctrl.crear));
router.patch('/:id', asyncHandler(ctrl.actualizar));
router.post('/:id/reset-password', asyncHandler(ctrl.resetPassword));

module.exports = router;
