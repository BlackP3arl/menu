import React from 'react';
import { Row, Col, Typography } from 'antd';
import MenuItemCard from './MenuItemCard';

const { Title } = Typography;

function MenuItems({ category, restaurantId }) {
  if (!category || !category.menu_items) {
    return null;
  }

  const { menu_items } = category;

  if (menu_items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
          No items available in this category
        </Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 8px' }}>
      <Title level={3} style={{ 
        marginBottom: '20px', 
        color: '#333',
        borderBottom: '2px solid #f0681a',
        paddingBottom: '8px',
        display: 'inline-block'
      }}>
        {category.name}
      </Title>
      
      <Row gutter={[16, 16]}>
        {menu_items.map((item) => (
          <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
            <MenuItemCard 
              item={item} 
              restaurantId={restaurantId}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default MenuItems;