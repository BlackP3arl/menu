// Type definitions for the restaurant ordering system

export const ORDER_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress', 
  READY: 'ready',
  SERVED: 'served',
  PAID: 'paid'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid', 
  REFUNDED: 'refunded'
};

export const OPTION_GROUPS = {
  SIZE: 'size',
  PREPARATION: 'preparation',
  ADDONS: 'addons'
};

// Default restaurant structure
export const DEFAULT_RESTAURANT = {
  id: null,
  name: '',
  description: '',
  logo_url: '',
  contact_info: {
    phone: '',
    email: '',
    address: ''
  },
  settings: {
    currency: 'USD',
    timezone: 'UTC',
    operating_hours: {}
  },
  tax_rate: 0.0875,
  is_active: true
};

// Default menu item structure
export const DEFAULT_MENU_ITEM = {
  id: null,
  category_id: null,
  name: '',
  description: '',
  base_price: 0,
  image_url: '',
  prep_time: 15,
  is_active: true
};

// Default order structure
export const DEFAULT_ORDER = {
  id: null,
  restaurant_id: null,
  table_id: null,
  order_number: '',
  status: ORDER_STATUS.NEW,
  payment_status: PAYMENT_STATUS.PENDING,
  subtotal: 0,
  tax_amount: 0,
  total_amount: 0,
  special_instructions: '',
  customer_session_id: '',
  items: []
};