import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Button,
  Space,
  Modal,
  Typography,
  Row,
  Col,
  Tag,
  Divider,
  InputNumber,
  Input,
  QRCode,
  message,
  Tooltip,
  Badge
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tableApi } from '../../utils/api';

const { Title, Text } = Typography;
const { confirm } = Modal;

function TableSessionControl({ restaurantId, staffName = 'Staff' }) {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [extendMinutes, setExtendMinutes] = useState(60);
  const [bulkDuration, setBulkDuration] = useState(240); // 4 hours default
  
  const queryClient = useQueryClient();

  // Fetch tables with session data
  const { data: tables = [], isLoading, refetch } = useQuery(
    ['staff-tables-sessions', restaurantId],
    () => tableApi.getByRestaurant(restaurantId),
    { 
      enabled: !!restaurantId,
      refetchInterval: 30000 // Refresh every 30 seconds to check for expiring sessions
    }
  );

  // Fetch active sessions
  const { data: activeSessions = [] } = useQuery(
    ['active-sessions', restaurantId],
    () => tableApi.getActiveSessions(restaurantId),
    { 
      enabled: !!restaurantId,
      refetchInterval: 30000
    }
  );

  // Session management mutations
  const activateSessionMutation = useMutation(
    ({ tableId, duration }) => tableApi.activateSession(tableId, staffName, duration),
    {
      onSuccess: () => {
        message.success('Table session activated');
        refetch();
        queryClient.invalidateQueries(['active-sessions']);
      },
      onError: (error) => {
        message.error(`Failed to activate session: ${error.message}`);
      }
    }
  );

  const deactivateSessionMutation = useMutation(
    (tableId) => tableApi.deactivateSession(tableId),
    {
      onSuccess: () => {
        message.success('Table session deactivated');
        refetch();
        queryClient.invalidateQueries(['active-sessions']);
      },
      onError: (error) => {
        message.error(`Failed to deactivate session: ${error.message}`);
      }
    }
  );

  const extendSessionMutation = useMutation(
    ({ tableId, minutes }) => tableApi.extendSession(tableId, minutes),
    {
      onSuccess: () => {
        message.success('Table session extended');
        setExtendModalVisible(false);
        refetch();
      },
      onError: (error) => {
        message.error(`Failed to extend session: ${error.message}`);
      }
    }
  );

  const bulkToggleMutation = useMutation(
    ({ activate, duration }) => tableApi.bulkToggleSessions(restaurantId, activate, staffName),
    {
      onSuccess: (results) => {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        if (failed === 0) {
          message.success(`All ${successful} tables ${activate ? 'activated' : 'deactivated'} successfully`);
        } else {
          message.warning(`${successful} tables ${activate ? 'activated' : 'deactivated'}, ${failed} failed`);
        }
        
        refetch();
        queryClient.invalidateQueries(['active-sessions']);
      },
      onError: (error) => {
        message.error(`Bulk operation failed: ${error.message}`);
      }
    }
  );

  // Handle individual table session toggle
  const handleToggleSession = (table, activate) => {
    if (activate) {
      activateSessionMutation.mutate({ 
        tableId: table.id, 
        duration: bulkDuration 
      });
    } else {
      confirm({
        title: 'Deactivate Table Session',
        content: `Are you sure you want to deactivate the session for Table ${table.table_number}? Customers will no longer be able to place orders.`,
        onOk() {
          deactivateSessionMutation.mutate(table.id);
        }
      });
    }
  };

  // Handle bulk operations
  const handleBulkActivate = () => {
    confirm({
      title: 'Activate All Tables',
      content: `Activate all tables for ${bulkDuration} minutes? This will allow customers to place orders from any table.`,
      onOk() {
        bulkToggleMutation.mutate({ activate: true, duration: bulkDuration });
      }
    });
  };

  const handleBulkDeactivate = () => {
    const activeCount = tables.filter(t => t.session_active).length;
    if (activeCount === 0) {
      message.info('No active sessions to deactivate');
      return;
    }

    confirm({
      title: 'Deactivate All Tables',
      content: `Deactivate all ${activeCount} active table sessions? Customers will no longer be able to place orders.`,
      onOk() {
        bulkToggleMutation.mutate({ activate: false });
      }
    });
  };

  // Generate menu URL
  const generateMenuUrl = (table) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${restaurantId}/${table.table_number}`;
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!selectedTable) return;
    
    const canvas = document.getElementById('session-qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `table-${selectedTable.table_number}-session-qr.png`;
      link.href = url;
      link.click();
    }
  };

  // Get session status info
  const getSessionStatus = (table) => {
    if (!table.session_active) {
      return { status: 'inactive', color: 'default', text: 'Inactive' };
    }

    if (!table.session_expires_at) {
      return { status: 'active', color: 'success', text: 'Active' };
    }

    const now = new Date();
    const expiresAt = new Date(table.session_expires_at);
    const minutesRemaining = Math.max(0, Math.floor((expiresAt - now) / 60000));

    if (expiresAt <= now) {
      return { status: 'expired', color: 'error', text: 'Expired' };
    }

    if (minutesRemaining <= 30) {
      return { status: 'expiring', color: 'warning', text: `${minutesRemaining}m left` };
    }

    return { status: 'active', color: 'success', text: `${minutesRemaining}m left` };
  };

  // Format time remaining
  const formatTimeRemaining = (table) => {
    if (!table.session_expires_at) return 'No limit';
    
    const now = new Date();
    const expiresAt = new Date(table.session_expires_at);
    const diff = expiresAt - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const summary = {
    total: tables.length,
    active: tables.filter(t => t.session_active).length,
    expiring: tables.filter(t => {
      if (!t.session_active || !t.session_expires_at) return false;
      const minutesLeft = Math.floor((new Date(t.session_expires_at) - new Date()) / 60000);
      return minutesLeft > 0 && minutesLeft <= 30;
    }).length
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3}>Table Session Control</Title>
        <Text type="secondary">
          Activate tables to allow customer orders. Only customers at activated tables can place orders.
        </Text>
      </div>

      {/* Summary and Controls */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {summary.active}
              </div>
              <div style={{ color: '#666' }}>Active Sessions</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {summary.expiring}
              </div>
              <div style={{ color: '#666' }}>Expiring Soon</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Bulk Operations:</Text>
              </div>
              <Space wrap>
                <InputNumber
                  value={bulkDuration}
                  onChange={setBulkDuration}
                  min={30}
                  max={480}
                  addonAfter="min"
                  style={{ width: '120px' }}
                />
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleBulkActivate}
                  loading={bulkToggleMutation.isLoading}
                >
                  Activate All
                </Button>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={handleBulkDeactivate}
                  loading={bulkToggleMutation.isLoading}
                >
                  Deactivate All
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Tables Grid */}
      <Row gutter={[16, 16]}>
        {tables.map((table) => {
          const sessionStatus = getSessionStatus(table);
          const timeRemaining = formatTimeRemaining(table);

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
              <Card
                size="small"
                title={
                  <Space>
                    <TeamOutlined />
                    <Text strong>Table {table.table_number}</Text>
                    <Badge 
                      status={sessionStatus.status === 'active' ? 'processing' : 
                              sessionStatus.status === 'expiring' ? 'warning' :
                              sessionStatus.status === 'expired' ? 'error' : 'default'} 
                    />
                  </Space>
                }
                extra={
                  <Switch
                    size="small"
                    checked={table.session_active}
                    onChange={(checked) => handleToggleSession(table, checked)}
                    loading={activateSessionMutation.isLoading || deactivateSessionMutation.isLoading}
                  />
                }
                style={{
                  borderColor: sessionStatus.status === 'active' ? '#52c41a' :
                              sessionStatus.status === 'expiring' ? '#faad14' :
                              sessionStatus.status === 'expired' ? '#ff4d4f' : undefined
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <Tag color={sessionStatus.color} icon={
                      sessionStatus.status === 'active' ? <CheckCircleOutlined /> :
                      sessionStatus.status === 'expiring' ? <ExclamationCircleOutlined /> : undefined
                    }>
                      {sessionStatus.text}
                    </Tag>
                  </div>
                  
                  {table.capacity && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Capacity: {table.capacity} seats
                    </Text>
                  )}
                  
                  {table.location && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {table.location}
                    </Text>
                  )}
                  
                  {table.session_active && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined /> {timeRemaining}
                      </Text>
                      {table.activated_by && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            By: {table.activated_by}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Space wrap size="small">
                    <Button
                      type="link"
                      size="small"
                      icon={<QrcodeOutlined />}
                      onClick={() => {
                        setSelectedTable(table);
                        setQrModalVisible(true);
                      }}
                    >
                      QR Code
                    </Button>
                    
                    {table.session_active && (
                      <Tooltip title="Extend session">
                        <Button
                          type="link"
                          size="small"
                          icon={<ClockCircleOutlined />}
                          onClick={() => {
                            setSelectedTable(table);
                            setExtendModalVisible(true);
                          }}
                        >
                          Extend
                        </Button>
                      </Tooltip>
                    )}
                  </Space>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* QR Code Modal */}
      <Modal
        title={`QR Code - Table ${selectedTable?.table_number}`}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={downloadQRCode}
          >
            Download QR Code
          </Button>
        ]}
        width={400}
      >
        {selectedTable && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Table {selectedTable.table_number}</Text>
              {selectedTable.location && (
                <div>
                  <Text type="secondary">{selectedTable.location}</Text>
                </div>
              )}
              <div>
                <Text type="secondary">Capacity: {selectedTable.capacity || 4} seats</Text>
              </div>
              <div>
                <Tag color={getSessionStatus(selectedTable).color}>
                  Session {getSessionStatus(selectedTable).text}
                </Tag>
              </div>
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: '16px' }}>
              <QRCode
                id="session-qr-code-canvas"
                value={generateMenuUrl(selectedTable)}
                size={200}
                style={{ marginBottom: '16px' }}
              />
            </div>
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '6px',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              <Text type="secondary">
                {generateMenuUrl(selectedTable)}
              </Text>
            </div>
            
            <Divider />
            
            <div style={{ textAlign: 'left', fontSize: '12px', color: '#666' }}>
              <Text type="secondary">
                • Print this QR code and place it on the table<br/>
                • Customers can only order when session is active<br/>
                • Activate the table session before customers arrive
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Extend Session Modal */}
      <Modal
        title={`Extend Session - Table ${selectedTable?.table_number}`}
        open={extendModalVisible}
        onCancel={() => setExtendModalVisible(false)}
        onOk={() => {
          extendSessionMutation.mutate({
            tableId: selectedTable.id,
            minutes: extendMinutes
          });
        }}
        confirmLoading={extendSessionMutation.isLoading}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Extend the session by:</Text>
          <InputNumber
            value={extendMinutes}
            onChange={setExtendMinutes}
            min={15}
            max={240}
            addonAfter="minutes"
            style={{ width: '200px' }}
          />
          <Text type="secondary">
            Current expiry: {selectedTable?.session_expires_at ? 
              new Date(selectedTable.session_expires_at).toLocaleString() : 
              'No limit'
            }
          </Text>
        </Space>
      </Modal>
    </div>
  );
}

export default TableSessionControl;