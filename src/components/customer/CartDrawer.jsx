import React, { useState } from 'react';
import { 
  Drawer, 
  Typography, 
  Button, 
  List, 
  Space, 
  InputNumber, 
  Divider,
  Empty,
  Modal,
  Input,
  Alert
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingCartOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import useCartStore from '../../stores/cartStore';
import { orderApi } from '../../utils/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

function CartDrawer({ visible, onClose, restaurant, onOrderPlaced }) {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [orderInstructions, setOrderInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    items,
    restaurantId,
    tableId,
    tableNumber,
    customerSessionId,
    updateItemQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotal,
    getItemCount
  } = useCartStore();

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setConfirmModalVisible(true);
  };

  const handleConfirmOrder = async () => {
    if (!restaurantId || !tableId || !customerSessionId) {
      toast.error('Missing order information. Please refresh and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const subtotal = getSubtotal();
      const taxRate = restaurant?.tax_rate || 0.0875;
      const taxAmount = getTaxAmount(taxRate);
      const totalAmount = getTotal(taxRate);

      // Create order
      const orderData = {
        restaurant_id: restaurantId,
        table_id: tableId,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        special_instructions: orderInstructions.trim(),
        customer_session_id: customerSessionId,
        status: 'new',
        payment_status: 'pending'
      };

      const order = await orderApi.create(orderData);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions
      }));

      const createdOrderItems = await orderApi.createOrderItems(orderItems);

      // Create order item options
      const allOrderItemOptions = [];
      createdOrderItems.forEach((orderItem, index) => {
        const cartItem = items[index];
        if (cartItem.selected_options && cartItem.selected_options.length > 0) {
          cartItem.selected_options.forEach(option => {
            allOrderItemOptions.push({
              order_item_id: orderItem.id,
              option_group: option.option_group,
              option_name: option.option_name,
              price_modifier: option.price_modifier
            });
          });
        }
      });

      if (allOrderItemOptions.length > 0) {
        await orderApi.createOrderItemOptions(allOrderItemOptions);
      }

      // Clear cart and close modals
      clearCart();
      setConfirmModalVisible(false);
      setOrderInstructions('');
      
      toast.success('Order placed successfully!');
      
      // Callback to parent with order ID for tracking
      if (onOrderPlaced) {
        onOrderPlaced(order.id);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = getSubtotal();
  const taxRate = restaurant?.tax_rate || 0.0875;
  const taxAmount = getTaxAmount(taxRate);
  const total = getTotal(taxRate);

  return (
    <>
      <Drawer
        title={
          <Space>
            <ShoppingCartOutlined />
            <span>Your Order ({getItemCount()} items)</span>
          </Space>
        }
        placement="right"
        open={visible}
        onClose={onClose}
        width={400}
        footer={
          items.length > 0 && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <Text>Subtotal:</Text>
                  <Text>{formatPrice(subtotal)}</Text>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <Text>Tax ({(taxRate * 100).toFixed(2)}%):</Text>
                  <Text>{formatPrice(taxAmount)}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  <Text strong>Total:</Text>
                  <Text strong style={{ color: '#f0681a' }}>
                    {formatPrice(total)}
                  </Text>
                </div>
              </div>
              
              <Button
                type="primary"
                size="large"
                onClick={handleCheckout}
                style={{ 
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Place Order
              </Button>
            </div>
          )
        }
      >
        {items.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Your cart is empty"
            style={{ marginTop: '60px' }}
          >
            <Text type="secondary">Add some delicious items to get started!</Text>
          </Empty>
        ) : (
          <List
            dataSource={items}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                style={{ 
                  borderBottom: '1px solid #f0f0f0',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    {item.menu_item_image && (
                      <img
                        src={item.menu_item_image}
                        alt={item.menu_item_name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          marginRight: '12px'
                        }}
                      />
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: '16px' }}>
                        {item.menu_item_name}
                      </Text>
                      
                      {item.selected_options && item.selected_options.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {item.selected_options.map((option, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#666' }}>
                              {option.option_group}: {option.option_name}
                              {option.price_modifier > 0 && 
                                ` (+${formatPrice(option.price_modifier)})`
                              }
                            </div>
                          ))}
                        </div>
                      )}

                      {item.special_instructions && (
                        <div style={{ 
                          marginTop: '4px', 
                          fontSize: '12px', 
                          color: '#666',
                          fontStyle: 'italic'
                        }}>
                          Note: {item.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Space>
                      <InputNumber
                        min={1}
                        max={10}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(item.id, value)}
                        size="small"
                        style={{ width: '60px' }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.id)}
                        size="small"
                      />
                    </Space>
                    
                    <Text strong style={{ color: '#f0681a' }}>
                      {formatPrice(item.total_price)}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* Order Confirmation Modal */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Confirm Your Order</span>
          </Space>
        }
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setConfirmModalVisible(false)}
            disabled={submitting}
          >
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleConfirmOrder}
            loading={submitting}
            style={{ fontWeight: '500' }}
          >
            Confirm Order • {formatPrice(total)}
          </Button>
        ]}
        width={500}
      >
        <div style={{ marginBottom: '20px' }}>
          <Alert
            message={`Table ${tableNumber}`}
            description={`${getItemCount()} items • ${formatPrice(total)} total`}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Additional Instructions for Kitchen (Optional)
            </Text>
            <TextArea
              rows={3}
              placeholder="Any special requests for the entire order..."
              value={orderInstructions}
              onChange={(e) => setOrderInstructions(e.target.value)}
              maxLength={200}
              showCount
            />
          </div>

          <div style={{ 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              By placing this order, you confirm that all details are correct. 
              Your order will be sent to the kitchen immediately.
            </Text>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CartDrawer;