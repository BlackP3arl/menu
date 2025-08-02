import React from 'react';
import { Typography, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

function Test() {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Test Page</Title>
      <Button type="primary" icon={<CheckCircleOutlined />}>
        Test Button
      </Button>
      <p>If you can see this page, the basic setup is working!</p>
    </div>
  );
}

export default Test;