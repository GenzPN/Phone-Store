import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Space } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title } = Typography;

interface Phone {
  name: string;
  price: string;
  img: string;
}

const BrandPage: React.FC = () => {
  const { brandName: urlBrandName } = useParams<{ brandName: string }>();
  const [phones, setPhones] = useState<Phone[]>([]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const formattedBrandName = urlBrandName ? capitalizeFirstLetter(urlBrandName) : '';

  useEffect(() => {
    if (!formattedBrandName) return;

    console.log('Fetching data for brand:', formattedBrandName);

    fetch('/phoneData.json')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data);
        if (data && data.phonesByBrand) {
          const brandPhones = data.phonesByBrand[formattedBrandName] || [];
          console.log('Brand phones:', brandPhones);
          setPhones(brandPhones);
        } else {
          console.error('Invalid data structure:', data);
        }
      })
      .catch(error => console.error('Error fetching phone data:', error));
  }, [formattedBrandName]);

  return (
    <div>
      <Title level={2}>{formattedBrandName}</Title>
      <Row gutter={[16, 16]}>
        {phones.map((phone, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '250px',
                  overflow: 'hidden'
                }}>
                  <Image
                    alt={phone.name}
                    src={phone.img}
                    preview={false}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                      objectPosition: 'center'
                    }}
                  />
                </div>
              }
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Meta title={phone.name} description={phone.price} />
                <Button type="primary" icon={<ShoppingCartOutlined />} style={{ width: '100%' }}>
                  Mua ngay
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BrandPage;