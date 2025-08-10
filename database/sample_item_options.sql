-- Sample item options data for testing
-- Run this after the main schema to add sample menu options
-- This assumes you have the demo restaurant and sample menu items

-- First, let's add some sample menu items if they don't exist
-- (You can skip this if you already have menu items)
INSERT INTO menu_items (id, category_id, name, description, base_price, prep_time, is_active) 
SELECT 
    gen_random_uuid(),
    cat.id,
    'Hot Chicken Wings',
    'Spicy chicken wings served with ranch dip',
    12.99,
    15,
    true
FROM categories cat 
WHERE cat.name = 'Appetizers' AND cat.restaurant_id = '550e8400-e29b-41d4-a716-446655440000'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (id, category_id, name, description, base_price, prep_time, is_active) 
SELECT 
    gen_random_uuid(),
    cat.id,
    'Grilled Salmon',
    'Fresh Atlantic salmon with lemon butter sauce',
    24.99,
    20,
    true
FROM categories cat 
WHERE cat.name = 'Main Course' AND cat.restaurant_id = '550e8400-e29b-41d4-a716-446655440000'
ON CONFLICT DO NOTHING;

-- Now add sample item options
-- Get the menu item IDs we just created
WITH chicken_wings AS (
  SELECT mi.id as menu_item_id 
  FROM menu_items mi 
  JOIN categories c ON mi.category_id = c.id 
  WHERE mi.name = 'Hot Chicken Wings' AND c.restaurant_id = '550e8400-e29b-41d4-a716-446655440000'
  LIMIT 1
),
salmon AS (
  SELECT mi.id as menu_item_id 
  FROM menu_items mi 
  JOIN categories c ON mi.category_id = c.id 
  WHERE mi.name = 'Grilled Salmon' AND c.restaurant_id = '550e8400-e29b-41d4-a716-446655440000'
  LIMIT 1
)

-- Insert sample options for Hot Chicken Wings
INSERT INTO item_options (menu_item_id, option_group, option_name, price_modifier, is_required, display_order, is_active)
SELECT menu_item_id, 'size', 'Small (6 pieces)', 0.00, false, 1, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'size', 'Medium (10 pieces)', 3.00, false, 2, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'size', 'Large (15 pieces)', 6.00, false, 3, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'preparation', 'Mild', 0.00, true, 1, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'preparation', 'Medium Spicy', 0.00, true, 2, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'preparation', 'Extra Hot', 1.00, true, 3, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'addons', 'Extra Ranch', 1.50, false, 1, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'addons', 'Blue Cheese Dip', 1.50, false, 2, true FROM chicken_wings
UNION ALL
SELECT menu_item_id, 'addons', 'Celery Sticks', 2.00, false, 3, true FROM chicken_wings

-- Insert sample options for Grilled Salmon  
UNION ALL
SELECT menu_item_id, 'preparation', 'Grilled', 0.00, true, 1, true FROM salmon
UNION ALL
SELECT menu_item_id, 'preparation', 'Blackened', 2.00, true, 2, true FROM salmon
UNION ALL
SELECT menu_item_id, 'preparation', 'Cedar Plank', 4.00, true, 3, true FROM salmon
UNION ALL
SELECT menu_item_id, 'addons', 'Extra Lemon Butter', 2.50, false, 1, true FROM salmon
UNION ALL
SELECT menu_item_id, 'addons', 'Garlic Mashed Potatoes', 4.00, false, 2, true FROM salmon
UNION ALL
SELECT menu_item_id, 'addons', 'Steamed Vegetables', 3.50, false, 3, true FROM salmon;

-- Verify the data was inserted
SELECT 
    io.*,
    mi.name as menu_item_name,
    c.name as category_name
FROM item_options io
JOIN menu_items mi ON io.menu_item_id = mi.id
JOIN categories c ON mi.category_id = c.id
WHERE c.restaurant_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY mi.name, io.option_group, io.display_order;