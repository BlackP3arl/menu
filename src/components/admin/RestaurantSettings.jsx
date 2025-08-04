import React from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  TimePicker,
  Switch,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Upload,
  message
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useMutation, useQueryClient } from 'react-query';
import moment from 'moment';
import { restaurantApi } from '../../utils/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

function RestaurantSettings({ restaurantId, restaurant }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Update restaurant mutation
  const updateRestaurantMutation = useMutation(
    (data) => restaurantApi.update(restaurantId, data),
    {
      onSuccess: () => {
        message.success('Restaurant settings updated successfully');
        queryClient.invalidateQueries(['restaurant', restaurantId]);
      },
      onError: (error) => {
        message.error('Failed to update restaurant settings');
        console.error('Update restaurant error:', error);
      }
    }
  );

  // Set initial form values when restaurant data is loaded
  React.useEffect(() => {
    if (restaurant) {
      form.setFieldsValue({
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        tax_rate: restaurant.tax_rate * 100, // Convert to percentage
        service_charge_rate: (restaurant.service_charge_rate || 0) * 100,
        currency: restaurant.currency || 'USD',
        timezone: restaurant.timezone || 'America/New_York',
        is_active: restaurant.is_active,
        accepts_reservations: restaurant.accepts_reservations,
        delivery_available: restaurant.delivery_available,
        takeout_available: restaurant.takeout_available,
        opening_time: restaurant.opening_time ? moment(restaurant.opening_time, 'HH:mm') : null,
        closing_time: restaurant.closing_time ? moment(restaurant.closing_time, 'HH:mm') : null,
        max_party_size: restaurant.max_party_size || 8,
        reservation_advance_days: restaurant.reservation_advance_days || 30
      });
    }
  }, [restaurant, form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        tax_rate: values.tax_rate / 100, // Convert back to decimal
        service_charge_rate: values.service_charge_rate / 100,
        opening_time: values.opening_time ? values.opening_time.format('HH:mm') : null,
        closing_time: values.closing_time ? values.closing_time.format('HH:mm') : null
      };
      
      await updateRestaurantMutation.mutateAsync(formattedValues);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return isImage && isLt2M;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    }
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Restaurant Settings</Title>
        <Text type="secondary">Manage your restaurant's information and operational settings</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
      >
        <Row gutter={24}>
          <Col span={24} lg={16}>
            {/* Basic Information */}
            <Card
              title={
                <Space>
                  <ShopOutlined />
                  Basic Information
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="name"
                    label="Restaurant Name"
                    rules={[{ required: true, message: 'Please enter restaurant name' }]}
                  >
                    <Input placeholder="Your Restaurant Name" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Brief description of your restaurant"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: 'Please enter address' }]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Full restaurant address"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: 'Please enter phone number' }]}
                  >
                    <Input placeholder="+1 (555) 123-4567" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter valid email' }
                    ]}
                  >
                    <Input placeholder="restaurant@example.com" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="website"
                    label="Website"
                  >
                    <Input placeholder="https://www.yourrestaurant.com" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Operating Hours */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  Operating Hours
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="opening_time"
                    label="Opening Time"
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Select opening time"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="closing_time"
                    label="Closing Time"
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Select closing time"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Financial Settings */}
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  Financial Settings
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tax_rate"
                    label="Tax Rate (%)"
                    rules={[{ required: true, message: 'Please enter tax rate' }]}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.01}
                      style={{ width: '100%' }}
                      placeholder="8.75"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="service_charge_rate"
                    label="Service Charge (%)"
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      step={0.01}
                      style={{ width: '100%' }}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="currency"
                    label="Currency"
                  >
                    <Input placeholder="USD" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                  >
                    <Input placeholder="America/New_York" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24} lg={8}>
            {/* Restaurant Status */}
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  Restaurant Status
                </Space>
              }
              style={{ marginBottom: '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="is_active"
                  label="Restaurant Active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Divider />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  When inactive, customers cannot access the menu or place orders
                </Text>
              </Space>
            </Card>

            {/* Service Options */}
            <Card
              title="Service Options"
              style={{ marginBottom: '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name="accepts_reservations"
                  label="Accept Reservations"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="delivery_available"
                  label="Delivery Available"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="takeout_available"
                  label="Takeout Available"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Space>
            </Card>

            {/* Capacity Settings */}
            <Card
              title="Capacity Settings"
              style={{ marginBottom: '24px' }}
            >
              <Form.Item
                name="max_party_size"
                label="Maximum Party Size"
              >
                <InputNumber
                  min={1}
                  max={50}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="reservation_advance_days"
                label="Reservation Advance Days"
              >
                <InputNumber
                  min={1}
                  max={365}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Card>

            {/* Logo Upload */}
            <Card
              title="Restaurant Logo"
              style={{ marginBottom: '24px' }}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload Logo</Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                Recommended: 400x400px, max 2MB
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Submit Button */}
        <Card>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => form.resetFields()}>
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateRestaurantMutation.isLoading}
                size="large"
              >
                Save Settings
              </Button>
            </Space>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
}

export default RestaurantSettings;