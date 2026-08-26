require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const DEFAULT_PASSWORD = 'FichaTecnica2026!';

const COORDINADORES = [
  {
    username: 'acontreras',
    nombre_completo: 'Alicia Contreras Lugo',
    cargo: 'M.A.',
    comisionTipo: 'diseno_grafico',
  },
  {
    username: 'hgaona',
    nombre_completo: 'Héctor Ulises Gaona Campos',
    cargo: 'I.S.C.',
    comisionTipo: 'pagina_redes',
  },
  {
    username: 'aflores',
    nombre_completo: 'Aldo Flores Morales',
    cargo: 'L.C. y L.I.A.',
    comisionTipo: 'transmision',
  },
  {
    username: 'ifernandez',
    nombre_completo: 'Iván Fernández Mandujano',
    cargo: 'C.P.',
    comisionTipo: 'equipo_informatico',
  },
];

const DIRECTIVOS = [
  {
    username: 'directivo',
    nombre_completo: 'Dirección',
    cargo: 'Directivo',
  },
];

async function upsertUser(client, { username, nombre_completo, cargo, role, comision_id }) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const { rows } = await client.query(
    `INSERT INTO users (username, password_hash, nombre_completo, cargo, role, comision_id, debe_cambiar_password)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     ON CONFLICT (username) DO NOTHING
     RETURNING id`,
    [username, passwordHash, nombre_completo, cargo, role, comision_id || null]
  );
  return rows[0];
}

async function run() {
  const client = await pool.connect();
  try {
    const { rows: comisiones } = await client.query('SELECT id, tipo FROM comisiones');
    const comisionByTipo = Object.fromEntries(comisiones.map((c) => [c.tipo, c.id]));

    for (const c of COORDINADORES) {
      const comision_id = comisionByTipo[c.comisionTipo];
      if (!comision_id) {
        console.warn(`Comisión no encontrada para tipo ${c.comisionTipo}, ¿corriste las migraciones?`);
        continue;
      }
      const created = await upsertUser(client, { ...c, role: 'coordinador', comision_id });
      console.log(created ? `Creado coordinador: ${c.username}` : `Ya existía: ${c.username}`);
    }

    for (const d of DIRECTIVOS) {
      const created = await upsertUser(client, { ...d, role: 'directivo' });
      console.log(created ? `Creado directivo: ${d.username}` : `Ya existía: ${d.username}`);
    }

    console.log('\nContraseña temporal para todos los usuarios nuevos:', DEFAULT_PASSWORD);
    console.log('Pídeles cambiarla desde su perfil al ingresar por primera vez.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
