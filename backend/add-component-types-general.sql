-- Tipos de componente: información general + adicionales (sin duplicados)
-- Ejecutar en Neon PostgreSQL (idempotente)

INSERT INTO component_types (name, description)
VALUES
  ('Job Site / Sitio de trabajo', 'Condiciones del sitio de trabajo / Job site conditions'),
  ('Operation / Operación', 'Condiciones de operación / Operation conditions'),
  ('Appearance / Apariencia', 'Apariencia general del equipo / Equipment appearance'),
  ('General / General', 'Información general del equipo / General equipment information'),
  ('Aftertreatment System / Sistema Postratamiento', 'Sistema de postratamiento / Aftertreatment system'),
  ('Others / Otros', 'Otros componentes / Other components')
ON CONFLICT (name) DO NOTHING;

-- Quitar duplicados (variante ES/EN invertida) si ya se insertaron
DELETE FROM component_types
WHERE name IN (
  'Sitio de trabajo / Job Site',
  'Operación / Operation',
  'Apariencia / Appearance'
);
