const { EventEmitter } = require('events');

// Bus de eventos en memoria para push en tiempo real (SSE). Solo funciona
// dentro de un mismo proceso Node — si algún día se corre en cluster/varias
// instancias de PM2, esto necesitaría moverse a algo compartido (Redis, etc).
const bus = new EventEmitter();
bus.setMaxListeners(0);

module.exports = bus;
