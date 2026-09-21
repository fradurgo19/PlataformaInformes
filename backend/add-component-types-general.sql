-- Tipos de componente: información general + adicionales
-- Ejecutar en Neon PostgreSQL (idempotente)

INSERT INTO component_types (name, description)
VALUES
  ('Job Site / Sitio de trabajo', 'Condiciones del sitio de trabajo / Job site conditions'),
  ('Sitio de trabajo / Job Site', 'Condiciones del sitio de trabajo / Job site conditions'),
  ('Operation / Operación', 'Condiciones de operación / Operation conditions'),
  ('Operación / Operation', 'Condiciones de operación / Operation conditions'),
  ('Appearance / Apariencia', 'Apariencia general del equipo / Equipment appearance'),
  ('Apariencia / Appearance', 'Apariencia general del equipo / Equipment appearance'),
  ('General / General', 'Información general del equipo / General equipment information'),
  ('Aftertreatment System / Sistema Postratamiento', 'Sistema de postratamiento / Aftertreatment system'),
  ('Others / Otros', 'Otros componentes / Other components')
ON CONFLICT (name) DO NOTHING;
