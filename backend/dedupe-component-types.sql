-- Limpieza: dejar una sola opción por tipo (EN / ES)
-- Ejecutar en Neon si ya existen los duplicados

-- Reasignar componentes que usaban el nombre invertido al canónico
UPDATE components
SET type = 'Job Site / Sitio de trabajo'
WHERE type = 'Sitio de trabajo / Job Site';

UPDATE components
SET type = 'Operation / Operación'
WHERE type = 'Operación / Operation';

UPDATE components
SET type = 'Appearance / Apariencia'
WHERE type = 'Apariencia / Appearance';

-- Eliminar duplicados del catálogo
DELETE FROM component_types
WHERE name IN (
  'Sitio de trabajo / Job Site',
  'Operación / Operation',
  'Apariencia / Appearance'
);
