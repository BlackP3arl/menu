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
  Divider,
  Radio,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MenuOutlined,
  AppstoreOutlined,
  SettingOutlined,
  LinkOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { menuApi, categoryApi, itemOptionsApi } from '../../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function MenuManagement({ restaurantId }) {
  const [activeTab, setActiveTab] = useState('categories');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [imageUploadType, setImageUploadType] = useState('upload'); // 'upload' or 'url'
  const [imageFileList, setImageFileList] = useState([]);
  
  const [categoryForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [optionForm] = Form.useForm();
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

  // Fetch item options for the restaurant
  const { data: itemOptions = [], isLoading: optionsLoading, refetch: refetchOptions } = useQuery(
    ['item-options', restaurantId],
    () => itemOptionsApi.getByRestaurant(restaurantId),
    { enabled: !!restaurantId }
  );

  // Option mutations
  const createOptionMutation = useMutation(
    (optionData) => itemOptionsApi.create(optionData),
    {
      onSuccess: () => {
        message.success('Menu option created successfully');
        setOptionModalVisible(false);
        optionForm.resetFields();
        refetchOptions();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to create menu option';
        message.error(`Failed to create menu option: ${errorMessage}`);
        console.error('Create option error:', error);
      }
    }
  );

  const updateOptionMutation = useMutation(
    ({ id, data }) => itemOptionsApi.update(id, data),
    {
      onSuccess: () => {
        message.success('Menu option updated successfully');
        setOptionModalVisible(false);
        setEditingOption(null);
        optionForm.resetFields();
        refetchOptions();
      },
      onError: (error) => {
        const errorMessage = error?.message || 'Failed to update menu option';
        message.error(`Failed to update menu option: ${errorMessage}`);
        console.error('Update option error:', error);
      }
    }
  );

  const deleteOptionMutation = useMutation(
    (id) => itemOptionsApi.delete(id),
    {
      onSuccess: () => {
        message.success('Menu option deleted successfully');
        refetchOptions();
      },
      onError: (error) => {
        message.error('Failed to delete menu option');
        console.error('Delete option error:', error);
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
    setImageUploadType('upload');
    setImageFileList([]);
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
      dietary_info: item.dietary_info,
      image_url: item.image_url
    });
    
    // Set image upload type and file list based on existing image
    if (item.image_url) {
      setImageUploadType('url');
      setImageFileList([]);
    } else {
      setImageUploadType('upload');
      setImageFileList([]);
    }
    
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

  const handleImageUpload = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    
    return false; // Prevent auto upload, we'll handle it manually
  };

  const handleFileChange = async ({ fileList: newFileList }) => {
    console.log('File change:', newFileList);
    setImageFileList(newFileList);
    
    // If a file is added, convert it to base64 for preview and storage
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      console.log('Processing file:', file.name, 'Size:', file.size);
      try {
        const base64 = await handleImageUpload(file);
        console.log('Generated base64 length:', base64.length);
        console.log('Base64 preview:', base64.substring(0, 100));
        itemForm.setFieldsValue({ image_url: base64 });
        console.log('Form field set, current value:', itemForm.getFieldValue('image_url')?.substring(0, 50));
      } catch (error) {
        console.error('Image processing error:', error);
        message.error('Failed to process image');
      }
    } else {
      // If file is removed, clear the form field
      console.log('File removed, clearing form field');
      itemForm.setFieldsValue({ image_url: null });
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
      
      // Handle image based on upload type
      let imageUrl = null;
      if (imageUploadType === 'url' && values.image_url) {
        imageUrl = values.image_url;
        console.log('Using URL image:', imageUrl);
      } else if (imageUploadType === 'upload') {
        // For uploaded files, use the base64 data from the form field
        imageUrl = values.image_url;
        console.log('Using uploaded image (base64):', imageUrl ? `${imageUrl.substring(0, 50)}...` : 'null');
      }
      
      console.log('Image upload type:', imageUploadType);
      console.log('File list length:', imageFileList.length);
      console.log('Form image_url value:', values.image_url ? `${values.image_url.substring(0, 50)}...` : 'null');
      
      // Map form values to database fields
      const mappedValues = {
        ...values,
        base_price: values.price, // Map price to base_price
        image_url: imageUrl
      };
      
      // Remove the form fields that don't exist in database
      delete mappedValues.price;
      
      console.log('Final mapped values for database:', {
        ...mappedValues,
        image_url: mappedValues.image_url ? `${mappedValues.image_url.substring(0, 50)}...` : 'null'
      });
      
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

  // Option event handlers
  const handleCreateOption = () => {
    setEditingOption(null);
    optionForm.resetFields();
    optionForm.setFieldsValue({ menu_item_id: selectedMenuItem });
    setOptionModalVisible(true);
  };

  const handleEditOption = (option) => {
    console.log('Editing option:', option);
    setEditingOption(option);
    optionForm.setFieldsValue({
      menu_item_id: option.menu_item_id,
      option_group: option.option_group,
      option_name: option.option_name,
      price_modifier: option.price_modifier,
      is_required: option.is_required,
      display_order: option.display_order,
      is_active: option.is_active
    });
    setOptionModalVisible(true);
  };

  const handleOptionSubmit = async (values) => {
    try {
      console.log('Option form values submitted:', values);
      console.log('Editing option:', editingOption);
      
      // Validate menu item selection
      if (!values.menu_item_id) {
        message.error('Please select a menu item for the option');
        return;
      }
      
      if (editingOption) {
        console.log('Updating option with ID:', editingOption.id);
        await updateOptionMutation.mutateAsync({
          id: editingOption.id,
          data: values
        });
      } else {
        console.log('Creating new option');
        await createOptionMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error('Option submit error:', error);
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
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (imageUrl) => (
        imageUrl ? (
          <Image
            width={60}
            height={60}
            src={imageUrl}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN" />
        ) : (
          <div style={{ 
            width: 60, 
            height: 60, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 4, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CameraOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />
          </div>
        )
      )
    },
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

  // Table columns for item options
  const optionColumns = [
    {
      title: 'Menu Item',
      key: 'menu_item',
      render: (_, record) => (
        <div>
          <Text strong>{record.menu_items?.name}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {menu.find(cat => cat.id === record.menu_items?.category_id)?.name}
            </Text>
          </div>
        </div>
      ),
      sorter: (a, b) => a.menu_items?.name.localeCompare(b.menu_items?.name)
    },
    {
      title: 'Option Group',
      dataIndex: 'option_group',
      key: 'option_group',
      render: (group) => (
        <Tag color={
          group === 'size' ? 'blue' : 
          group === 'preparation' ? 'green' : 
          group === 'addons' ? 'orange' : 'default'
        }>
          {group?.charAt(0).toUpperCase() + group?.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Size', value: 'size' },
        { text: 'Preparation', value: 'preparation' },
        { text: 'Add-ons', value: 'addons' }
      ],
      onFilter: (value, record) => record.option_group === value
    },
    {
      title: 'Option Name',
      dataIndex: 'option_name',
      key: 'option_name',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Price Modifier',
      dataIndex: 'price_modifier',
      key: 'price_modifier',
      render: (price) => {
        const amount = parseFloat(price || 0);
        return (
          <Text style={{ color: amount > 0 ? '#52c41a' : amount < 0 ? '#ff4d4f' : '#666' }}>
            {amount === 0 ? 'Free' : (amount > 0 ? '+' : '') + formatPrice(amount)}
          </Text>
        );
      }
    },
    {
      title: 'Required',
      dataIndex: 'is_required',
      key: 'is_required',
      render: (required) => (
        <Tag color={required ? 'red' : 'default'}>
          {required ? 'Required' : 'Optional'}
        </Tag>
      )
    },
    {
      title: 'Order',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 80,
      sorter: (a, b) => a.display_order - b.display_order
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
            onClick={() => handleEditOption(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Option"
            description="Are you sure you want to delete this menu option?"
            onConfirm={() => deleteOptionMutation.mutate(record.id)}
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

  // Filter options by selected menu item
  const filteredOptions = selectedMenuItem 
    ? itemOptions.filter(option => option.menu_item_id === selectedMenuItem)
    : itemOptions;

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
          },
          {
            key: 'options',
            label: (
              <span>
                <SettingOutlined />
                Menu Options ({itemOptions.length})
              </span>
            ),
            children: (
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <Card>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <Text strong>Filter by Menu Item:</Text>
                        <Select
                          value={selectedMenuItem}
                          onChange={setSelectedMenuItem}
                          placeholder="All Menu Items"
                          style={{ width: 250 }}
                          allowClear
                          showSearch
                          optionFilterProp="children"
                        >
                          {allItems.map(item => (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      </Space>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateOption}
                      >
                        Add Menu Option
                      </Button>
                    </Space>
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Menu Item Options">
                    <Table
                      columns={optionColumns}
                      dataSource={filteredOptions}
                      rowKey="id"
                      loading={optionsLoading}
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
          setImageUploadType('upload');
          setImageFileList([]);
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

          {/* Image Upload Section */}
          <Divider>Menu Item Image</Divider>
          
          <Form.Item label="Image Upload Method">
            <Radio.Group
              value={imageUploadType}
              onChange={(e) => {
                setImageUploadType(e.target.value);
                setImageFileList([]);
                // Don't clear image_url when switching to upload mode - let user keep existing data
                // Only clear when switching to URL mode if there's no existing URL
                if (e.target.value === 'url' && !itemForm.getFieldValue('image_url')?.startsWith('http')) {
                  itemForm.setFieldsValue({ image_url: '' });
                }
              }}
            >
              <Radio value="upload">
                <UploadOutlined /> Upload from Device
              </Radio>
              <Radio value="url">
                <LinkOutlined /> Image URL
              </Radio>
            </Radio.Group>
          </Form.Item>

          {imageUploadType === 'upload' ? (
            <>
              {/* Hidden form field to store uploaded image data */}
              <Form.Item name="image_url" style={{ display: 'none' }}>
                <Input />
              </Form.Item>
              <Form.Item
                label="Upload Image"
                help="Upload an image for the menu item (max 5MB, JPG/PNG/GIF)"
              >
                <Upload
                  listType="picture-card"
                  fileList={imageFileList}
                  beforeUpload={beforeUpload}
                  onChange={handleFileChange}
                  accept="image/*"
                  maxCount={1}
                >
                  {imageFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Image</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="image_url"
              label="Image URL"
              help="Enter a URL for the menu item image"
              rules={[
                {
                  type: 'url',
                  message: 'Please enter a valid URL'
                }
              ]}
            >
              <Input
                placeholder="https://example.com/image.jpg"
                prefix={<LinkOutlined />}
              />
            </Form.Item>
          )}

          {/* Preview of current image */}
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.image_url !== currentValues.image_url
            }
          >
            {({ getFieldValue }) => {
              const imageUrl = getFieldValue('image_url');
              return imageUrl ? (
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Preview:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Image
                      width={120}
                      height={120}
                      src={imageUrl}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  </div>
                </div>
              ) : null;
            }}
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
              <Button onClick={() => {
                setItemModalVisible(false);
                setEditingItem(null);
                itemForm.resetFields();
                setImageUploadType('upload');
                setImageFileList([]);
              }}>
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

      {/* Menu Option Modal */}
      <Modal
        title={editingOption ? 'Edit Menu Option' : 'Add Menu Option'}
        open={optionModalVisible}
        onCancel={() => {
          setOptionModalVisible(false);
          setEditingOption(null);
          optionForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={optionForm}
          layout="vertical"
          onFinish={handleOptionSubmit}
        >
          <Form.Item
            name="menu_item_id"
            label="Menu Item"
            rules={[{ required: true, message: 'Please select a menu item' }]}
          >
            <Select 
              placeholder="Select menu item"
              showSearch
              optionFilterProp="children"
            >
              {allItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.name} - {menu.find(cat => cat.id === item.category_id)?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="option_group"
                label="Option Group"
                rules={[{ required: true, message: 'Please select option group' }]}
              >
                <Select placeholder="Select option group">
                  <Option value="size">Size</Option>
                  <Option value="preparation">Preparation</Option>
                  <Option value="addons">Add-ons</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="option_name"
                label="Option Name"
                rules={[{ required: true, message: 'Please enter option name' }]}
              >
                <Input placeholder="e.g., Large, Extra Spicy, Add Cheese" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price_modifier"
                label="Price Modifier ($)"
                initialValue={0}
                rules={[{ required: true, message: 'Please enter price modifier' }]}
              >
                <InputNumber
                  step={0.25}
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Display Order"
                initialValue={1}
                rules={[{ required: true, message: 'Please enter display order' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="is_required"
                label="Required"
                initialValue={false}
              >
                <Select>
                  <Option value={false}>Optional</Option>
                  <Option value={true}>Required</Option>
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

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setOptionModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createOptionMutation.isLoading || updateOptionMutation.isLoading}
              >
                {editingOption ? 'Update' : 'Create'} Option
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MenuManagement;