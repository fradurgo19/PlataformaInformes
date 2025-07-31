-- Script para agregar la columna header_notes a la tabla reports
-- Ejecutar en la base de datos de Neon

-- Agregar la nueva columna header_notes después de la columna ott
ALTER TABLE reports ADD COLUMN IF NOT EXISTS header_notes TEXT;

-- Agregar comentario a la columna para documentación
COMMENT ON COLUMN reports.header_notes IS 'Campo multilinea para notas adicionales en el header del reporte';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'header_notes'; 