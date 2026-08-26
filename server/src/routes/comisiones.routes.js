const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT id, tipo, nombre FROM comisiones ORDER BY nombre');
    res.json(rows);
  })
);

module.exports = router;
