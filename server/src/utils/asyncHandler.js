// Express 4 no reenvía rechazos de promesas al middleware de errores por sí
// solo. Sin este wrapper, un error dentro de un controlador async deja la
// petición colgada en vez de responder con un error claro.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
