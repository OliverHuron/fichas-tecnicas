-- Permite marcar varios días para el evento y para el montaje anticipado
-- (ej. un evento de 3 días). Se conservan fecha_evento/fecha_montaje como el
-- primer día del rango, por compatibilidad con lo que ya usa la lista y la
-- ficha; el detalle completo de días vive en las columnas nuevas.

ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS fecha_evento_dias DATE[] NOT NULL DEFAULT '{}';
ALTER TABLE solicitudes ADD COLUMN IF NOT EXISTS fecha_montaje_dias DATE[] NOT NULL DEFAULT '{}';

UPDATE solicitudes SET fecha_evento_dias = ARRAY[fecha_evento]
  WHERE fecha_evento IS NOT NULL AND fecha_evento_dias = '{}';

UPDATE solicitudes SET fecha_montaje_dias = ARRAY[fecha_montaje]
  WHERE fecha_montaje IS NOT NULL AND fecha_montaje_dias = '{}';
