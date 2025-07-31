-- Add observation column to parameters table
ALTER TABLE parameters ADD COLUMN observation TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN parameters.observation IS 'Additional observations or notes about the parameter';

-- Update existing records to have empty observation (optional)
UPDATE parameters SET observation = '' WHERE observation IS NULL; 