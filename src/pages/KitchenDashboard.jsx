import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Button, 
  Tag, 
  Space, 
  List,
  Checkbox,
  Modal,
  Alert,
  Spin,
  Badge
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { orderApi } from '../utils/api';
import { ORDER_STATUS } from '../types';
import useOrderStore from '../stores/orderStore';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function KitchenDashboard() {
  const { restaurantId } = useParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { orders, setOrders, updateOrder, setLoading } = useOrderStore();

  // Fetch active orders (not served or paid)
  const { 
    data: ordersData, 
    isLoading, 
    error,
    refetch 
  } = useQuery(
    ['kitchen-orders', restaurantId],
    () => orderApi.getByRestaurant(restaurantId),
    {
      enabled: !!restaurantId,
      refetchInterval: 5000, // Refetch every 5 seconds
      onSuccess: (data) => {
        // Filter out completed orders for kitchen view
        const activeOrders = data.filter(order => 
          order.status !== ORDER_STATUS.SERVED && 
          order.status !== ORDER_STATUS.PAID
        );
        setOrders(activeOrders);
      },
      onError: (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    }
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!restaurantId) return;

    const subscription = orderApi.subscribeToOrders(restaurantId, (payload) => {
      console.log('Real-time order update:', payload);
      
      // Refresh orders when there's an update
      refetch();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [restaurantId, refetch]);

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return 'blue';
      case ORDER_STATUS.IN_PROGRESS: return 'orange';
      case ORDER_STATUS.READY: return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.NEW: return 'New';
      case ORDER_STATUS.IN_PROGRESS: return 'In Progress';
      case ORDER_STATUS.READY: return 'Ready';
      default: return status;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await orderApi.updateStatus(orderId, newStatus);
      updateOrder(orderId, { status: newStatus });
      
      let message = '';
      switch (newStatus) {
        case ORDER_STATUS.IN_PROGRESS:
          message = 'Order marked as in progress';
          break;
        case ORDER_STATUS.READY:
          message = 'Order marked as ready';
          break;
        default:
          message = 'Order status updated';
      }
      
      toast.success(message);
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleItemComplete = async (itemId, completed) => {
    try {
      await orderApi.updateOrderItem(itemId, { is_completed: completed });
      toast.success(`Item marked as ${completed ? 'completed' : 'pending'}`);
      refetch();
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const newOrders = getOrdersByStatus(ORDER_STATUS.NEW);
  const inProgressOrders = getOrdersByStatus(ORDER_STATUS.IN_PROGRESS);
  const readyOrders = getOrdersByStatus(ORDER_STATUS.READY);

  if (isLoading && !orders.length) {
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#f0681a', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Kitchen Dashboard
        </Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            style={{ color: 'white', borderColor: 'white' }}
            ghost
          >
            Refresh
          </Button>
          <Badge count={newOrders.length} size="small">
            <Text style={{ color: 'white', fontSize: '16px' }}>
              New Orders
            </Text>
          </Badge>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <Row gutter={24}>
          {/* New Orders */}
          <Col span={8}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  <span>New Orders ({newOrders.length})</span>
                </Space>
              }
              style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
              bodyStyle={{ padding: '12px' }}
            >
              <List
                dataSource={newOrders}
                renderItem={(order) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Card 
                      size="small" 
                      style={{ 
                        width: '100%',
                        border: '2px solid #1890ff',
                        borderRadius: '8px'
                      }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text strong>#{order.order_number}</Text>
                          <Tag color="blue">Table {order.tables?.table_number}</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {format(new Date(order.created_at), 'HH:mm')}
                        </Text>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ fontSize: '12px' }}>
                          {order.order_items?.length || 0} items • {formatPrice(order.total_amount)}
                        </Text>
                      </div>

                      <Space style={{ width: '100%' }} direction="vertical" size="small">
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleStatusChange(order.id, ORDER_STATUS.IN_PROGRESS)}
                          style={{ width: '100%' }}
                        >
                          Start Cooking
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showOrderDetails(order)}
                          style={{ width: '100%' }}
                        >
                          View Details
                        </Button>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* In Progress Orders */}
          <Col span={8}>
            <Card 
              title={
                <Space>
                  <FireOutlined style={{ color: '#faad14' }} />
                  <span>In Progress ({inProgressOrders.length})</span>
                </Space>
              }
              style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
              bodyStyle={{ padding: '12px' }}
            >
              <List
                dataSource={inProgressOrders}
                renderItem={(order) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Card 
                      size="small" 
                      style={{ 
                        width: '100%',
                        border: '2px solid #faad14',
                        borderRadius: '8px'
                      }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text strong>#{order.order_number}</Text>
                          <Tag color="orange">Table {order.tables?.table_number}</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Started {format(new Date(order.updated_at), 'HH:mm')}
                        </Text>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        {order.order_items?.map(item => (
                          <div key={item.id} style={{ marginBottom: '4px' }}>
                            <Checkbox
                              checked={item.is_completed}
                              onChange={(e) => handleItemComplete(item.id, e.target.checked)}
                              style={{ fontSize: '12px' }}
                            >
                              {item.quantity}x {item.menu_items?.name}
                            </Checkbox>
                          </div>
                        ))}
                      </div>

                      <Space style={{ width: '100%' }} direction="vertical" size="small">
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleStatusChange(order.id, ORDER_STATUS.READY)}
                          style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a' }}
                        >
                          Mark Ready
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showOrderDetails(order)}
                          style={{ width: '100%' }}
                        >
                          View Details
                        </Button>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Ready Orders */}
          <Col span={8}>
            <Card 
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Ready for Pickup ({readyOrders.length})</span>
                </Space>
              }
              style={{ height: 'calc(100vh - 140px)', overflow: 'auto' }}
              bodyStyle={{ padding: '12px' }}
            >
              <List
                dataSource={readyOrders}
                renderItem={(order) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Card 
                      size="small" 
                      style={{ 
                        width: '100%',
                        border: '2px solid #52c41a',
                        borderRadius: '8px'
                      }}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text strong>#{order.order_number}</Text>
                          <Tag color="green">Table {order.tables?.table_number}</Tag>
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Ready since {format(new Date(order.updated_at), 'HH:mm')}
                        </Text>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ fontSize: '12px' }}>
                          {order.order_items?.length || 0} items • {formatPrice(order.total_amount)}
                        </Text>
                      </div>

                      <Alert
                        message="Ready for delivery!"
                        type="success"
                        size="small"
                        style={{ marginBottom: '8px' }}
                      />

                      <Space style={{ width: '100%' }} direction="vertical" size="small">
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleStatusChange(order.id, ORDER_STATUS.SERVED)}
                          style={{ width: '100%', background: '#722ed1', borderColor: '#722ed1' }}
                        >
                          Mark Served
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => showOrderDetails(order)}
                          style={{ width: '100%' }}
                        >
                          View Details
                        </Button>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* Order Details Modal */}
      <Modal
        title={`Order #${selectedOrder?.order_number} - Table ${selectedOrder?.tables?.table_number}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
                <Text type="secondary">
                  Placed at {format(new Date(selectedOrder.created_at), 'MMM dd, HH:mm')}
                </Text>
              </Space>
            </div>

            <List
              dataSource={selectedOrder.order_items || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Checkbox
                          checked={item.is_completed}
                          onChange={(e) => handleItemComplete(item.id, e.target.checked)}
                        />
                        <Text strong>{item.quantity}x {item.menu_items?.name}</Text>
                        {item.is_completed && <Tag color="green" size="small">Done</Tag>}
                      </Space>
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
                          <Alert
                            message={`Special Instructions: ${item.special_instructions}`}
                            type="warning"
                            size="small"
                            style={{ marginTop: '8px' }}
                          />
                        )}
                      </div>
                    }
                  />
                  <Text strong>{formatPrice(item.total_price)}</Text>
                </List.Item>
              )}
            />

            {selectedOrder.special_instructions && (
              <Alert
                message="Order Instructions"
                description={selectedOrder.special_instructions}
                type="info"
                style={{ marginTop: '16px' }}
              />
            )}

            <div style={{ 
              marginTop: '20px',
              textAlign: 'right',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              Total: {formatPrice(selectedOrder.total_amount)}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default KitchenDashboard;