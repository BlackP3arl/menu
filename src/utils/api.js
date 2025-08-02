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

  async getByRestaurant(restaurantId) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number');
    
    if (error) throw error;
    return data;
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
      .eq('is_active', true)
      .order('display_order');
    
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

  async createMenuItem(item) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMenuItem(id, updates) {
    const { data, error } = await supabase
      .from('menu_items')
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