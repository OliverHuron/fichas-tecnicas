// Mapea cada casilla de la ficha técnica a la comisión responsable.
const FLAGS = [
  { flagField: 'requiereDiseno', descField: 'disenoDescripcion', tipo: 'diseno_grafico' },
  { flagField: 'requierePublicacion', descField: 'publicacionDescripcion', tipo: 'pagina_redes' },
  { flagField: 'requiereTransmision', descField: 'transmisionDescripcion', tipo: 'transmision' },
  { flagField: 'requiereEquipoInformatico', descField: 'equipoInformaticoDescripcion', tipo: 'equipo_informatico' },
];

module.exports = { FLAGS };
