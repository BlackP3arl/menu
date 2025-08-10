-- Fix Row Level Security policies for item_options table
-- Run this in your Supabase SQL editor

-- Check if RLS is enabled and causing issues
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'item_options';

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "item_options_select_policy" ON item_options;
    DROP POLICY IF EXISTS "item_options_insert_policy" ON item_options;
    DROP POLICY IF EXISTS "item_options_update_policy" ON item_options;
    DROP POLICY IF EXISTS "item_options_delete_policy" ON item_options;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create permissive policies for development (adjust for production security)
CREATE POLICY "item_options_select_policy" ON item_options FOR SELECT USING (true);
CREATE POLICY "item_options_insert_policy" ON item_options FOR INSERT WITH CHECK (true);
CREATE POLICY "item_options_update_policy" ON item_options FOR UPDATE USING (true);
CREATE POLICY "item_options_delete_policy" ON item_options FOR DELETE USING (true);

-- Enable RLS
ALTER TABLE item_options ENABLE ROW LEVEL SECURITY;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'item_options';