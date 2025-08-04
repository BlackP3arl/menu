-- Migration to add missing columns to tables table
-- Run this in your Supabase SQL editor

-- Add capacity column
ALTER TABLE tables ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4;
COMMENT ON COLUMN tables.capacity IS 'Number of seats at this table';

-- Add location column  
ALTER TABLE tables ADD COLUMN IF NOT EXISTS location VARCHAR(255);
COMMENT ON COLUMN tables.location IS 'Location or section of the table (e.g., "Main Dining", "Patio")';

-- Add updated_at column if it doesn't already exist
ALTER TABLE tables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tables_capacity ON tables(capacity);
CREATE INDEX IF NOT EXISTS idx_tables_location ON tables(location);

-- Verify the new columns exist
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tables' 
ORDER BY ordinal_position;