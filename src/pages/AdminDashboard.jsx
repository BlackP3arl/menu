import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Typography, 
  Card, 
  Row, 
  Col,
  Statistic,
  Button,
  Space,
  Badge,
  Divider
} from 'antd';
import {
  DashboardOutlined,
  MenuOutlined,
  SettingOutlined,
  TableOutlined,
  BarChartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  EyeOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useQuery } from 'react-query';

import { restaurantApi, orderApi, menuApi } from '../utils/api';
import MenuManagement from '../components/admin/MenuManagement';
import RestaurantSettings from '../components/admin/RestaurantSettings';
import TableManagement from '../components/admin/TableManagement';
import AnalyticsReports from '../components/admin/AnalyticsReports';
import StaffManagement from '../components/admin/StaffManagement';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const MENU_ITEMS = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'menu',
    icon: <MenuOutlined />,
    label: 'Menu Management',
  },
  {
    key: 'tables',
    icon: <TableOutlined />,
    label: 'Table Management',
  },
  {
    key: 'analytics',
    icon: <BarChartOutlined />,
    label: 'Analytics & Reports',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Restaurant Settings',
  },
  {
    key: 'staff',
    icon: <UserOutlined />,
    label: 'Staff Management',
  },
];

function AdminDashboard() {
  const { restaurantId } = useParams();
  const [selectedMenuItem, setSelectedMenuItem] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // Fetch restaurant data
  const { data: restaurant, isLoading: restaurantLoading } = useQuery(
    ['restaurant', restaurantId],
    () => restaurantApi.getById(restaurantId),
    { enabled: !!restaurantId }
  );

  // Fetch dashboard statistics
  const { data: todayOrders = [] } = useQuery(
    ['admin-today-orders', restaurantId],
    () => orderApi.getByRestaurant(restaurantId),
    {
      enabled: !!restaurantId,
      select: (orders) => orders.filter(order => 
        new Date(order.created_at).toDateString() === new Date().toDateString()
      )
    }
  );

  const { data: menuStats } = useQuery(
    ['admin-menu-stats', restaurantId],
    () => menuApi.getFullMenu(restaurantId),
    {
      enabled: !!restaurantId,
      select: (menu) => ({
        categories: menu?.length || 0,
        items: menu?.reduce((total, category) => total + (category.menu_items?.length || 0), 0) || 0
      })
    }
  );

  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toFixed(2)}`;
  };

  const renderDashboardOverview = () => {
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const pendingOrders = todayOrders.filter(order => order.status !== 'paid').length;
    const completedOrders = todayOrders.filter(order => order.status === 'paid').length;

    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>Restaurant Overview</Title>
          <Text type="secondary">Monitor your restaurant's performance and manage operations</Text>
        </div>

        {/* Key Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Revenue"
                value={todayRevenue}
                formatter={(value) => formatPrice(value)}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Today's Orders"
                value={todayOrders.length}
                prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Pending Orders"
                value={pendingOrders}
                prefix={<Badge status="processing" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed Orders"
                value={completedOrders}
                prefix={<Badge status="success" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={{ marginBottom: '24px' }}>
          <Space wrap size="middle">
            <Button 
              type="primary" 
              icon={<MenuOutlined />}
              onClick={() => setSelectedMenuItem('menu')}
            >
              Manage Menu
            </Button>
            <Button 
              icon={<TableOutlined />}
              onClick={() => setSelectedMenuItem('tables')}
            >
              Manage Tables
            </Button>
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => setSelectedMenuItem('analytics')}
            >
              View Analytics
            </Button>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setSelectedMenuItem('settings')}
            >
              Restaurant Settings
            </Button>
          </Space>
        </Card>

        {/* Menu Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Menu Overview" extra={<MenuOutlined />}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Categories"
                    value={menuStats?.categories || 0}
                    prefix={<MenuOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Menu Items"
                    value={menuStats?.items || 0}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Activity" extra={<EyeOutlined />}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">
                  {todayOrders.length > 0 
                    ? `${todayOrders.length} orders received today`
                    : 'No orders received today'
                  }
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'menu':
        return <MenuManagement restaurantId={restaurantId} />;
      case 'tables':
        return <TableManagement restaurantId={restaurantId} />;
      case 'analytics':
        return <AnalyticsReports restaurantId={restaurantId} />;
      case 'settings':
        return <RestaurantSettings restaurantId={restaurantId} restaurant={restaurant} />;
      case 'staff':
        return <StaffManagement restaurantId={restaurantId} />;
      default:
        return renderDashboardOverview();
    }
  };

  if (restaurantLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={250}
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
            {collapsed ? 'Admin' : 'Admin Panel'}
          </Title>
          {!collapsed && restaurant && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {restaurant.name}
            </Text>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[selectedMenuItem]}
          items={MENU_ITEMS}
          onClick={({ key }) => setSelectedMenuItem(key)}
          style={{ border: 'none', paddingTop: '8px' }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#722ed1', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            {MENU_ITEMS.find(item => item.key === selectedMenuItem)?.label || 'Dashboard'}
          </Title>
          <Space>
            <Text style={{ color: 'white' }}>
              Welcome, Admin
            </Text>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px', 
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminDashboard;