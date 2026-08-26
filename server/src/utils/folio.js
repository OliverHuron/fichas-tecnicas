async function nextFolio(client) {
  const year = new Date().getFullYear();
  const { rows } = await client.query("SELECT nextval('folio_seq') AS n");
  const n = String(rows[0].n).padStart(4, '0');
  return `FT-${year}-${n}`;
}

module.exports = { nextFolio };
