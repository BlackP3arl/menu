-- Fix Row Level Security policies for menu_items table
-- Run this in your Supabase SQL editor

-- Check if RLS is enabled and causing issues
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'menu_items';

-- Temporarily disable RLS for menu_items to test (NOT recommended for production)
-- ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- Or create more permissive policies for development
-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "menu_items_select_policy" ON menu_items;
    DROP POLICY IF EXISTS "menu_items_insert_policy" ON menu_items;
    DROP POLICY IF EXISTS "menu_items_update_policy" ON menu_items;
    DROP POLICY IF EXISTS "menu_items_delete_policy" ON menu_items;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create permissive policies for development (adjust for production security)
CREATE POLICY "menu_items_select_policy" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_policy" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_items_update_policy" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "menu_items_delete_policy" ON menu_items FOR DELETE USING (true);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'menu_items';