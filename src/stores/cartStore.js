import { create } from 'zustand';

// Helper functions for localStorage persistence
const getStoredCart = () => {
  try {
    const stored = sessionStorage.getItem('restaurant-cart');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const storeCart = (state) => {
  try {
    sessionStorage.setItem('restaurant-cart', JSON.stringify({
      items: state.items,
      restaurantId: state.restaurantId,
      tableId: state.tableId,
      tableNumber: state.tableNumber,
      customerSessionId: state.customerSessionId
    }));
  } catch (error) {
    console.warn('Could not save cart to storage:', error);
  }
};

const stored = getStoredCart();

const useCartStore = create((set, get) => ({
      // Cart state with persistence
      items: stored.items || [],
      restaurantId: stored.restaurantId || null,
      tableId: stored.tableId || null,
      tableNumber: stored.tableNumber || null,
      customerSessionId: stored.customerSessionId || null,
      
      // Cart actions
      addItem: (item) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          cartItem => 
            cartItem.menu_item_id === item.menu_item_id &&
            JSON.stringify(cartItem.selected_options) === JSON.stringify(item.selected_options)
        );

        if (existingItemIndex > -1) {
          // Update quantity if item with same options exists
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex].quantity += item.quantity;
          const newState = { ...get(), items: updatedItems };
          set(newState);
          storeCart(newState);
        } else {
          // Add new item
          const newState = { ...get(), items: [...currentItems, { ...item, id: Date.now() }] };
          set(newState);
          storeCart(newState);
        }
      },

      updateItemQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        const updatedItems = get().items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        const newState = { ...get(), items: updatedItems };
        set(newState);
        storeCart(newState);
      },

      removeItem: (itemId) => {
        const updatedItems = get().items.filter(item => item.id !== itemId);
        const newState = { ...get(), items: updatedItems };
        set(newState);
        storeCart(newState);
      },

      clearCart: () => {
        const newState = { items: [], restaurantId: null, tableId: null, tableNumber: null, customerSessionId: null };
        set(newState);
        storeCart(newState);
      },

      setRestaurantInfo: (restaurantId, tableId, tableNumber) => {
        const newState = { ...get(), restaurantId, tableId, tableNumber };
        set(newState);
        storeCart(newState);
      },

      setCustomerSessionId: (sessionId) => {
        const newState = { ...get(), customerSessionId: sessionId };
        set(newState);
        storeCart(newState);
      },

      // Computed values
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const itemTotal = item.unit_price * item.quantity;
          return total + itemTotal;
        }, 0);
      },

      getTaxAmount: (taxRate = 0.0875) => {
        return get().getSubtotal() * taxRate;
      },

      getTotal: (taxRate = 0.0875) => {
        return get().getSubtotal() + get().getTaxAmount(taxRate);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }));

export default useCartStore;