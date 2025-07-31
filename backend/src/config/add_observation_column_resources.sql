-- Add observation column to resources table
ALTER TABLE resources ADD COLUMN observation TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN resources.observation IS 'Additional observations or notes about the resource';

-- Update existing records to have empty observation (optional)
UPDATE resources SET observation = '' WHERE observation IS NULL; 