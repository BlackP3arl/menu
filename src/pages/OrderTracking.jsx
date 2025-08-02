import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Steps, 
  Space, 
  Tag, 
  List, 
  Spin,
  Alert,
  Button,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  CarOutlined,
  DollarOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { orderApi } from '../utils/api';
import { ORDER_STATUS, PAYMENT_STATUS } from '../types';

const { Title, Text } = Typography;

function OrderTracking() {
  const { orderId } = useParams();

  const { 
    data: order, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['order', orderId],
    () => orderApi.getById(orderId),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      onError: (error) => {
        console.error('Error fetching order:', error);
      }
    }
  );

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusStep = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return 0;
      case ORDER_STATUS.IN_PROGRESS: return 1;
      case ORDER_STATUS.READY: return 2;
      case ORDER_STATUS.SERVED: return 3;
      case ORDER_STATUS.PAID: return 4;
      default: return 0;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return <ClockCircleOutlined />;
      case ORDER_STATUS.IN_PROGRESS: return <FireOutlined />;
      case ORDER_STATUS.READY: return <CheckCircleOutlined />;
      case ORDER_STATUS.SERVED: return <CarOutlined />;
      case ORDER_STATUS.PAID: return <DollarOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return 'blue';
      case ORDER_STATUS.IN_PROGRESS: return 'orange';
      case ORDER_STATUS.READY: return 'green';
      case ORDER_STATUS.SERVED: return 'purple';
      case ORDER_STATUS.PAID: return 'cyan';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return 'Order Received';
      case ORDER_STATUS.IN_PROGRESS: return 'Being Prepared';
      case ORDER_STATUS.READY: return 'Ready for Pickup';
      case ORDER_STATUS.SERVED: return 'Served';
      case ORDER_STATUS.PAID: return 'Completed';
      default: return 'Unknown';
    }
  };

  const steps = [
    {
      title: 'Order Received',
      description: 'Your order has been confirmed',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'Being Prepared',
      description: 'Our kitchen is preparing your food',
      icon: <FireOutlined />
    },
    {
      title: 'Ready',
      description: 'Your order is ready for pickup/delivery',
      icon: <CheckCircleOutlined />
    },
    {
      title: 'Served',
      description: 'Food has been delivered to your table',
      icon: <CarOutlined />
    },
    {
      title: 'Completed',
      description: 'Order completed and paid',
      icon: <DollarOutlined />
    }
  ];

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

  if (error || !order) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <Alert
          message="Order Not Found"
          description="Could not find the order. Please check the order ID and try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f5f5f5',
      padding: '20px 0'
    }}>
      <div className="restaurant-container">
        {/* Header */}
        <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Space direction="vertical" size="small">
            <Title level={2} style={{ margin: 0, color: '#f0681a' }}>
              Order #{order.order_number}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Table {order.tables?.table_number}
            </Text>
            <Text type="secondary">
              Placed on {format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
            </Text>
            <Tag 
              color={getStatusColor(order.status)} 
              icon={getStatusIcon(order.status)}
              style={{ fontSize: '14px', padding: '4px 12px' }}
            >
              {getStatusText(order.status)}
            </Tag>
          </Space>

          <Button 
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            style={{ marginTop: '16px' }}
          >
            Refresh Status
          </Button>
        </Card>

        {/* Order Progress */}
        <Card title="Order Progress" style={{ marginBottom: '24px' }}>
          <Steps
            current={getStatusStep(order.status)}
            direction="vertical"
            items={steps}
            size="small"
          />
        </Card>

        {/* Order Items */}
        <Card title="Order Details" style={{ marginBottom: '24px' }}>
          <List
            dataSource={order.order_items || []}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    item.menu_items?.image_url ? (
                      <img
                        src={item.menu_items.image_url}
                        alt={item.menu_items.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🍽️
                      </div>
                    )
                  }
                  title={
                    <div>
                      <Space>
                        <Text strong>{item.menu_items?.name || 'Menu Item'}</Text>
                        <Text type="secondary">x{item.quantity}</Text>
                      </Space>
                      {item.is_completed && (
                        <Tag color="green" size="small" style={{ marginLeft: '8px' }}>
                          Completed
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      {item.order_item_options && item.order_item_options.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          {item.order_item_options.map((option, idx) => (
                            <Text key={idx} type="secondary" style={{ fontSize: '12px' }}>
                              {option.option_group}: {option.option_name}
                              {idx < item.order_item_options.length - 1 && ', '}
                            </Text>
                          ))}
                        </div>
                      )}
                      {item.special_instructions && (
                        <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                          Note: {item.special_instructions}
                        </Text>
                      )}
                    </div>
                  }
                />
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ color: '#f0681a' }}>
                    {formatPrice(item.total_price)}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        </Card>

        {/* Order Summary */}
        <Card title="Order Summary">
          <div style={{ maxWidth: '300px', marginLeft: 'auto' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <Text>Subtotal:</Text>
              <Text>{formatPrice(order.subtotal)}</Text>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <Text>Tax:</Text>
              <Text>{formatPrice(order.tax_amount)}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '18px'
            }}>
              <Text strong>Total:</Text>
              <Text strong style={{ color: '#f0681a' }}>
                {formatPrice(order.total_amount)}
              </Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between'
            }}>
              <Text>Payment Status:</Text>
              <Tag color={order.payment_status === PAYMENT_STATUS.PAID ? 'green' : 'orange'}>
                {order.payment_status === PAYMENT_STATUS.PAID ? 'Paid' : 'Pending'}
              </Tag>
            </div>
          </div>

          {order.special_instructions && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
              <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                Special Instructions:
              </Text>
              <Text type="secondary" style={{ fontStyle: 'italic' }}>
                {order.special_instructions}
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default OrderTracking;