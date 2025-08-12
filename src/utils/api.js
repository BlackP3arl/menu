import supabase from './supabase';
import { ORDER_STATUS, PAYMENT_STATUS } from '../types';

// Restaurant API
export const restaurantApi = {
  async getById(id) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Table API
export const tableApi = {
  async getByRestaurantAndNumber(restaurantId, tableNumber) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', tableNumber)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Check if table session is valid for ordering
  async validateTableSession(restaurantId, tableNumber) {
    const { data, error } = await supabase
      .rpc('is_table_session_valid_by_number', {
        p_restaurant_id: restaurantId,
        p_table_number: tableNumber
      });
    
    if (error) throw error;
    return data;
  },

  // Get table with session info
  async getTableWithSession(restaurantId, tableNumber) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('table_number', tableNumber)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    
    // Check if session is valid
    const now = new Date();
    const sessionValid = data.session_active && 
      (data.session_expires_at === null || new Date(data.session_expires_at) > now);
    
    return { ...data, session_valid: sessionValid };
  },

  // Activate table session (staff function)
  async activateSession(tableId, staffName = 'Staff', durationMinutes = null) {
    const { data, error } = await supabase
      .rpc('activate_table_session', {
        table_id: tableId,
        staff_name: staffName,
        duration_minutes: durationMinutes
      });
    
    if (error) throw error;
    return data;
  },

  // Deactivate table session (staff function)
  async deactivateSession(tableId) {
    const { data, error } = await supabase
      .rpc('deactivate_table_session', {
        table_id: tableId
      });
    
    if (error) throw error;
    return data;
  },

  // Extend table session (staff function)
  async extendSession(tableId, additionalMinutes = 60) {
    const { data, error } = await supabase
      .rpc('extend_table_session', {
        table_id: tableId,
        additional_minutes: additionalMinutes
      });
    
    if (error) throw error;
    return data;
  },

  // Get active sessions view (staff function)
  async getActiveSessions(restaurantId) {
    const { data, error } = await supabase
      .from('active_table_sessions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');
    
    if (error) throw error;
    return data;
  },

  // Bulk activate/deactivate tables
  async bulkToggleSessions(restaurantId, activate, staffName = 'Staff') {
    const { data: tables } = await this.getByRestaurant(restaurantId);
    const results = [];
    
    for (const table of tables) {
      try {
        if (activate) {
          await this.activateSession(table.id, staffName);
        } else {
          await this.deactivateSession(table.id);
        }
        results.push({ table_id: table.id, success: true });
      } catch (error) {
        results.push({ table_id: table.id, success: false, error: error.message });
      }
    }
    
    return results;
  },

  async getByRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');
    
    if (error) throw error;
    return data;
  },

  async create(table) {
    console.log('Creating table:', table);
    
    const { data, error } = await supabase
      .from('tables')
      .insert(table)
      .select();
    
    if (error) {
      console.error('Create table error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create table');
    }
    
    console.log('Table create successful:', data[0]);
    return data[0];
  },

  async update(id, updates) {
    console.log('Updating table with ID:', id, 'Updates:', updates);
    
    // Add updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('tables')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update table error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Table with ID ${id} not found or could not be updated`);
    }
    
    console.log('Table update successful:', data[0]);
    return data[0];
  },

  async delete(id) {
    console.log('Deleting table with ID:', id);
    
    const { data, error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Delete table error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Table with ID ${id} not found or could not be deleted`);
    }
    
    console.log('Table delete successful:', data[0]);
    return data[0];
  }
};

// Menu API
export const menuApi = {
  async getCategories(restaurantId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  },

  async getMenuItems(categoryId) {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        item_options (*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getFullMenu(restaurantId) {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        menu_items (
          *,
          item_options (*)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('display_order');
    
    if (error) throw error;
    return data;
  },

  async getFullMenuForCustomers(restaurantId) {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        menu_items!inner (
          *,
          item_options (*)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .eq('menu_items.is_available', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  },

  async createItem(item) {
    console.log('Creating item:', item);
    
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select();
    
    if (error) {
      console.error('Create item error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create menu item');
    }
    
    return data[0];
  },

  async updateItem(id, updates) {
    console.log('Updating item with ID:', id, 'Updates:', updates);
    
    // Add updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('menu_items')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update item error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Menu item with ID ${id} not found or could not be updated`);
    }
    
    console.log('Update successful:', data[0]);
    return data[0];
  },

  async deleteItem(id) {
    const { data, error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createCategory(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createItemOption(option) {
    const { data, error } = await supabase
      .from('item_options')
      .insert(option)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Item Options API
export const itemOptionsApi = {
  async getByMenuItem(menuItemId) {
    console.log('Fetching options for menu item:', menuItemId);
    const { data, error } = await supabase
      .from('item_options')
      .select('*')
      .eq('menu_item_id', menuItemId)
      .eq('is_active', true)
      .order('option_group')
      .order('display_order');
    
    if (error) {
      console.error('Get item options error:', error);
      throw error;
    }
    
    console.log('Fetched options:', data);
    return data;
  },

  async create(option) {
    console.log('Creating item option:', option);
    
    const { data, error } = await supabase
      .from('item_options')
      .insert(option)
      .select();
    
    if (error) {
      console.error('Create item option error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('Failed to create item option');
    }
    
    console.log('Item option created successfully:', data[0]);
    return data[0];
  },

  async update(id, updates) {
    console.log('Updating item option with ID:', id, 'Updates:', updates);
    
    const { data, error } = await supabase
      .from('item_options')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Update item option error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Item option with ID ${id} not found or could not be updated`);
    }
    
    console.log('Item option updated successfully:', data[0]);
    return data[0];
  },

  async delete(id) {
    console.log('Deleting item option with ID:', id);
    
    const { data, error } = await supabase
      .from('item_options')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Delete item option error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Item option with ID ${id} not found or could not be deleted`);
    }
    
    console.log('Item option deleted successfully:', data[0]);
    return data[0];
  },

  async getByRestaurant(restaurantId) {
    console.log('Fetching all options for restaurant:', restaurantId);
    
    // First, let's try a simpler query to test if basic access works
    const { data: testData, error: testError } = await supabase
      .from('item_options')
      .select('*')
      .eq('is_active', true)
      .limit(1);
    
    console.log('Test query result:', { testData, testError });
    
    if (testError) {
      console.error('Basic item_options access failed:', testError);
      throw testError;
    }

    // Now try the full query with menu items
    const { data, error } = await supabase
      .from('item_options')
      .select(`
        *,
        menu_items (
          id,
          name,
          category_id
        )
      `)
      .eq('is_active', true)
      .order('menu_item_id')
      .order('option_group')
      .order('display_order');
    
    if (error) {
      console.error('Get restaurant options error:', error);
      throw error;
    }
    
    console.log('Fetched restaurant options:', data);
    
    // Filter by restaurant on client side for now
    if (!data || data.length === 0) {
      console.log('No item options found in database');
      return [];
    }
    
    // For debugging - let's also check what menu items we have
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        category_id,
        categories (
          restaurant_id
        )
      `)
      .eq('categories.restaurant_id', restaurantId);
    
    console.log('Menu items for restaurant:', menuItems);
    
    return data;
  }
};

// Order API
export const orderApi = {
  async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createOrderItems(orderItems) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (error) throw error;
    return data;
  },

  async createOrderItemOptions(orderItemOptions) {
    const { data, error } = await supabase
      .from('order_item_options')
      .insert(orderItemOptions)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        tables (table_number),
        order_items (
          *,
          menu_items (name, image_url),
          order_item_options (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByRestaurant(restaurantId, status = null) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        tables (table_number),
        order_items (
          *,
          menu_items (name, image_url),
          order_item_options (*)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status, paymentMethod = null) {
    const updates = { status };
    
    // Set timestamps based on status
    if (status === ORDER_STATUS.SERVED) {
      updates.served_at = new Date().toISOString();
    } else if (status === ORDER_STATUS.PAID) {
      updates.paid_at = new Date().toISOString();
      updates.payment_status = PAYMENT_STATUS.PAID;
      if (paymentMethod) {
        updates.payment_method = paymentMethod;
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrderItem(itemId, updates) {
    const { data, error } = await supabase
      .from('order_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Real-time subscription for orders
  subscribeToOrders(restaurantId, callback) {
    return supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToOrderItems(callback) {
    return supabase
      .channel('order_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        callback
      )
      .subscribe();
  }
};

// Analytics API
export const analyticsApi = {
  async getSalesData(restaurantId, startDate, endDate) {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('payment_status', PAYMENT_STATUS.PAID);
    
    if (error) throw error;
    return data;
  },

  async getPopularItems(restaurantId, startDate, endDate) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        menu_item_id,
        quantity,
        menu_items (name),
        orders!inner (restaurant_id, created_at, payment_status)
      `)
      .eq('orders.restaurant_id', restaurantId)
      .eq('orders.payment_status', PAYMENT_STATUS.PAID)
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate);
    
    if (error) throw error;
    return data;
  }
};

// Category API (separate export for admin components)
export const categoryApi = {
  async create(category) {
    return menuApi.createCategory(category);
  },

  async update(id, updates) {
    return menuApi.updateCategory(id, updates);
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};