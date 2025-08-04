import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Tag,
  Row,
  Col,
  Avatar,
  Switch
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock staff API (replace with actual API)
const staffApi = {
  getByRestaurant: async (restaurantId) => {
    // Mock data - replace with actual API call
    return [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@restaurant.com',
        phone: '+1 (555) 123-4567',
        role: 'manager',
        is_active: true,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@restaurant.com',
        phone: '+1 (555) 234-5678',
        role: 'kitchen_staff',
        is_active: true,
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike@restaurant.com',
        phone: '+1 (555) 345-6789',
        role: 'server',
        is_active: false,
        created_at: '2024-02-01T10:00:00Z'
      }
    ];
  },
  create: async (data) => {
    // Mock create - replace with actual API call
    console.log('Creating staff:', data);
    return { id: Date.now(), ...data, created_at: new Date().toISOString() };
  },
  update: async (id, data) => {
    // Mock update - replace with actual API call
    console.log('Updating staff:', id, data);
    return { id, ...data };
  },
  delete: async (id) => {
    // Mock delete - replace with actual API call
    console.log('Deleting staff:', id);
    return { success: true };
  }
};

const STAFF_ROLES = [
  { value: 'manager', label: 'Manager', color: 'purple' },
  { value: 'kitchen_staff', label: 'Kitchen Staff', color: 'orange' },
  { value: 'server', label: 'Server', color: 'blue' },
  { value: 'cashier', label: 'Cashier', color: 'green' },
  { value: 'host', label: 'Host', color: 'cyan' }
];

function StaffManagement({ restaurantId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch staff data
  const { data: staff = [], isLoading, refetch } = useQuery(
    ['admin-staff', restaurantId],
    () => staffApi.getByRestaurant(restaurantId),
    { enabled: !!restaurantId }
  );

  // Staff mutations
  const createStaffMutation = useMutation(
    (staffData) => staffApi.create({ ...staffData, restaurant_id: restaurantId }),
    {
      onSuccess: () => {
        message.success('Staff member added successfully');
        setModalVisible(false);
        form.resetFields();
        refetch();
      },
      onError: (error) => {
        message.error('Failed to add staff member');
        console.error('Create staff error:', error);
      }
    }
  );

  const updateStaffMutation = useMutation(
    ({ id, data }) => staffApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Staff member updated successfully');
        setModalVisible(false);
        setEditingStaff(null);
        form.resetFields();
        refetch();
      },
      onError: (error) => {
        message.error('Failed to update staff member');
        console.error('Update staff error:', error);
      }
    }
  );

  const deleteStaffMutation = useMutation(
    (id) => staffApi.delete(id),
    {
      onSuccess: () => {
        message.success('Staff member removed successfully');
        refetch();
      },
      onError: (error) => {
        message.error('Failed to remove staff member');
        console.error('Delete staff error:', error);
      }
    }
  );

  // Event handlers
  const handleCreate = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    form.setFieldsValue({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      is_active: staffMember.is_active
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await updateStaffMutation.mutateAsync({
          id: editingStaff.id,
          data: values
        });
      } else {
        await createStaffMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const getRoleInfo = (role) => {
    return STAFF_ROLES.find(r => r.value === role) || { label: role, color: 'default' };
  };

  const columns = [
    {
      title: 'Staff Member',
      key: 'member',
      render: (_, record) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} />
          <div>
            <div>
              <Text strong>{record.name}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <MailOutlined style={{ marginRight: '4px' }} />
                {record.email}
              </Text>
            </div>
            {record.phone && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <PhoneOutlined style={{ marginRight: '4px' }} />
                  {record.phone}
                </Text>
              </div>
            )}
          </div>
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleInfo = getRoleInfo(role);
        return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
      }
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
            title="Remove Staff Member"
            description="Are you sure you want to remove this staff member?"
            onConfirm={() => deleteStaffMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Remove
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const summary = {
    total: staff.length,
    active: staff.filter(s => s.is_active).length,
    inactive: staff.filter(s => !s.is_active).length,
    byRole: STAFF_ROLES.map(role => ({
      ...role,
      count: staff.filter(s => s.role === role.value).length
    }))
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Staff Management</Title>
        <Text type="secondary">Manage your restaurant's staff members and their roles</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {summary.total}
              </div>
              <div style={{ color: '#666' }}>Total Staff</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {summary.active}
              </div>
              <div style={{ color: '#666' }}>Active</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {summary.inactive}
              </div>
              <div style={{ color: '#666' }}>Inactive</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Role Distribution */}
      <Card title="Staff by Role" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          {summary.byRole.map(role => (
            <Col key={role.value} xs={12} sm={8} md={6} lg={4}>
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: `var(--ant-color-${role.color})` }}>
                  {role.count}
                </div>
                <Tag color={role.color} style={{ margin: 0 }}>
                  {role.label}
                </Tag>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Staff List */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            Staff Members
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Staff Member
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Staff Form Modal */}
      <Modal
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingStaff(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="e.g., John Smith" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="john@restaurant.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select role">
                  {STAFF_ROLES.map(role => (
                    <Option key={role.value} value={role.value}>
                      <Tag color={role.color}>{role.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <div style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <strong>Role Descriptions:</strong><br/>
              • <strong>Manager:</strong> Full access to all features and settings<br/>
              • <strong>Kitchen Staff:</strong> Access to kitchen dashboard for order management<br/>
              • <strong>Server:</strong> Access to staff dashboard for payment processing<br/>
              • <strong>Cashier:</strong> Access to payment and billing features<br/>
              • <strong>Host:</strong> Access to table management and reservations
            </Text>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createStaffMutation.isLoading || updateStaffMutation.isLoading}
              >
                {editingStaff ? 'Update' : 'Add'} Staff Member
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StaffManagement;