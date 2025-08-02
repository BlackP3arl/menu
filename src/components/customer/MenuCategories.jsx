import React from 'react';
import { Card, Row, Col } from 'antd';

function MenuCategories({ categories, selectedCategory, onSelectCategory }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '24px', padding: '0 8px' }}>
      <Row gutter={[12, 12]}>
        {categories.map((category) => (
          <Col key={category.id} xs={12} sm={8} md={6} lg={4}>
            <Card
              hoverable
              size="small"
              style={{
                background: selectedCategory === category.id ? '#f0681a' : 'white',
                color: selectedCategory === category.id ? 'white' : '#333',
                border: selectedCategory === category.id ? '1px solid #f0681a' : '1px solid #d9d9d9',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ 
                padding: '12px 8px',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => onSelectCategory(category.id)}
            >
              <div>
                <div style={{ 
                  fontWeight: '500',
                  fontSize: selectedCategory === category.id ? '15px' : '14px',
                  lineHeight: '1.2'
                }}>
                  {category.name}
                </div>
                {category.description && (
                  <div style={{ 
                    fontSize: '11px',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    {category.description}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default MenuCategories;