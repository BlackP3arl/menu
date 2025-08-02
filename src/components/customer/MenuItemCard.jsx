import React, { useState } from 'react';
import { Card, Typography, Button, Tag, Modal } from 'antd';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import MenuItemModal from './MenuItemModal';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

function MenuItemCard({ item, restaurantId }) {
  const [modalVisible, setModalVisible] = useState(false);

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const hasOptions = item.item_options && item.item_options.length > 0;

  return (
    <>
      <Card
        hoverable
        style={{ 
          borderRadius: '12px',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{ 
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
        cover={
          item.image_url ? (
            <div style={{ 
              height: '200px', 
              overflow: 'hidden',
              background: '#f5f5f5'
            }}>
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div style={{
              height: '200px',
              background: 'linear-gradient(135deg, #f0681a20 0%, #e1500f20 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: '48px' }}>
                🍽️
              </Text>
            </div>
          )
        }
        actions={[
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            style={{ 
              width: '90%',
              borderRadius: '8px',
              fontWeight: '500'
            }}
          >
            Add to Order
          </Button>
        ]}
      >
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            <Text strong style={{ fontSize: '16px', color: '#333' }}>
              {item.name}
            </Text>
            {item.prep_time && (
              <div style={{ marginTop: '4px' }}>
                <Tag 
                  icon={<ClockCircleOutlined />} 
                  color="blue" 
                  size="small"
                  style={{ fontSize: '11px' }}
                >
                  {item.prep_time} min
                </Tag>
              </div>
            )}
          </div>

          {item.description && (
            <Paragraph 
              ellipsis={{ rows: 2 }}
              style={{ 
                fontSize: '13px', 
                color: '#666',
                marginBottom: '12px',
                lineHeight: '1.4'
              }}
            >
              {item.description}
            </Paragraph>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <Text strong style={{ 
              fontSize: '18px', 
              color: '#f0681a'
            }}>
              {formatPrice(item.base_price)}
              {hasOptions && (
                <Text style={{ fontSize: '12px', color: '#999' }}>
                  {' '}+
                </Text>
              )}
            </Text>
            
            {hasOptions && (
              <Tag color="orange" size="small">
                Customizable
              </Tag>
            )}
          </div>
        </div>
      </Card>

      <MenuItemModal
        item={item}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        restaurantId={restaurantId}
      />
    </>
  );
}

export default MenuItemCard;