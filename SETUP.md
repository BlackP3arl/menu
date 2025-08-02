# Setup Guide - Restaurant QR Ordering System

This guide will help you set up the complete restaurant QR ordering system from scratch.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- ImageKit account (optional, for image uploads)

## Step 1: Clone and Install

```bash
# If you haven't already, create the project directory
# cd /path/to/your/projects
# mkdir restaurant-qr-ordering && cd restaurant-qr-ordering

# Install dependencies
npm install
```

## Step 2: Set up Supabase Database

### 2.1 Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `menu`
   - Database Password: Choose a secure password
   - Region: Choose closest to your location
5. Click "Create new project"

### 2.2 Run Database Schema

1. Once your project is ready, go to the SQL Editor
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL in the editor
4. You should see tables created successfully

### 2.3 Add Sample Data (Optional)

1. Copy the contents of `database/sample-data.sql`
2. Paste and run in the SQL Editor
3. This will add sample menu items and options for testing

### 2.4 Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy your Project URL and anon public key

## Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server Configuration
PORT=3001
NODE_ENV=development

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001

# Image Upload (OPTIONAL - for menu item images)
VITE_IMAGE_UPLOAD_URL=https://ik.imagekit.io/your-id
IMAGE_UPLOAD_API_KEY=your-imagekit-key
```

## Step 4: Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

## Step 5: Test the System

### 5.1 Access Customer Menu

Visit: `http://localhost:5173/menu/550e8400-e29b-41d4-a716-446655440000/1`

This URL simulates a customer scanning a QR code for Table 1 at the demo restaurant.

### 5.2 Access Kitchen Dashboard

Visit: `http://localhost:5173/kitchen/550e8400-e29b-41d4-a716-446655440000`

This shows the kitchen view where orders are managed.

### 5.3 Access Staff Dashboard

Visit: `http://localhost:5173/staff/550e8400-e29b-41d4-a716-446655440000`

This shows the service staff view for order delivery and payment.

## Step 6: Create Your Own Restaurant Data

### 6.1 Add Your Restaurant

In Supabase SQL Editor, run:

```sql
INSERT INTO restaurants (name, description, contact_info, tax_rate) VALUES 
('Your Restaurant Name', 'Your restaurant description', 
 '{"phone": "your-phone", "email": "your-email", "address": "your-address"}', 0.0875);
```

### 6.2 Get Your Restaurant ID

```sql
SELECT id, name FROM restaurants;
```

Copy your restaurant ID for the next steps.

### 6.3 Add Tables

```sql
INSERT INTO tables (restaurant_id, table_number, qr_code_data) VALUES 
('your-restaurant-id', '1', 'http://localhost:5173/menu/your-restaurant-id/1'),
('your-restaurant-id', '2', 'http://localhost:5173/menu/your-restaurant-id/2');
-- Add more tables as needed
```

### 6.4 Add Menu Categories

```sql
INSERT INTO categories (restaurant_id, name, display_order) VALUES 
('your-restaurant-id', 'Appetizers', 1),
('your-restaurant-id', 'Main Course', 2),
('your-restaurant-id', 'Beverages', 3),
('your-restaurant-id', 'Desserts', 4);
```

### 6.5 Add Menu Items

```sql
INSERT INTO menu_items (category_id, name, description, base_price, prep_time, is_active) VALUES
((SELECT id FROM categories WHERE name = 'Main Course' AND restaurant_id = 'your-restaurant-id' LIMIT 1), 
 'Your Menu Item', 'Description of your item', 15.99, 20, true);
```

## Step 7: Generate QR Codes

You can generate QR codes for your tables using any QR code generator. The URL format is:

```
http://your-domain.com/menu/{restaurant-id}/{table-number}
```

For local testing:
```
http://localhost:5173/menu/your-restaurant-id/1
```

For production:
```
https://your-app-domain.com/menu/your-restaurant-id/1
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your Supabase URL and API key
   - Ensure your Supabase project is running
   - Verify environment variables are loaded correctly

2. **Menu Not Loading**
   - Check if your restaurant ID exists in the database
   - Verify categories and menu items are added
   - Check browser console for errors

3. **Orders Not Appearing**
   - Ensure WebSocket connection is working
   - Check if orders are being created in database
   - Verify restaurant ID matches across all interfaces

4. **Styling Issues**
   - Clear browser cache
   - Check if Ant Design CSS is loading
   - Verify no CSS conflicts

### Database Queries for Debugging

```sql
-- Check restaurants
SELECT * FROM restaurants;

-- Check tables
SELECT * FROM tables WHERE restaurant_id = 'your-restaurant-id';

-- Check categories and menu items
SELECT c.name as category, m.name as item, m.base_price 
FROM categories c 
LEFT JOIN menu_items m ON c.id = m.category_id 
WHERE c.restaurant_id = 'your-restaurant-id';

-- Check recent orders
SELECT o.order_number, o.status, o.total_amount, t.table_number, o.created_at
FROM orders o
JOIN tables t ON o.table_id = t.id
WHERE o.restaurant_id = 'your-restaurant-id'
ORDER BY o.created_at DESC;
```

## Production Deployment

### Frontend (Vercel/Netlify)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting platform

3. Set environment variables in your hosting platform

### Backend (Railway/Heroku)

1. Deploy the server files
2. Set environment variables
3. Ensure WebSocket support is enabled

### Update QR Codes

Replace localhost URLs with your production domain in:
1. Database table records
2. Physical QR codes at restaurant tables

## Support

If you encounter issues:

1. Check the GitHub repository for similar issues
2. Review the console logs for error messages
3. Verify database schema matches the expected structure
4. Test with the sample data first before adding custom data

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific configurations
- Enable Row Level Security in Supabase for production
- Implement proper authentication for admin interfaces
- Use HTTPS in production

---

Your restaurant QR ordering system should now be fully functional! 🎉