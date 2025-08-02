import React from 'react';
import { Typography, Space, Tag } from 'antd';
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function RestaurantHeader({ restaurant, tableNumber }) {
  if (!restaurant) return null;

  const { contact_info } = restaurant;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0681a 0%, #e1500f 100%)',
      color: 'white',
      padding: '20px 0',
      textAlign: 'center'
    }}>
      <div className="restaurant-container">
        {restaurant.logo_url && (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              marginBottom: '12px',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          />
        )}
        
        <Title level={2} style={{ color: 'white', margin: '8px 0' }}>
          {restaurant.name}
        </Title>
        
        {restaurant.description && (
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
            {restaurant.description}
          </Text>
        )}

        <div style={{ marginTop: '16px' }}>
          <Tag color="rgba(255,255,255,0.2)" style={{ 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.3)',
            fontSize: '16px',
            padding: '4px 12px',
            borderRadius: '20px'
          }}>
            Table {tableNumber}
          </Tag>
        </div>

        {contact_info && (contact_info.address || contact_info.phone) && (
          <Space 
            direction="vertical" 
            size="small" 
            style={{ marginTop: '12px', opacity: 0.9 }}
          >
            {contact_info.address && (
              <Space>
                <EnvironmentOutlined />
                <Text style={{ color: 'white', fontSize: '14px' }}>
                  {contact_info.address}
                </Text>
              </Space>
            )}
            {contact_info.phone && (
              <Space>
                <PhoneOutlined />
                <Text style={{ color: 'white', fontSize: '14px' }}>
                  {contact_info.phone}
                </Text>
              </Space>
            )}
          </Space>
        )}
      </div>
    </div>
  );
}

export default RestaurantHeader;