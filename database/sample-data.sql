-- Sample data for testing the restaurant QR ordering system
-- Run this after the main schema to populate with test data

-- Insert sample menu items for the demo restaurant
INSERT INTO menu_items (category_id, name, description, base_price, prep_time, is_active) VALUES
-- Appetizers
((SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), 'Buffalo Wings', 'Crispy chicken wings tossed in spicy buffalo sauce', 12.99, 15, true),
((SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), 'Mozzarella Sticks', 'Golden fried mozzarella with marinara sauce', 8.99, 10, true),
((SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), 'Loaded Nachos', 'Tortilla chips with cheese, jalapeños, and sour cream', 10.99, 12, true),
((SELECT id FROM categories WHERE name = 'Appetizers' LIMIT 1), 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 9.99, 8, true),

-- Main Course
((SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1), 'Classic Burger', 'Beef patty with lettuce, tomato, onion, and pickles', 14.99, 20, true),
((SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1), 'Grilled Chicken', 'Marinated chicken breast with seasonal vegetables', 18.99, 25, true),
((SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1), 'Fish & Chips', 'Beer-battered cod with crispy fries and tartar sauce', 16.99, 18, true),
((SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1), 'Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 15.99, 15, true),
((SELECT id FROM categories WHERE name = 'Main Course' LIMIT 1), 'BBQ Ribs', 'Slow-cooked pork ribs with BBQ sauce and coleslaw', 22.99, 30, true),

-- Beverages
((SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Coca Cola', 'Classic soft drink', 2.99, 2, true),
((SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 3, true),
((SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Coffee', 'Freshly brewed coffee', 3.49, 5, true),
((SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Iced Tea', 'Sweet or unsweetened iced tea', 2.79, 2, true),
((SELECT id FROM categories WHERE name = 'Beverages' LIMIT 1), 'Craft Beer', 'Local craft beer selection', 5.99, 2, true),

-- Desserts
((SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), 'Chocolate Cake', 'Rich chocolate layer cake with frosting', 6.99, 5, true),
((SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), 'Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and whipped cream', 5.99, 3, true),
((SELECT id FROM categories WHERE name = 'Desserts' LIMIT 1), 'Apple Pie', 'Homemade apple pie with vanilla ice cream', 7.99, 8, true);

-- Insert item options for customization
INSERT INTO item_options (menu_item_id, option_group, option_name, price_modifier, is_required, display_order) VALUES

-- Classic Burger options
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'size', 'Regular', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'size', 'Large', 3.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'preparation', 'Rare', 0.00, false, 1),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'preparation', 'Medium Rare', 0.00, false, 2),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'preparation', 'Medium', 0.00, false, 3),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'preparation', 'Medium Well', 0.00, false, 4),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'preparation', 'Well Done', 0.00, false, 5),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'addons', 'Extra Cheese', 1.50, false, 1),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'addons', 'Bacon', 2.50, false, 2),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'addons', 'Avocado', 2.00, false, 3),
((SELECT id FROM menu_items WHERE name = 'Classic Burger' LIMIT 1), 'addons', 'Mushrooms', 1.00, false, 4),

-- Buffalo Wings options
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'size', '6 pieces', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'size', '12 pieces', 8.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'size', '24 pieces', 18.00, true, 3),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'preparation', 'Mild', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'preparation', 'Medium', 0.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'preparation', 'Hot', 0.00, true, 3),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'preparation', 'Extra Hot', 0.00, true, 4),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'addons', 'Ranch Dip', 0.50, false, 1),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'addons', 'Blue Cheese Dip', 0.50, false, 2),
((SELECT id FROM menu_items WHERE name = 'Buffalo Wings' LIMIT 1), 'addons', 'Celery Sticks', 0.75, false, 3),

-- Beverages options
((SELECT id FROM menu_items WHERE name = 'Coca Cola' LIMIT 1), 'size', 'Small', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Coca Cola' LIMIT 1), 'size', 'Medium', 1.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Coca Cola' LIMIT 1), 'size', 'Large', 2.00, true, 3),

((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'size', 'Small', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'size', 'Medium', 0.50, true, 2),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'size', 'Large', 1.00, true, 3),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'preparation', 'Black', 0.00, false, 1),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'preparation', 'With Cream', 0.00, false, 2),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'preparation', 'With Sugar', 0.00, false, 3),
((SELECT id FROM menu_items WHERE name = 'Coffee' LIMIT 1), 'preparation', 'With Cream and Sugar', 0.00, false, 4),

((SELECT id FROM menu_items WHERE name = 'Iced Tea' LIMIT 1), 'preparation', 'Sweet', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Iced Tea' LIMIT 1), 'preparation', 'Unsweetened', 0.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Iced Tea' LIMIT 1), 'size', 'Small', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Iced Tea' LIMIT 1), 'size', 'Medium', 0.50, true, 2),
((SELECT id FROM menu_items WHERE name = 'Iced Tea' LIMIT 1), 'size', 'Large', 1.00, true, 3),

-- Grilled Chicken options
((SELECT id FROM menu_items WHERE name = 'Grilled Chicken' LIMIT 1), 'preparation', 'Original Seasoning', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Grilled Chicken' LIMIT 1), 'preparation', 'Cajun Spiced', 0.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Grilled Chicken' LIMIT 1), 'preparation', 'Herb Crusted', 1.00, true, 3),
((SELECT id FROM menu_items WHERE name = 'Grilled Chicken' LIMIT 1), 'addons', 'Extra Vegetables', 2.00, false, 1),
((SELECT id FROM menu_items WHERE name = 'Grilled Chicken' LIMIT 1), 'addons', 'Garlic Butter', 1.00, false, 2),

-- Ice Cream Sundae options
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'preparation', 'Vanilla', 0.00, true, 1),
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'preparation', 'Chocolate', 0.00, true, 2),
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'preparation', 'Strawberry', 0.00, true, 3),
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'addons', 'Extra Whipped Cream', 0.50, false, 1),
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'addons', 'Cherry on Top', 0.25, false, 2),
((SELECT id FROM menu_items WHERE name = 'Ice Cream Sundae' LIMIT 1), 'addons', 'Nuts', 0.75, false, 3);

-- Update restaurant settings
UPDATE restaurants 
SET 
  contact_info = jsonb_build_object(
    'phone', '+1 (555) 123-4567',
    'email', 'info@demorestaurant.com',
    'address', '123 Main Street, City, State 12345'
  ),
  settings = jsonb_build_object(
    'currency', 'USD',
    'timezone', 'America/New_York',
    'operating_hours', jsonb_build_object(
      'monday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'tuesday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'wednesday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'thursday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'friday', jsonb_build_object('open', '11:00', 'close', '23:00'),
      'saturday', jsonb_build_object('open', '10:00', 'close', '23:00'),
      'sunday', jsonb_build_object('open', '10:00', 'close', '21:00')
    )
  )
WHERE name = 'Demo Restaurant';

-- Add more tables for testing
INSERT INTO tables (restaurant_id, table_number, is_active, qr_code_data) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '4', true, 'http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/4'),
('550e8400-e29b-41d4-a716-446655440000', '5', true, 'http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/5'),
('550e8400-e29b-41d4-a716-446655440000', '6', true, 'http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/6'),
('550e8400-e29b-41d4-a716-446655440000', '7', true, 'http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/7'),
('550e8400-e29b-41d4-a716-446655440000', '8', true, 'http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/8');