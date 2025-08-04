import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  QRCode,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  TableOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { tableApi } from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

function TableManagement({ restaurantId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch tables
  const { data: tables = [], isLoading, refetch } = useQuery(
    ['admin-tables', restaurantId],
    () => tableApi.getByRestaurant(restaurantId),
    { enabled: !!restaurantId }
  );

  // Table mutations
  const createTableMutation = useMutation(
    (tableData) => tableApi.create({ ...tableData, restaurant_id: restaurantId }),
    {
      onSuccess: () => {
        message.success('Table created successfully');
        setModalVisible(false);
        form.resetFields();
        refetch();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to create table';
        message.error(`Failed to create table: ${errorMessage}`);
        console.error('Create table error:', error);
        console.error('Error details:', error?.details);
      }
    }
  );

  const updateTableMutation = useMutation(
    ({ id, data }) => tableApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Table updated successfully');
        setModalVisible(false);
        setEditingTable(null);
        form.resetFields();
        refetch();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to update table';
        message.error(`Failed to update table: ${errorMessage}`);
        console.error('Update table error:', error);
        console.error('Error details:', error?.details);
      }
    }
  );

  const deleteTableMutation = useMutation(
    (id) => tableApi.delete(id),
    {
      onSuccess: () => {
        message.success('Table deleted successfully');
        refetch();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to delete table';
        message.error(`Failed to delete table: ${errorMessage}`);
        console.error('Delete table error:', error);
        console.error('Error details:', error?.details);
      }
    }
  );

  // Event handlers
  const handleCreate = () => {
    setEditingTable(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (table) => {
    console.log('Editing table:', table);
    setEditingTable(table);
    form.setFieldsValue({
      table_number: Number(table.table_number), // Ensure it's a number
      capacity: Number(table.capacity), // Ensure it's a number
      location: table.location,
      is_active: table.is_active
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Form values submitted:', values);
      console.log('Editing table:', editingTable);
      
      // Ensure numeric values are properly converted
      const formattedValues = {
        ...values,
        table_number: Number(values.table_number),
        capacity: Number(values.capacity)
      };
      
      console.log('Formatted values:', formattedValues);
      
      if (editingTable) {
        console.log('Updating table with ID:', editingTable.id);
        await updateTableMutation.mutateAsync({
          id: editingTable.id,
          data: formattedValues
        });
      } else {
        console.log('Creating new table');
        await createTableMutation.mutateAsync(formattedValues);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleShowQR = (table) => {
    setSelectedTable(table);
    setQrModalVisible(true);
  };

  const generateMenuUrl = (table) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${restaurantId}/${table.table_number}`;
  };

  const downloadQRCode = () => {
    if (!selectedTable) return;
    
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `table-${selectedTable.table_number}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const columns = [
    {
      title: 'Table Number',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (text) => <Text strong>Table {text}</Text>,
      sorter: (a, b) => a.table_number - b.table_number
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity) => `${capacity} seats`
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || <Text type="secondary">Not specified</Text>
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'QR Code',
      key: 'qr_code',
      render: (_, record) => (
        <Button
          type="link"
          icon={<QrcodeOutlined />}
          onClick={() => handleShowQR(record)}
        >
          View QR
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Table"
            description="Are you sure you want to delete this table?"
            onConfirm={() => deleteTableMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const summary = {
    total: tables.length,
    active: tables.filter(t => t.is_active).length,
    inactive: tables.filter(t => !t.is_active).length,
    totalCapacity: tables.reduce((sum, t) => sum + (t.capacity || 0), 0)
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Table Management</Title>
        <Text type="secondary">Manage your restaurant's tables and generate QR codes for orders</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {summary.total}
              </div>
              <div style={{ color: '#666' }}>Total Tables</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {summary.active}
              </div>
              <div style={{ color: '#666' }}>Active Tables</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {summary.inactive}
              </div>
              <div style={{ color: '#666' }}>Inactive Tables</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {summary.totalCapacity}
              </div>
              <div style={{ color: '#666' }}>Total Capacity</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tables List */}
      <Card
        title={
          <Space>
            <TableOutlined />
            Restaurant Tables
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Table
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tables}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Table Form Modal */}
      <Modal
        title={editingTable ? 'Edit Table' : 'Add Table'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTable(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="table_number"
            label="Table Number"
            rules={[
              { required: true, message: 'Please enter table number' },
              { 
                validator: (_, value) => {
                  if (value && Number(value) >= 1) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Table number must be at least 1'));
                }
              }
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="e.g., 1, 2, 3..."
            />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Seating Capacity"
            rules={[
              { required: true, message: 'Please enter seating capacity' },
              { 
                validator: (_, value) => {
                  if (value && Number(value) >= 1 && Number(value) <= 20) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Capacity must be between 1 and 20'));
                }
              }
            ]}
          >
            <InputNumber
              min={1}
              max={20}
              style={{ width: '100%' }}
              placeholder="Number of seats"
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location/Section"
          >
            <Input placeholder="e.g., Main Dining, Patio, Bar Area (optional)" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createTableMutation.isLoading || updateTableMutation.isLoading}
              >
                {editingTable ? 'Update' : 'Create'} Table
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
                <Text type="secondary">Capacity: {selectedTable.capacity} seats</Text>
              </div>
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: '16px' }}>
              <QRCode
                id="qr-code-canvas"
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
                • Customers can scan to access the menu<br/>
                • Orders will be automatically assigned to this table
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TableManagement;