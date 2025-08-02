import React from 'react';
import { Layout, Typography, Alert } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

function AdminDashboard() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Admin Dashboard</Title>
        <Alert
          message="Coming Soon"
          description="Admin dashboard with menu management, analytics, and restaurant settings will be implemented in Phase 3."
          type="info"
          showIcon
        />
      </Content>
    </Layout>
  );
}

export default AdminDashboard;