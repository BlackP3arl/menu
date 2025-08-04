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
  Upload,
  message,
  Popconfirm,
  Typography,
  Tabs,
  Tag,
  Row,
  Col,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MenuOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { menuApi, categoryApi } from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function MenuManagement({ restaurantId }) {
  const [activeTab, setActiveTab] = useState('categories');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch menu data
  const { data: menu = [], isLoading: menuLoading, refetch: refetchMenu } = useQuery(
    ['admin-menu', restaurantId],
    () => menuApi.getFullMenu(restaurantId),
    { enabled: !!restaurantId }
  );

  // Category mutations
  const createCategoryMutation = useMutation(
    (categoryData) => categoryApi.create({ ...categoryData, restaurant_id: restaurantId }),
    {
      onSuccess: () => {
        message.success('Category created successfully');
        setCategoryModalVisible(false);
        categoryForm.resetFields();
        refetchMenu();
      },
      onError: (error) => {
        message.error('Failed to create category');
        console.error('Create category error:', error);
      }
    }
  );

  const updateCategoryMutation = useMutation(
    ({ id, data }) => categoryApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Category updated successfully');
        setCategoryModalVisible(false);
        setEditingCategory(null);
        categoryForm.resetFields();
        refetchMenu();
      },
      onError: (error) => {
        message.error('Failed to update category');
        console.error('Update category error:', error);
      }
    }
  );

  const deleteCategoryMutation = useMutation(
    (id) => categoryApi.delete(id),
    {
      onSuccess: () => {
        message.success('Category deleted successfully');
        refetchMenu();
      },
      onError: (error) => {
        message.error('Failed to delete category');
        console.error('Delete category error:', error);
      }
    }
  );

  // Item mutations  
  const createItemMutation = useMutation(
    (itemData) => menuApi.createItem(itemData),
    {
      onSuccess: () => {
        message.success('Menu item created successfully');
        setItemModalVisible(false);
        itemForm.resetFields();
        refetchMenu();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to create menu item';
        message.error(`Failed to create menu item: ${errorMessage}`);
        console.error('Create item error:', error);
        console.error('Error details:', error?.details);
      }
    }
  );

  const updateItemMutation = useMutation(
    ({ id, data }) => menuApi.updateItem(id, data),
    {
      onSuccess: () => {
        message.success('Menu item updated successfully');
        setItemModalVisible(false);
        setEditingItem(null);
        itemForm.resetFields();
        refetchMenu();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to update menu item';
        message.error(`Failed to update menu item: ${errorMessage}`);
        console.error('Update item error:', error);
        console.error('Error details:', error?.details);
      }
    }
  );

  const deleteItemMutation = useMutation(
    (id) => menuApi.deleteItem(id),
    {
      onSuccess: () => {
        message.success('Menu item deleted successfully');
        refetchMenu();
      },
      onError: (error) => {
        message.error('Failed to delete menu item');
        console.error('Delete item error:', error);
      }
    }
  );

  // Event handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    categoryForm.setFieldsValue({
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setCategoryModalVisible(true);
  };

  const handleCreateItem = () => {
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({ category_id: selectedCategory });
    setItemModalVisible(true);
  };

  const handleEditItem = (item) => {
    console.log('Editing item:', item);
    setEditingItem(item);
    itemForm.setFieldsValue({
      name: item.name,
      description: item.description,
      price: item.base_price, // Map base_price to price form field
      category_id: item.category_id,
      is_active: item.is_active, // Use is_active field directly
      prep_time: item.prep_time,
      allergens: item.allergens,
      dietary_info: item.dietary_info
    });
    setItemModalVisible(true);
  };

  const handleCategorySubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: values
        });
      } else {
        await createCategoryMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error('Category submit error:', error);
    }
  };

  const handleItemSubmit = async (values) => {
    try {
      console.log('Form values submitted:', values);
      console.log('Editing item:', editingItem);
      
      // Validate category selection
      if (!values.category_id) {
        message.error('Please select a category for the menu item');
        return;
      }
      
      // Map form values to database fields
      const mappedValues = {
        ...values,
        base_price: values.price // Map price to base_price
      };
      
      // Remove the form fields that don't exist in database
      delete mappedValues.price;
      
      console.log('Mapped values for database:', mappedValues);
      
      if (editingItem) {
        console.log('Updating item with ID:', editingItem.id);
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          data: mappedValues
        });
      } else {
        console.log('Creating new item');
        await createItemMutation.mutateAsync(mappedValues);
      }
    } catch (error) {
      console.error('Item submit error:', error);
    }
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price || 0).toFixed(2)}`;
  };

  // Table columns for categories
  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <Tag color="blue">{record.menu_items?.length || 0} items</Tag>
      )
    },
    {
      title: 'Order',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 80
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
            onClick={() => handleEditCategory(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category? All items in this category will also be deleted."
            onConfirm={() => deleteCategoryMutation.mutate(record.id)}
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

  // Table columns for menu items
  const itemColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description.length > 80 
                  ? `${record.description.substring(0, 80)}...` 
                  : record.description
                }
              </Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price) => <Text strong>{formatPrice(price)}</Text>
    },
    {
      title: 'Category',
      key: 'category',
      render: (_, record) => {
        const category = menu.find(cat => cat.id === record.category_id);
        return <Tag color="purple">{category?.name || 'Unknown'}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Available' : 'Unavailable'}
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
            onClick={() => handleEditItem(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Item"
            description="Are you sure you want to delete this menu item?"
            onConfirm={() => deleteItemMutation.mutate(record.id)}
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

  // Get all menu items
  const allItems = menu.reduce((items, category) => {
    return [...items, ...(category.menu_items || [])];
  }, []);

  // Filter items by selected category
  const filteredItems = selectedCategory 
    ? allItems.filter(item => item.category_id === selectedCategory)
    : allItems;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Menu Management</Title>
        <Text type="secondary">Manage your restaurant's menu categories and items</Text>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'categories',
            label: (
              <span>
                <AppstoreOutlined />
                Categories ({menu.length})
              </span>
            ),
            children: (
              <Card
                title="Menu Categories"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateCategory}
                  >
                    Add Category
                  </Button>
                }
              >
                <Table
                  columns={categoryColumns}
                  dataSource={menu}
                  rowKey="id"
                  loading={menuLoading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'items',
            label: (
              <span>
                <MenuOutlined />
                Menu Items ({allItems.length})
              </span>
            ),
            children: (
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Text strong>Filter by Category:</Text>
                    <Select
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      placeholder="All Categories"
                      style={{ width: 200 }}
                      allowClear
                    >
                      {menu.map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateItem}
                  >
                    Add Menu Item
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Menu Items">
                <Table
                  columns={itemColumns}
                  dataSource={filteredItems}
                  rowKey="id"
                  loading={menuLoading}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </Col>
              </Row>
            )
          }
        ]}
      />

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
          categoryForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCategorySubmit}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="e.g., Appetizers, Main Courses, Desserts" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Brief description of this category (optional)"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Display Order"
                initialValue={1}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
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

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCategoryModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Menu Item Modal */}
      <Modal
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        open={itemModalVisible}
        onCancel={() => {
          setItemModalVisible(false);
          setEditingItem(null);
          itemForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleItemSubmit}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="e.g., Grilled Salmon, Caesar Salad" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe the dish, ingredients, preparation method, etc."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select placeholder="Select category">
                  {menu.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="prep_time"
                label="Prep Time (minutes)"
                initialValue={15}
              >
                <InputNumber min={1} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="allergens"
                label="Allergens"
              >
                <Input placeholder="e.g., Nuts, Dairy, Gluten (optional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dietary_info"
                label="Dietary Information"
              >
                <Input placeholder="e.g., Vegetarian, Vegan, Gluten-Free (optional)" />
              </Form.Item>
            </Col>
          </Row>

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
              <Button onClick={() => setItemModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createItemMutation.isLoading || updateItemMutation.isLoading}
              >
                {editingItem ? 'Update' : 'Create'} Menu Item
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MenuManagement;