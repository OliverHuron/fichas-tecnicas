const { Pool, types } = require('pg');

// Sin esto, node-postgres convierte las columnas DATE a objetos Date de JS
// interpretados en la zona horaria del proceso y luego a ISO string (con hora
// y "Z"), lo que además arriesga correr la fecha un día según el huso horario
// del servidor. Devolvemos el string "YYYY-MM-DD" tal cual lo entrega Postgres.
types.setTypeParser(1082, (val) => val);

// OID 1182 = _date (arreglo de DATE). Mismo motivo: regresamos cada elemento
// como string "YYYY-MM-DD" plano en vez de un arreglo de objetos Date.
types.setTypeParser(1182, (val) => {
  if (!val || val === '{}') return [];
  return val.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
