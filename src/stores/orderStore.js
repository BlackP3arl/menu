import { create } from 'zustand';

const useOrderStore = create((set, get) => ({
    // Order state
    currentOrder: null,
    orders: [],
    loading: false,
    error: null,

    // Order actions
    setCurrentOrder: (order) => {
      set({ currentOrder: order });
    },

    setOrders: (orders) => {
      set({ orders });
    },

    updateOrder: (orderId, updates) => {
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order =>
        order.id === orderId ? { ...order, ...updates } : order
      );
      set({ orders: updatedOrders });

      // Update current order if it matches
      const currentOrder = get().currentOrder;
      if (currentOrder && currentOrder.id === orderId) {
        set({ currentOrder: { ...currentOrder, ...updates } });
      }
    },

    addOrder: (order) => {
      const currentOrders = get().orders;
      set({ orders: [order, ...currentOrders] });
    },

    removeOrder: (orderId) => {
      const updatedOrders = get().orders.filter(order => order.id !== orderId);
      set({ orders: updatedOrders });
    },

    setLoading: (loading) => {
      set({ loading });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // Helper methods
    getOrdersByStatus: (status) => {
      return get().orders.filter(order => order.status === status);
    },

    getOrdersByTable: (tableNumber) => {
      return get().orders.filter(order => order.table_number === tableNumber);
    },

    getOrdersForToday: () => {
      const today = new Date().toDateString();
      return get().orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      );
    }
  }));

export default useOrderStore;