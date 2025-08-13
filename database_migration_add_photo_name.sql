-- Migration: Add photo_name field to photos table
-- Date: 2025-08-11
-- Description: Add optional photo name field for better photo identification

-- Add photo_name column to photos table
ALTER TABLE photos ADD COLUMN photo_name VARCHAR(255);

-- Add comment to document the field
COMMENT ON COLUMN photos.photo_name IS 'Optional custom name for the photo (e.g., "Front view", "Engine compartment", "Hydraulic system")';

-- Update existing photos to have a default name based on their current filename
UPDATE photos 
SET photo_name = CASE 
    WHEN file_path LIKE '%.jpg' THEN 'Photo ' || id
    WHEN file_path LIKE '%.jpeg' THEN 'Photo ' || id
    WHEN file_path LIKE '%.png' THEN 'Photo ' || id
    WHEN file_path LIKE '%.gif' THEN 'Photo ' || id
    WHEN file_path LIKE '%.webp' THEN 'Photo ' || id
    WHEN file_path LIKE '%.svg' THEN 'Photo ' || id
    ELSE 'Photo ' || id
END
WHERE photo_name IS NULL;

-- Verify the migration
SELECT COUNT(*) as total_photos, 
       COUNT(photo_name) as photos_with_names,
       COUNT(*) - COUNT(photo_name) as photos_without_names
FROM photos;
