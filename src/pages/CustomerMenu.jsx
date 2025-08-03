import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Alert, FloatButton, Badge, Button, Space } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import { restaurantApi, tableApi, menuApi } from '../utils/api';
import useCartStore from '../stores/cartStore';
import MenuCategories from '../components/customer/MenuCategories';
import MenuItems from '../components/customer/MenuItems';
import CartDrawer from '../components/customer/CartDrawer';
import RestaurantHeader from '../components/customer/RestaurantHeader';

const { Content } = Layout;
const { Title } = Typography;

function CustomerMenu() {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalPulse, setTotalPulse] = useState(false);
  
  const { 
    setRestaurantInfo, 
    getItemCount, 
    setCustomerSessionId,
    getSubtotal,
    getTaxAmount,
    getTotal
  } = useCartStore();

  // Generate customer session ID
  useEffect(() => {
    const sessionId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCustomerSessionId(sessionId);
  }, [setCustomerSessionId]);

  // Trigger pulse animation when cart changes - will be calculated later
  const cartItemCount = getItemCount();
  const subtotal = getSubtotal();
  useEffect(() => {
    if (cartItemCount > 0) {
      setTotalPulse(true);
      const timer = setTimeout(() => setTotalPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartItemCount, subtotal]); // Use subtotal instead of total to avoid dependency on restaurant


  // Fetch restaurant data
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useQuery(
    ['restaurant', restaurantId],
    () => restaurantApi.getById(restaurantId),
    {
      onError: (error) => {
        console.error('Error fetching restaurant:', error);
        toast.error('Restaurant not found');
      }
    }
  );

  // Fetch table data
  const { data: table, isLoading: tableLoading, error: tableError } = useQuery(
    ['table', restaurantId, tableNumber],
    () => tableApi.getByRestaurantAndNumber(restaurantId, tableNumber),
    {
      enabled: !!restaurantId && !!tableNumber,
      onSuccess: (data) => {
        setRestaurantInfo(restaurantId, data.id, tableNumber);
      },
      onError: (error) => {
        console.error('Error fetching table:', error);
        toast.error('Table not found');
      }
    }
  );

  // Fetch menu data
  const { data: menu, isLoading: menuLoading, error: menuError } = useQuery(
    ['menu', restaurantId],
    () => menuApi.getFullMenu(restaurantId),
    {
      enabled: !!restaurantId,
      onSuccess: (data) => {
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      },
      onError: (error) => {
        console.error('Error fetching menu:', error);
        toast.error('Could not load menu');
      }
    }
  );

  const isLoading = restaurantLoading || tableLoading || menuLoading;
  const hasError = restaurantError || tableError || menuError;

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Alert
          message="Error"
          description="Could not load the menu. Please check the QR code and try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const selectedCategoryData = menu?.find(cat => cat.id === selectedCategory);
  
  // Calculate cart totals (after restaurant data is loaded)
  const taxRate = restaurant?.tax_rate || 0.0875;
  const total = getTotal(taxRate);
  
  // Format price utility
  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toFixed(2)}`;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <RestaurantHeader 
        restaurant={restaurant} 
        tableNumber={tableNumber}
      />
      
      <Content style={{ padding: '0' }}>
        <div className="restaurant-container" style={{ 
          paddingTop: '20px',
          paddingBottom: cartItemCount > 0 ? '100px' : '20px'
        }}>
          {/* Menu Categories */}
          <MenuCategories
            categories={menu || []}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Menu Items */}
          {selectedCategoryData && (
            <MenuItems
              category={selectedCategoryData}
              restaurantId={restaurantId}
            />
          )}
        </div>
      </Content>

      {/* Sticky Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <div 
          className="cart-bottom-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderTop: '1px solid #f0f0f0',
            padding: '16px 20px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
          }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div 
                className="cart-info"
                style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  marginBottom: '2px'
                }}
              >
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} • Table {tableNumber}
              </div>
              <div 
                className={`cart-total ${totalPulse ? 'cart-total-pulse' : ''}`}
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: '#f0681a'
                }}
              >
                {formatPrice(total)}
              </div>
              {subtotal > 0 && (
                <div 
                  className="cart-breakdown"
                  style={{ 
                    fontSize: '12px', 
                    color: '#999',
                    marginTop: '2px'
                  }}
                >
                  Subtotal: {formatPrice(subtotal)} + Tax: {formatPrice(total - subtotal)}
                </div>
              )}
            </div>
            
            <Button
              type="primary"
              size="large"
              icon={<EyeOutlined />}
              onClick={() => setCartVisible(true)}
              className="view-cart-btn"
              style={{
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '16px',
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              View Cart
            </Button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        restaurant={restaurant}
        onOrderPlaced={(orderId) => {
          setCartVisible(false);
          navigate(`/order/${orderId}/tracking`);
        }}
      />
    </Layout>
  );
}

export default CustomerMenu;