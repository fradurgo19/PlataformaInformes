-- Script de migración para agregar la columna reason_of_service
-- Ejecutar en la base de datos de Neon

-- Verificar si la columna ya existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reports' 
        AND column_name = 'reason_of_service'
    ) THEN
        -- Agregar la nueva columna reason_of_service
        ALTER TABLE reports ADD COLUMN reason_of_service TEXT;
        
        -- Agregar comentario a la columna para documentación
        COMMENT ON COLUMN reports.reason_of_service IS 'Campo multilinea para razón del servicio en el header del reporte';
        
        RAISE NOTICE 'Columna reason_of_service agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna reason_of_service ya existe';
    END IF;
END $$;

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name = 'reason_of_service'; 