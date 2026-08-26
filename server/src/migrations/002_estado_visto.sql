-- Renombra el estado intermedio "en_proceso" a "aceptado" (se activa solo al
-- abrir la ficha) y agrega el registro de "visto" por comisión.

ALTER TABLE solicitud_estados DROP CONSTRAINT IF EXISTS solicitud_estados_estado_check;

UPDATE solicitud_estados SET estado = 'aceptado' WHERE estado = 'en_proceso';

ALTER TABLE solicitud_estados
  ADD CONSTRAINT solicitud_estados_estado_check
  CHECK (estado IN ('pendiente', 'aceptado', 'completado'));

ALTER TABLE solicitud_estados ADD COLUMN IF NOT EXISTS visto BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE solicitud_estados ADD COLUMN IF NOT EXISTS visto_at TIMESTAMPTZ;
