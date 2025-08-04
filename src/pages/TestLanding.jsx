import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Row, Col, Divider } from 'antd';
import { QrcodeOutlined, LinkOutlined, CoffeeOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';

const { Title, Text, Paragraph } = Typography;

function TestLanding() {
  const [tableNumber, setTableNumber] = useState('1');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo restaurant ID from our sample data
  const DEMO_RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440000';
  
  const generateQRCode = async () => {
    if (!tableNumber || tableNumber.trim() === '') {
      return;
    }

    setLoading(true);
    try {
      const menuUrl = `${window.location.origin}/menu/${DEMO_RESTAURANT_ID}/${tableNumber}`;
      const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuUrl = () => {
    return `${window.location.origin}/menu/${DEMO_RESTAURANT_ID}/${tableNumber}`;
  };

  const getDashboardUrls = () => {
    return {
      kitchen: `${window.location.origin}/kitchen/${DEMO_RESTAURANT_ID}`,
      staff: `${window.location.origin}/staff/${DEMO_RESTAURANT_ID}`,
      admin: `${window.location.origin}/admin/${DEMO_RESTAURANT_ID}`
    };
  };

  React.useEffect(() => {
    generateQRCode();
  }, [tableNumber]);

  const dashboardUrls = getDashboardUrls();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0681a 0%, #e1500f 100%)',
      padding: '20px 0'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          color: 'white', 
          marginBottom: '40px' 
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: '8px' }}>
            Restaurant QR Ordering System
          </Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>
            Testing Dashboard - Generate QR codes and test the system
          </Paragraph>
        </div>

        <Row gutter={24}>
          {/* QR Code Generator */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <QrcodeOutlined />
                  <span>Generate Table QR Code</span>
                </Space>
              }
              style={{ height: 'fit-content' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong>Table Number:</Text>
                  <Input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number (1-50)"
                    style={{ marginTop: '8px' }}
                    size="large"
                  />
                </div>

                {qrCodeUrl && (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      style={{ 
                        border: '2px solid #f0f0f0',
                        borderRadius: '8px',
                        padding: '10px',
                        background: 'white'
                      }}
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Customers scan this QR code at Table {tableNumber}
                      </Text>
                    </div>
                  </div>
                )}

                <div>
                  <Text strong>Menu URL for Table {tableNumber}:</Text>
                  <Input.TextArea
                    value={getMenuUrl()}
                    readOnly
                    rows={2}
                    style={{ marginTop: '8px', fontSize: '12px' }}
                  />
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    href={getMenuUrl()}
                    target="_blank"
                    style={{ marginTop: '8px', width: '100%' }}
                    size="large"
                  >
                    Open Customer Menu (Table {tableNumber})
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Dashboard Links */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <CoffeeOutlined />
                  <span>Staff Dashboards</span>
                </Space>
              }
              style={{ height: 'fit-content' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong style={{ color: '#52c41a' }}>Kitchen Dashboard</Text>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: '4px 0 8px 0' }}>
                    For kitchen staff to manage incoming orders
                  </Paragraph>
                  <Button
                    type="default"
                    href={dashboardUrls.kitchen}
                    target="_blank"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    Open Kitchen Dashboard
                  </Button>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div>
                  <Text strong style={{ color: '#722ed1' }}>Staff Dashboard</Text>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: '4px 0 8px 0' }}>
                    For service staff to manage order delivery and payments
                  </Paragraph>
                  <Button
                    type="default"
                    href={dashboardUrls.staff}
                    target="_blank"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    Open Staff Dashboard
                  </Button>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div>
                  <Text strong style={{ color: '#1890ff' }}>Admin Dashboard</Text>
                  <Paragraph type="secondary" style={{ fontSize: '13px', margin: '4px 0 8px 0' }}>
                    For restaurant owners to manage menu, tables, settings, and analytics
                  </Paragraph>
                  <Button
                    type="default"
                    href={dashboardUrls.admin}
                    target="_blank"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    Open Admin Dashboard
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Instructions */}
        <Card 
          title="Testing Instructions" 
          style={{ marginTop: '24px' }}
        >
          <Row gutter={16}>
            <Col xs={24} lg={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Title level={4} style={{ color: '#f0681a' }}>1. Customer Flow</Title>
                <Paragraph>
                  • Enter a table number above<br/>
                  • Click "Open Customer Menu"<br/>
                  • Browse menu and place orders<br/>
                  • Track order status
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} lg={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Title level={4} style={{ color: '#52c41a' }}>2. Kitchen Flow</Title>
                <Paragraph>
                  • Open Kitchen Dashboard<br/>
                  • See new orders appear<br/>
                  • Mark orders in progress<br/>
                  • Complete individual items
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} lg={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Title level={4} style={{ color: '#722ed1' }}>3. Service Flow</Title>
                <Paragraph>
                  • Open Staff Dashboard<br/>
                  • See ready orders<br/>
                  • Mark as served<br/>
                  • Generate bills and mark paid
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} lg={6}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Title level={4} style={{ color: '#1890ff' }}>4. Admin Flow</Title>
                <Paragraph>
                  • Open Admin Dashboard<br/>
                  • Manage menu & tables<br/>
                  • View analytics & reports<br/>
                  • Configure restaurant settings
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          color: 'rgba(255,255,255,0.8)', 
          marginTop: '40px',
          fontSize: '14px'
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            Restaurant QR Ordering System • Built with React, Ant Design & Supabase
          </Text>
        </div>
      </div>
    </div>
  );
}

export default TestLanding;