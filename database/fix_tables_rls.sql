-- Fix Row Level Security policies for tables table
-- Run this in your Supabase SQL editor

-- Check if RLS is enabled and causing issues
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'tables';

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "tables_select_policy" ON tables;
    DROP POLICY IF EXISTS "tables_insert_policy" ON tables;
    DROP POLICY IF EXISTS "tables_update_policy" ON tables;
    DROP POLICY IF EXISTS "tables_delete_policy" ON tables;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create permissive policies for development (adjust for production security)
CREATE POLICY "tables_select_policy" ON tables FOR SELECT USING (true);
CREATE POLICY "tables_insert_policy" ON tables FOR INSERT WITH CHECK (true);
CREATE POLICY "tables_update_policy" ON tables FOR UPDATE USING (true);
CREATE POLICY "tables_delete_policy" ON tables FOR DELETE USING (true);

-- Enable RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Add updated_at column if it doesn't exist
ALTER TABLE tables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_tables_updated_at ON tables;
CREATE TRIGGER update_tables_updated_at 
    BEFORE UPDATE ON tables 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tables';