require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const solicitudesRoutes = require('./routes/solicitudes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const comisionesRoutes = require('./routes/comisiones.routes');
const directorioRoutes = require('./routes/directorio.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'siaf-fichatecnica', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/comisiones', comisionesRoutes);
app.use('/api/directorio', directorioRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`siaf-fichatecnica API escuchando en puerto ${PORT}`);
});
