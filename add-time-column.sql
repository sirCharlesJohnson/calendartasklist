-- Add time column to todos table
ALTER TABLE todos ADD COLUMN IF NOT EXISTS time TEXT;

-- Update existing todos to have null time (optional)
-- UPDATE todos SET time = NULL WHERE time IS NULL;
