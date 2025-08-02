import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Typography, 
  Radio, 
  Checkbox, 
  InputNumber, 
  Input, 
  Button, 
  Space, 
  Divider,
  Card,
  Row,
  Col
} from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import useCartStore from '../../stores/cartStore';
import { OPTION_GROUPS } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function MenuItemModal({ item, visible, onClose, restaurantId }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0);

  const { addItem } = useCartStore();

  // Group options by type
  const optionGroups = item?.item_options?.reduce((groups, option) => {
    const group = option.option_group;
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(option);
    return groups;
  }, {}) || {};

  // Calculate current price based on selected options
  useEffect(() => {
    if (!item) return;

    let price = parseFloat(item.base_price);
    
    Object.values(selectedOptions).forEach(optionValue => {
      if (Array.isArray(optionValue)) {
        // Multiple selection (checkboxes)
        optionValue.forEach(value => {
          const option = item.item_options.find(opt => opt.option_name === value);
          if (option) {
            price += parseFloat(option.price_modifier || 0);
          }
        });
      } else if (optionValue) {
        // Single selection (radio)
        const option = item.item_options.find(opt => opt.option_name === optionValue);
        if (option) {
          price += parseFloat(option.price_modifier || 0);
        }
      }
    });

    setCurrentPrice(price);
  }, [selectedOptions, item]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedOptions({});
      setQuantity(1);
      setSpecialInstructions('');
      setCurrentPrice(item?.base_price || 0);
    }
  }, [visible, item]);

  const handleOptionChange = (group, value, isMultiple = false) => {
    setSelectedOptions(prev => ({
      ...prev,
      [group]: isMultiple ? value : value
    }));
  };

  const handleAddToCart = () => {
    // Validate required options
    const requiredGroups = Object.entries(optionGroups).filter(([_, options]) => 
      options.some(opt => opt.is_required)
    );

    for (const [group, options] of requiredGroups) {
      if (!selectedOptions[group] || 
          (Array.isArray(selectedOptions[group]) && selectedOptions[group].length === 0)) {
        toast.error(`Please select ${group.toLowerCase()} option`);
        return;
      }
    }

    // Format selected options for storage
    const formattedOptions = [];
    Object.entries(selectedOptions).forEach(([group, values]) => {
      if (Array.isArray(values)) {
        values.forEach(value => {
          const option = item.item_options.find(opt => 
            opt.option_group === group && opt.option_name === value
          );
          if (option) {
            formattedOptions.push({
              option_group: group,
              option_name: value,
              price_modifier: option.price_modifier || 0
            });
          }
        });
      } else if (values) {
        const option = item.item_options.find(opt => 
          opt.option_group === group && opt.option_name === values
        );
        if (option) {
          formattedOptions.push({
            option_group: group,
            option_name: values,
            price_modifier: option.price_modifier || 0
          });
        }
      }
    });

    const cartItem = {
      menu_item_id: item.id,
      menu_item_name: item.name,
      menu_item_image: item.image_url,
      base_price: parseFloat(item.base_price),
      unit_price: currentPrice,
      quantity: quantity,
      selected_options: formattedOptions,
      special_instructions: specialInstructions.trim(),
      total_price: currentPrice * quantity
    };

    addItem(cartItem);
    toast.success(`${item.name} added to cart!`);
    onClose();
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getGroupTitle = (group) => {
    switch (group) {
      case OPTION_GROUPS.SIZE: return 'Size';
      case OPTION_GROUPS.PREPARATION: return 'Preparation';
      case OPTION_GROUPS.ADDONS: return 'Add-ons';
      default: return group.charAt(0).toUpperCase() + group.slice(1);
    }
  };

  if (!item) return null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
    >
      <div>
        {/* Item Image */}
        {item.image_url ? (
          <div style={{ height: '250px', overflow: 'hidden' }}>
            <img
              src={item.image_url}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ) : (
          <div style={{
            height: '250px',
            background: 'linear-gradient(135deg, #f0681a20 0%, #e1500f20 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ fontSize: '72px' }}>🍽️</Text>
          </div>
        )}

        <div style={{ padding: '24px' }}>
          {/* Item Info */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ marginBottom: '8px' }}>
              {item.name}
            </Title>
            
            {item.description && (
              <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                {item.description}
              </Paragraph>
            )}

            <Text strong style={{ fontSize: '24px', color: '#f0681a' }}>
              {formatPrice(currentPrice)}
            </Text>
          </div>

          {/* Options */}
          {Object.entries(optionGroups).map(([group, options]) => {
            const isRequired = options.some(opt => opt.is_required);
            const isMultiple = group === OPTION_GROUPS.ADDONS;

            return (
              <Card 
                key={group} 
                size="small" 
                style={{ marginBottom: '16px' }}
                title={
                  <span>
                    {getGroupTitle(group)}
                    {isRequired && <Text type="danger"> *</Text>}
                  </span>
                }
              >
                {isMultiple ? (
                  <Checkbox.Group
                    value={selectedOptions[group] || []}
                    onChange={(value) => handleOptionChange(group, value, true)}
                  >
                    <Row gutter={[8, 8]}>
                      {options.map((option) => (
                        <Col span={24} key={option.id}>
                          <Checkbox 
                            value={option.option_name}
                            style={{ width: '100%' }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              width: '100%'
                            }}>
                              <span>{option.option_name}</span>
                              {option.price_modifier > 0 && (
                                <Text type="secondary">
                                  +{formatPrice(option.price_modifier)}
                                </Text>
                              )}
                            </div>
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                ) : (
                  <Radio.Group
                    value={selectedOptions[group]}
                    onChange={(e) => handleOptionChange(group, e.target.value)}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {options.map((option) => (
                        <Radio 
                          key={option.id} 
                          value={option.option_name}
                          style={{ width: '100%' }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            width: '100%'
                          }}>
                            <span>{option.option_name}</span>
                            {option.price_modifier !== 0 && (
                              <Text type="secondary">
                                {option.price_modifier > 0 ? '+' : ''}
                                {formatPrice(option.price_modifier)}
                              </Text>
                            )}
                          </div>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}
              </Card>
            );
          })}

          {/* Special Instructions */}
          <div style={{ marginBottom: '24px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Special Instructions (Optional)
            </Text>
            <TextArea
              rows={3}
              placeholder="Any special requests or dietary requirements..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              maxLength={200}
              showCount
            />
          </div>

          {/* Quantity and Add to Cart */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Text strong>Quantity:</Text>
              <Button
                icon={<MinusOutlined />}
                size="small"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              />
              <InputNumber
                min={1}
                max={10}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                style={{ width: '60px', textAlign: 'center' }}
              />
              <Button
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                disabled={quantity >= 10}
              />
            </div>

            <Button
              type="primary"
              size="large"
              onClick={handleAddToCart}
              style={{ 
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '16px',
                height: '48px',
                paddingLeft: '32px',
                paddingRight: '32px'
              }}
            >
              Add {quantity} to Cart • {formatPrice(currentPrice * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MenuItemModal;