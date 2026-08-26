const express = require('express');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Público: el formulario de nueva solicitud lo usa sin haber iniciado sesión.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      'SELECT id, nombre, responsable FROM directorio_coordinaciones ORDER BY orden, nombre'
    );
    res.json(rows);
  })
);

module.exports = router;
