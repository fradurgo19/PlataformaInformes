-- Costos por usuario (mantenimiento, desplazamiento, viáticos, mano de obra)
-- Ejecutar en Neon PostgreSQL después de add-user-columns.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS cost_mtto_250h NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_mtto_500h NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_mtto_1000h NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_mtto_2000h NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_desplazamiento_km NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_hospedaje_dia NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_alimentacion_dia NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_hora_viaje_tecnico NUMERIC(14, 2),
ADD COLUMN IF NOT EXISTS cost_valor_hora_mano_obra NUMERIC(14, 2);
