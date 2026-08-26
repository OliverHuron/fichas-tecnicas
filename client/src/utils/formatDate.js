// Espera fechas en formato "YYYY-MM-DD" (como las devuelve la API) y las
// muestra como "DD/MM/YYYY". Cualquier otro valor se regresa sin tocar.
export function formatDate(value) {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

// Junta varios días (evento de más de una fecha) en una sola lista legible.
// Si no hay arreglo (fichas viejas), cae de regreso a la fecha única.
export function formatDateList(dias, single) {
  if (Array.isArray(dias) && dias.length > 0) {
    return [...dias].sort().map(formatDate).join(', ');
  }
  return formatDate(single);
}

// Espera un timestamp ISO completo (con hora) y lo muestra en hora local
// como "DD/MM/YYYY HH:mm".
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const datePart = date.toLocaleDateString('es-MX');
  const timePart = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
}
