-- Directorio de coordinaciones/comisiones académicas y su responsable, usado
-- para autocompletar "Nombre de la Coordinación" / "Nombre del Coordinador"
-- en el formulario público. No tiene relación con la tabla `comisiones`
-- (esa es solo para las 4 áreas que reciben solicitudes de apoyo).

CREATE TABLE IF NOT EXISTS directorio_coordinaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) UNIQUE NOT NULL,
  responsable VARCHAR(200) NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0
);

INSERT INTO directorio_coordinaciones (nombre, responsable, orden) VALUES
  ('Director', 'Rigoberto López Escalera', 1),
  ('Subdirector', 'Ramón Guztavo Ramos Díaz', 2),
  ('Secretaria Académica', 'Maria Luisa Jiménez López', 3),
  ('Secretaria Administrativa', 'Laura Pérez Santana', 4),
  ('Jefe de la División de Estudios de Posgrado', 'Norma Laura Godinez Reyes', 5),
  ('Comisión Académica de Atención Integral del Alumnado con Perspectiva de Género', 'Sandra Verónica Frías Paniagua', 6),
  ('Comisión Académica de Vinculación y Desarrollo Empresarial', 'Jesus Plata Sanchez', 7),
  ('Comisión Académica del Doctorado en Administración', 'Flor Madrigal Moreno', 8),
  ('Comisión Académica del Doctorado en Fiscal', 'José Rafael Aguilera Aguilera', 9),
  ('Comisión Académica de la Maestría en Administración', 'Mauricio Aurelio Chagolla Farias', 10),
  ('Comisión Académica de la Maestría en Fiscal', 'José Rafael Aguilera Aguilera', 11),
  ('Maestría en Defensa del Contribuyente', 'Moisés Salvador Becerra Medina', 12),
  ('Comisión Académica de Acreditación y Mejora Continua', 'Rosalba Cervantes Meza', 13),
  ('Comisión Académica de Investigación', 'Priscila Ortega Gómez', 14),
  ('Comisión Académica de la Licenciatura en Contaduría', 'Gerardo Sotelo Campos', 15),
  ('Comisión Académica de la Licenciatura en Administración', 'Stephany Ofelia Valdes Gonzalez', 16),
  ('Comisión Académica de la Licenciatura en Informática Administrativa', 'Felipe Vega Aguilar', 17),
  ('Comisión Académica de la Licenciatura en Mercadotecnia', 'Alejandra Berenice García Torres', 18),
  ('Comisión Académica del Sistema Abierto y en Línea', 'Yolanda Montejano Hernández', 19),
  ('Comisión Académica de Programas de Emprendimiento', 'Eunice Macias Guzmán', 20),
  ('Comisión Académica de Servicios Informáticos', 'Ivan Fernández Mandujano', 21),
  ('Comisión Académica de Diseño y Comunicación', 'Alicia Contreras Lugo', 22),
  ('Comisión Académica de Proyectos y Sistemas', 'Héctor Ulises Gaona Campos', 23),
  ('Comisión Académica de Infraestructura Informática', 'Aldo Flores Morales', 24),
  ('Comisión Académica de Recursos Financieros, Materiales y de Servicios', 'Maria de los Angeles Galvan Chairez', 25),
  ('Comisión Académica de Recursos Humanos', 'Víctor Hugo Cruz Sánchez', 26),
  ('Comisión Académica de Educación Continua y Seguimiento a Egresados', 'Claudia Alcántar Hernández', 27),
  ('Comisión Académica de Bibliotecas', 'Maricruz Valdez Plancarte', 28),
  ('Comisión Académica de Módulos de Apoyo Académico', 'Monica Marquez Perez', 29),
  ('Comisión Académica de Tutorías', 'Roxana Gabriela Villalón Valdez', 30),
  ('Comisión Académica de Servicio Social y Prácticas Profesionales', 'Blanca Esmeralda Cerna Garnica', 31),
  ('Comisión Académica de Intercambio Estudiantil y Eventos Culturales', 'Diego Orihuela Equihua', 32)
ON CONFLICT (nombre) DO NOTHING;
