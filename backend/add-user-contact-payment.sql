-- Contacto y forma de pago por usuario
-- Ejecutar en Neon PostgreSQL (después de add-user-cost-columns.sql)

ALTER TABLE users
ADD COLUMN IF NOT EXISTS contact VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255);
