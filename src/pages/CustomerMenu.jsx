import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Alert, FloatButton, Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
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
  
  const { setRestaurantInfo, getItemCount, setCustomerSessionId } = useCartStore();

  // Generate customer session ID
  useEffect(() => {
    const sessionId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCustomerSessionId(sessionId);
  }, [setCustomerSessionId]);

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
  const cartItemCount = getItemCount();

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <RestaurantHeader 
        restaurant={restaurant} 
        tableNumber={tableNumber}
      />
      
      <Content style={{ padding: '0' }}>
        <div className="restaurant-container" style={{ paddingTop: '20px' }}>
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

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <Badge count={cartItemCount} size="small">
          <FloatButton
            icon={<ShoppingCartOutlined />}
            type="primary"
            onClick={() => setCartVisible(true)}
            style={{ right: 24, bottom: 24 }}
          />
        </Badge>
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