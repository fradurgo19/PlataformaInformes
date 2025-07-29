-- Script para agregar nuevas columnas a la tabla users
-- Ejecutar en Neon PostgreSQL

-- Agregar nuevas columnas a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS zone VARCHAR(100),
ADD COLUMN IF NOT EXISTS brands TEXT[],
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_zone ON users(zone);
CREATE INDEX IF NOT EXISTS idx_users_specialty ON users(specialty);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating);

-- Actualizar la función de trigger para incluir las nuevas columnas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificar que el trigger existe y funciona
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo para las nuevas columnas (opcional)
-- UPDATE users SET 
--     zone = 'Bogotá',
--     brands = ARRAY['CAT', 'Komatsu', 'Hitachi'],
--     specialty = 'Excavadoras',
--     rating = 4.5
-- WHERE username = 'admin';

-- Mostrar la estructura actualizada de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position; 