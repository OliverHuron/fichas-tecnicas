-- Fichas Técnicas - esquema inicial

CREATE TABLE IF NOT EXISTS comisiones (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(40) UNIQUE NOT NULL, -- diseno_grafico | pagina_redes | transmision | equipo_informatico
  nombre VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(60) UNIQUE NOT NULL,
  password_hash VARCHAR(120) NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  cargo VARCHAR(150),
  role VARCHAR(20) NOT NULL CHECK (role IN ('coordinador', 'directivo')),
  comision_id INTEGER REFERENCES comisiones(id),
  activo BOOLEAN NOT NULL DEFAULT true,
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coordinador_requiere_comision CHECK (
    (role = 'coordinador' AND comision_id IS NOT NULL) OR (role = 'directivo')
  )
);

CREATE SEQUENCE IF NOT EXISTS folio_seq START 1;

CREATE TABLE IF NOT EXISTS solicitudes (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(30) UNIQUE NOT NULL,

  -- Hoja 1
  fecha_envio DATE NOT NULL DEFAULT CURRENT_DATE,
  nombre_coordinacion VARCHAR(200) NOT NULL,
  nombre_coordinador VARCHAR(200) NOT NULL,
  nombre_evento VARCHAR(250) NOT NULL,
  fecha_tipo VARCHAR(10) NOT NULL CHECK (fecha_tipo IN ('fija', 'propuesta')),
  fecha_evento DATE,
  hora_evento VARCHAR(20),
  requiere_montaje BOOLEAN NOT NULL DEFAULT false,
  fecha_montaje DATE,
  hora_montaje VARCHAR(20),
  lugar VARCHAR(250),
  domicilio TEXT,
  duracion_estimada VARCHAR(150),
  responsable_contacto TEXT,
  participantes_publico TEXT,

  -- Hoja 2
  objetivo_actividad TEXT,
  autoridades_invitadas TEXT,
  programa_evento TEXT,
  datos_estadisticos TEXT,
  informacion_contraste TEXT,
  presupuesto_estimado TEXT,

  requiere_diseno BOOLEAN NOT NULL DEFAULT false,
  diseno_descripcion TEXT,
  requiere_publicacion BOOLEAN NOT NULL DEFAULT false,
  publicacion_descripcion TEXT,
  requiere_transmision BOOLEAN NOT NULL DEFAULT false,
  transmision_descripcion TEXT,
  requiere_equipo_informatico BOOLEAN NOT NULL DEFAULT false,
  equipo_informatico_descripcion TEXT,

  deriva_rectora BOOLEAN NOT NULL DEFAULT false,
  firma_nombre VARCHAR(200),
  firma_cargo VARCHAR(200),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solicitud_estados (
  id SERIAL PRIMARY KEY,
  solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  comision_id INTEGER NOT NULL REFERENCES comisiones(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado')),
  nota TEXT,
  actualizado_por INTEGER REFERENCES users(id),
  actualizado_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (solicitud_id, comision_id)
);

CREATE INDEX IF NOT EXISTS idx_solicitud_estados_comision ON solicitud_estados(comision_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_estados_solicitud ON solicitud_estados(solicitud_id);

INSERT INTO comisiones (tipo, nombre) VALUES
  ('diseno_grafico', 'Comisión Académica de Diseño y Comunicación'),
  ('pagina_redes', 'Comisión de Proyectos y Sistemas'),
  ('transmision', 'Comisión Académica de Infraestructura Informática'),
  ('equipo_informatico', 'Comisión Académica de Servicios Informáticos')
ON CONFLICT (tipo) DO NOTHING;
