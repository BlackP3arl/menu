# Database Migrations Required

The admin dashboard features require several database schema updates. Please run these SQL migrations in your Supabase SQL editor in the following order:

## 1. Menu Items Fields Migration
**File**: `database/add_menu_item_fields.sql`
**Purpose**: Add missing columns for menu item management
```sql
-- Adds: allergens, dietary_info, is_available columns
-- Adds: indexes for performance
-- Status: Optional (form works without these fields, they just won't be saved)
```

## 2. Menu Items RLS Policies
**File**: `database/fix_menu_items_rls.sql`  
**Purpose**: Fix Row Level Security policies for menu_items CRUD operations
```sql
-- Creates permissive RLS policies for development
-- Enables proper insert/update/delete operations
-- Status: REQUIRED for menu management to work
```

## 3. Tables Fields Migration ⚠️ **CRITICAL**
**File**: `database/add_table_fields.sql`
**Purpose**: Add missing capacity and location columns to tables
```sql
-- Adds: capacity (INTEGER), location (VARCHAR)
-- Adds: updated_at column and trigger
-- Adds: performance indexes
-- Status: REQUIRED - Table editing will fail without this
```

## 4. Tables RLS Policies
**File**: `database/fix_tables_rls.sql`
**Purpose**: Fix Row Level Security policies for tables CRUD operations  
```sql
-- Creates permissive RLS policies for development
-- Adds updated_at trigger
-- Enables proper table insert/update/delete operations
-- Status: REQUIRED for table management to work
```

## 5. Item Options RLS Policies ⚠️ **CRITICAL FOR MENU OPTIONS**
**File**: `database/fix_item_options_rls.sql`
**Purpose**: Fix Row Level Security policies for item_options CRUD operations
```sql
-- Creates permissive RLS policies for development
-- Enables proper menu options insert/update/delete operations
-- Status: REQUIRED for menu options management to work
-- ⚠️ This is likely why you see "No data" in Menu Options tab
```

## 6. Sample Item Options Data ⚠️ **OPTIONAL BUT RECOMMENDED**
**File**: `database/sample_item_options.sql`
**Purpose**: Add sample menu options for testing functionality
```sql
-- Adds sample size, preparation, and add-on options for demo menu items
-- Creates options for "Hot Chicken Wings" and "Grilled Salmon"
-- Status: OPTIONAL but helps test the functionality immediately
```

## Migration Order
Run these migrations in this exact order:

1. `add_table_fields.sql` - **CRITICAL** (fixes current table editing error)
2. `fix_tables_rls.sql` - **REQUIRED** (enables table operations)
3. `fix_menu_items_rls.sql` - **REQUIRED** (enables menu operations)  
4. `fix_item_options_rls.sql` - **CRITICAL** ⚠️ (fixes "No data" issue in Menu Options)
5. `sample_item_options.sql` - **RECOMMENDED** (adds test data for Menu Options)
6. `add_menu_item_fields.sql` - **OPTIONAL** (adds extra menu fields)

## Current Status
✅ Admin dashboard UI is complete
✅ All API functions are implemented  
✅ Form validation is fixed
✅ **NEW**: Menu options management UI is complete
✅ **NEW**: Item options API functions are implemented
❌ Database schema is missing required columns
❌ RLS policies are blocking operations

## After Running Migrations
✅ Table management will work (add/edit/delete tables)
✅ Menu management will work (add/edit/delete items & categories)
✅ **NEW**: Menu options management will work (add/edit/delete size, preparation, add-ons)
✅ QR code generation will work
✅ All admin features will be fully functional

## Production Notes
The RLS policies created are permissive for development. For production, you should:
- Implement proper authentication-based RLS policies
- Add proper user role checking
- Restrict access based on restaurant ownership
- Add audit logging for admin operations