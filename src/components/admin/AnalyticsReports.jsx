import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Space,
  Table,
  Tag,
  Progress,
  Select,
  Button,
  Divider
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useQuery } from 'react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { orderApi, menuApi } from '../../utils/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function AnalyticsReports({ restaurantId }) {
  const [dateRange, setDateRange] = useState([
    startOfDay(subDays(new Date(), 7)),
    endOfDay(new Date())
  ]);
  const [reportPeriod, setReportPeriod] = useState('7days');

  // Fetch orders data
  const { data: orders = [], isLoading: ordersLoading } = useQuery(
    ['analytics-orders', restaurantId, dateRange],
    () => orderApi.getByRestaurant(restaurantId),
    {
      enabled: !!restaurantId,
      select: (data) => data.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dateRange[0] && orderDate <= dateRange[1];
      })
    }
  );

  // Fetch menu data for item analysis
  const { data: menu = [] } = useQuery(
    ['analytics-menu', restaurantId],
    () => menuApi.getFullMenu(restaurantId),
    { enabled: !!restaurantId }
  );

  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toFixed(2)}`;
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value || 0).toFixed(1)}%`;
  };

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        completionRate: 0,
        popularItems: [],
        hourlyData: [],
        dailyData: [],
        paymentMethods: []
      };
    }

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'paid').length;
    const averageOrderValue = totalRevenue / totalOrders;
    const completionRate = (completedOrders / totalOrders) * 100;

    // Popular items analysis
    const itemCounts = {};
    const itemRevenue = {};
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        const itemName = item.menu_items?.name || 'Unknown Item';
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        itemRevenue[itemName] = (itemRevenue[itemName] || 0) + parseFloat(item.total_price || 0);
      });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({
        name,
        count,
        revenue: itemRevenue[name] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly analysis
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orders: 0,
      revenue: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += parseFloat(order.total_amount || 0);
    });

    // Daily analysis
    const dailyData = {};
    orders.forEach(order => {
      const day = format(new Date(order.created_at), 'yyyy-MM-dd');
      if (!dailyData[day]) {
        dailyData[day] = { date: day, orders: 0, revenue: 0 };
      }
      dailyData[day].orders += 1;
      dailyData[day].revenue += parseFloat(order.total_amount || 0);
    });

    // Payment methods analysis
    const paymentMethodCounts = {};
    orders.forEach(order => {
      if (order.payment_method) {
        paymentMethodCounts[order.payment_method] = (paymentMethodCounts[order.payment_method] || 0) + 1;
      }
    });

    const paymentMethods = Object.entries(paymentMethodCounts)
      .map(([method, count]) => ({
        method: method.replace('_', ' ').toUpperCase(),
        count,
        percentage: (count / completedOrders) * 100
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      completedOrders,
      completionRate,
      popularItems,
      hourlyData: hourlyData.filter(h => h.orders > 0),
      dailyData: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
      paymentMethods
    };
  }, [orders]);

  const handlePeriodChange = (period) => {
    setReportPeriod(period);
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7days':
        startDate = startOfDay(subDays(now, 7));
        break;
      case '30days':
        startDate = startOfDay(subDays(now, 30));
        break;
      case '90days':
        startDate = startOfDay(subDays(now, 90));
        break;
      default:
        startDate = startOfDay(subDays(now, 7));
    }
    
    setDateRange([startDate, endOfDay(now)]);
  };

  // Table columns for popular items
  const popularItemsColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Orders',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Tag color="blue">{count}</Tag>
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => <Text strong>{formatPrice(revenue)}</Text>
    },
    {
      title: 'Share',
      key: 'share',
      render: (_, record) => {
        const totalItemRevenue = analytics.popularItems.reduce((sum, item) => sum + item.revenue, 0);
        const share = (record.revenue / totalItemRevenue) * 100;
        return (
          <div style={{ width: '100px' }}>
            <Progress percent={share} size="small" showInfo={false} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatPercentage(share)}
            </Text>
          </div>
        );
      }
    }
  ];

  // Table columns for hourly data
  const hourlyColumns = [
    {
      title: 'Hour',
      dataIndex: 'hour',
      key: 'hour',
      render: (hour) => `${hour}:00`
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders'
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => formatPrice(revenue)
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Analytics & Reports</Title>
        <Text type="secondary">Monitor your restaurant's performance and insights</Text>
      </div>

      {/* Period Selection */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="middle" wrap>
          <Text strong>Report Period:</Text>
          <Select
            value={reportPeriod}
            onChange={handlePeriodChange}
            style={{ width: 120 }}
          >
            <Option value="today">Today</Option>
            <Option value="7days">Last 7 Days</Option>
            <Option value="30days">Last 30 Days</Option>
            <Option value="90days">Last 90 Days</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange([startOfDay(dates[0].toDate()), endOfDay(dates[1].toDate())]);
              }
            }}
          />
          <Button icon={<DownloadOutlined />}>
            Export Report
          </Button>
        </Space>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={analytics.totalRevenue}
              formatter={(value) => formatPrice(value)}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={analytics.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={analytics.averageOrderValue}
              formatter={(value) => formatPrice(value)}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={analytics.completionRate}
              formatter={(value) => formatPercentage(value)}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Popular Items */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                Top Selling Items
              </Space>
            }
            style={{ height: '500px' }}
          >
            <Table
              columns={popularItemsColumns}
              dataSource={analytics.popularItems}
              rowKey="name"
              pagination={{ pageSize: 8 }}
              size="small"
              loading={ordersLoading}
            />
          </Card>
        </Col>

        {/* Hourly Performance */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                Hourly Performance
              </Space>
            }
            style={{ height: '500px' }}
          >
            <Table
              columns={hourlyColumns}
              dataSource={analytics.hourlyData}
              rowKey="hour"
              pagination={{ pageSize: 8 }}
              size="small"
              loading={ordersLoading}
            />
          </Card>
        </Col>

        {/* Payment Methods */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DollarOutlined />
                Payment Methods
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {analytics.paymentMethods.map((method) => (
                <div key={method.method} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text>{method.method}</Text>
                    <Text strong>{method.count} orders</Text>
                  </div>
                  <Progress percent={method.percentage} size="small" />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Daily Revenue Trend */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                Daily Performance
              </Space>
            }
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {analytics.dailyData.map((day) => (
                <div key={day.date} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <div>
                    <Text strong>{format(new Date(day.date), 'MMM dd')}</Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {day.orders} orders
                      </Text>
                    </div>
                  </div>
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatPrice(day.revenue)}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsReports;