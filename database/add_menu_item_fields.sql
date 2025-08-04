-- Migration to add allergens and dietary_info columns to menu_items table
-- Run this in your Supabase SQL editor

-- Add allergens column
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT;
COMMENT ON COLUMN menu_items.allergens IS 'Allergen information (e.g., "Nuts, Dairy, Gluten")';

-- Add dietary_info column  
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS dietary_info TEXT;
COMMENT ON COLUMN menu_items.dietary_info IS 'Dietary information (e.g., "Vegetarian, Vegan, Gluten-Free")';

-- Add is_available column for better admin control
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
COMMENT ON COLUMN menu_items.is_available IS 'Whether item is currently available for ordering';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);