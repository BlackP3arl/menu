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
  Modal,
  Spin,
  Badge,
  Tabs,
  Select,
  Alert
} from 'antd';
import { 
  CarOutlined, 
  DollarOutlined,
  EyeOutlined,
  ReloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { orderApi } from '../utils/api';
import { ORDER_STATUS, PAYMENT_STATUS } from '../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

function StaffDashboard() {
  const { restaurantId } = useParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  // Fetch orders
  const { 
    data: ordersData = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery(
    ['staff-orders', restaurantId],
    () => orderApi.getByRestaurant(restaurantId),
    {
      enabled: !!restaurantId,
      refetchInterval: 10000, // Refetch every 10 seconds
      onError: (error) => {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    }
  );

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
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

  const handlePaymentClick = (order) => {
    setSelectedPaymentOrder(order);
    setPaymentMethod('');
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      // Update order to paid status and record payment method
      console.log('Updating order to paid:', selectedPaymentOrder.id, paymentMethod);
      const updatedOrder = await orderApi.updateStatus(selectedPaymentOrder.id, ORDER_STATUS.PAID, paymentMethod);
      console.log('Updated order:', updatedOrder);
      
      // Show success message with payment method
      const paymentMethodNames = {
        cash: 'Cash',
        card: 'Card Payment', 
        bank_transfer: 'Bank Transfer'
      };
      toast.success(`Payment recorded: ${paymentMethodNames[paymentMethod]}`);
      
      setPaymentModalVisible(false);
      setSelectedPaymentOrder(null);
      setPaymentMethod('');
      
      // Force refetch to get updated data
      await refetch();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const generateBill = (order) => {
    // In a real app, this would generate and print a receipt
    const billContent = `
RESTAURANT BILL
Order #${order.order_number}
Table ${order.tables?.table_number}
Date: ${format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}

Items:
${order.order_items?.map(item => 
  `${item.quantity}x ${item.menu_items?.name} - ${formatPrice(item.total_price)}`
).join('\n')}

Subtotal: ${formatPrice(order.subtotal)}
Tax: ${formatPrice(order.tax_amount)}
Total: ${formatPrice(order.total_amount)}

Thank you for dining with us!
    `;
    
    // Create and print the bill
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - Order #${order.order_number}</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .bill { max-width: 300px; margin: 0 auto; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="bill">
            <div class="center">
              <h2>RESTAURANT BILL</h2>
              <p>Order #${order.order_number}</p>
              <p>Table ${order.tables?.table_number}</p>
              <p>${format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div class="line"></div>
            <div>
              ${order.order_items?.map(item => 
                `<p>${item.quantity}x ${item.menu_items?.name}<br/>
                 <span style="float: right;">${formatPrice(item.total_price)}</span></p>`
              ).join('')}
            </div>
            <div class="line"></div>
            <p>Subtotal: <span style="float: right;">${formatPrice(order.subtotal)}</span></p>
            <p>Tax: <span style="float: right;">${formatPrice(order.tax_amount)}</span></p>
            <div class="line"></div>
            <p><strong>Total: <span style="float: right;">${formatPrice(order.total_amount)}</span></strong></p>
            <div class="line"></div>
            <div class="center">
              <p>Thank you for dining with us!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    
    toast.success('Bill generated and ready to print');
  };

  const servedOrders = ordersData.filter(order => 
    order.status === ORDER_STATUS.SERVED && order.payment_status === PAYMENT_STATUS.PENDING
  );
  const paidOrders = ordersData.filter(order => order.payment_status === PAYMENT_STATUS.PAID);
  
  console.log('All orders:', ordersData.map(o => ({ id: o.id, status: o.status, payment_status: o.payment_status })));
  console.log('Served orders:', servedOrders.length);
  console.log('Paid orders:', paidOrders.length);
  const todayOrders = ordersData.filter(order => 
    new Date(order.created_at).toDateString() === new Date().toDateString()
  );

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#722ed1', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Staff Dashboard
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
          <Badge count={servedOrders.length} size="small">
            <Text style={{ color: 'white', fontSize: '16px' }}>
              Payment Pending
            </Text>
          </Badge>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <Tabs defaultActiveKey="served" size="large">
          <TabPane 
            tab={
              <Badge count={servedOrders.length} size="small" offset={[10, 0]}>
                <Space>
                  <DollarOutlined />
                  Payment Pending
                </Space>
              </Badge>
            } 
            key="served"
          >
            <Row gutter={[16, 16]}>
              {servedOrders.map(order => (
                <Col key={order.id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    style={{ 
                      border: '2px solid #722ed1',
                      borderRadius: '12px'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: '16px' }}>
                          #{order.order_number}
                        </Text>
                        <Tag color="purple">Table {order.tables?.table_number}</Tag>
                      </Space>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Served at {format(new Date(order.served_at || order.updated_at), 'HH:mm')}
                      </Text>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <Text>
                        {order.order_items?.length || 0} items • {formatPrice(order.total_amount)}
                      </Text>
                    </div>

                    {order.special_instructions && (
                      <div style={{ 
                        background: '#fff7e6',
                        padding: '8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginTop: '8px',
                        border: '1px solid #ffd591'
                      }}>
                        <Text strong>Note: </Text>
                        <Text>{order.special_instructions}</Text>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ 
                      marginTop: '16px', 
                      borderTop: '1px solid #f0f0f0', 
                      paddingTop: '12px' 
                    }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Button
                          type="primary"
                          icon={<DollarOutlined />}
                          onClick={() => handlePaymentClick(order)}
                          style={{ 
                            background: '#13c2c2', 
                            borderColor: '#13c2c2',
                            fontWeight: '500',
                            height: '36px'
                          }}
                          block
                        >
                          Process Payment
                        </Button>
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => generateBill(order)}
                          style={{
                            borderColor: '#d9d9d9',
                            color: '#666',
                            fontWeight: '500',
                            height: '32px'
                          }}
                          block
                        >
                          Print Bill
                        </Button>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => showOrderDetails(order)}
                          style={{
                            borderColor: '#d9d9d9',
                            color: '#666',
                            fontWeight: '500',
                            height: '32px'
                          }}
                          block
                        >
                          Details
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {servedOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  No orders pending payment
                </Text>
              </div>
            )}
          </TabPane>

          <TabPane 
            tab={
              <Badge count={paidOrders.length} size="small" offset={[10, 0]}>
                <Space>
                  <DollarOutlined />
                  Paid Orders
                </Space>
              </Badge>
            } 
            key="paid"
          >
            <Row gutter={[16, 16]}>
              {paidOrders.map(order => (
                <Col key={order.id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    style={{ 
                      border: '2px solid #13c2c2',
                      borderRadius: '12px'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text strong style={{ fontSize: '16px' }}>
                          #{order.order_number}
                        </Text>
                        <Tag color="cyan">Table {order.tables?.table_number}</Tag>
                      </Space>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Served at {format(new Date(order.served_at || order.updated_at), 'HH:mm')}
                      </Text>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <Text>
                        {order.order_items?.length || 0} items • {formatPrice(order.total_amount)}
                      </Text>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <Tag color={order.payment_method === 'cash' ? 'green' : order.payment_method === 'card' ? 'blue' : 'purple'}>
                        {order.payment_method === 'cash' ? '💵 Cash' : 
                         order.payment_method === 'card' ? '💳 Card' : 
                         order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : 'Paid'}
                      </Tag>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      marginTop: '16px', 
                      borderTop: '1px solid #f0f0f0', 
                      paddingTop: '12px' 
                    }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Button
                          icon={<PrinterOutlined />}
                          onClick={() => generateBill(order)}
                          style={{
                            borderColor: '#d9d9d9',
                            color: '#666',
                            fontWeight: '500',
                            height: '32px'
                          }}
                          block
                        >
                          Print Bill
                        </Button>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => showOrderDetails(order)}
                          style={{
                            borderColor: '#d9d9d9',
                            color: '#666',
                            fontWeight: '500',
                            height: '32px'
                          }}
                          block
                        >
                          Details
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {paidOrders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  No paid orders today
                </Text>
              </div>
            )}
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <Text>Today's Orders ({todayOrders.length})</Text>
              </Space>
            } 
            key="today"
          >
            <List
              dataSource={todayOrders}
              renderItem={(order) => (
                <List.Item>
                  <Card style={{ width: '100%' }}>
                    <Row>
                      <Col span={4}>
                        <Text strong>#{order.order_number}</Text>
                        <br />
                        <Text type="secondary">Table {order.tables?.table_number}</Text>
                      </Col>
                      <Col span={4}>
                        <Text>{format(new Date(order.created_at), 'HH:mm')}</Text>
                      </Col>
                      <Col span={4}>
                        <Tag color={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </Col>
                      <Col span={4}>
                        <Text>{order.order_items?.length || 0} items</Text>
                      </Col>
                      <Col span={4}>
                        <Text strong>{formatPrice(order.total_amount)}</Text>
                      </Col>
                      <Col span={4}>
                        <Button 
                          type="link" 
                          onClick={() => showOrderDetails(order)}
                        >
                          View Details
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Content>

      {/* Payment Modal */}
      <Modal
        title="Process Payment"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setPaymentModalVisible(false)}
          >
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handlePaymentConfirm}
            disabled={!paymentMethod}
          >
            Confirm Payment
          </Button>
        ]}
        width={400}
      >
        {selectedPaymentOrder && (
          <div>
            <Alert
              message={`Order #${selectedPaymentOrder.order_number} - Table ${selectedPaymentOrder.tables?.table_number}`}
              description={`Total: ${formatPrice(selectedPaymentOrder.total_amount)}`}
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />

            <div style={{ marginBottom: '16px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Select Payment Method:
              </Text>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                placeholder="Choose payment method"
                style={{ width: '100%' }}
                size="large"
              >
                <Option value="cash">💵 Cash</Option>
                <Option value="card">💳 Card Payment</Option>
                <Option value="bank_transfer">🏦 Bank Transfer</Option>
              </Select>
            </div>

            <div style={{ 
              background: '#f9f9f9', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '13px',
              color: '#666'
            }}>
              ℹ️ This will mark the order as paid and complete the transaction.
            </div>
          </div>
        )}
      </Modal>

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
                  {selectedOrder.status.replace('_', ' ').toUpperCase()}
                </Tag>
                <Tag color={selectedOrder.payment_status === PAYMENT_STATUS.PAID ? 'green' : 'orange'}>
                  {selectedOrder.payment_status === PAYMENT_STATUS.PAID ? 'Paid' : 'Payment Pending'}
                </Tag>
                <Text type="secondary">
                  {format(new Date(selectedOrder.created_at), 'MMM dd, HH:mm')}
                </Text>
              </Space>
            </div>

            <List
              dataSource={selectedOrder.order_items || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Text strong>{item.quantity}x {item.menu_items?.name}</Text>
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
                          <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '12px' }}>
                            Note: {item.special_instructions}
                          </Text>
                        )}
                      </div>
                    }
                  />
                  <Text strong>{formatPrice(item.total_price)}</Text>
                </List.Item>
              )}
            />

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

export default StaffDashboard;