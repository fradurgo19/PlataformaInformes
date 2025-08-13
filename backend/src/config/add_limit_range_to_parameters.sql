-- Migration: Add limit_range column to parameters table
-- Safe to run multiple times

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='parameters' AND column_name='limit_range'
    ) THEN
        ALTER TABLE parameters ADD COLUMN limit_range VARCHAR(100);
        COMMENT ON COLUMN parameters.limit_range IS 'Optional textual limit range, e.g., "85-95" or spec note';
    END IF;
END $$;


