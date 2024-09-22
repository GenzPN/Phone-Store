import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Space, Radio, Slider, Select, Empty } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;

interface Phone {
  name: string;
  price: string;
  img: string;
}

const BrandPage: React.FC = () => {
  const { brandName: urlBrandName } = useParams<{ brandName: string }>();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const formattedBrandName = urlBrandName ? capitalizeFirstLetter(urlBrandName) : '';

  const filterAndSortPhones = useCallback(() => {
    let filtered = phones;
    
    // Filtering logic
    if (priceFilter !== 'all') {
      filtered = filtered.filter(phone => {
        const price = parseInt(phone.price.replace(/[^\d]/g, ''), 10) / 1000000;
        switch (priceFilter) {
          case 'under5':
            return price < 5;
          case '5to10':
            return price >= 5 && price < 10;
          case '10to20':
            return price >= 10 && price < 20;
          case '20to40':
            return price >= 20 && price < 40;
          case 'over40':
            return price >= 40;
          default:
            return price >= priceRange[0] && price <= priceRange[1];
        }
      });
    } else {
      filtered = filtered.filter(phone => {
        const price = parseInt(phone.price.replace(/[^\d]/g, ''), 10) / 1000000;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Sorting logic
    if (sortOrder) {
      filtered.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[^\d]/g, ''), 10);
        const priceB = parseInt(b.price.replace(/[^\d]/g, ''), 10);
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    setFilteredPhones(filtered);
  }, [phones, priceFilter, priceRange, sortOrder]);

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

  useEffect(() => {
    filterAndSortPhones();
  }, [filterAndSortPhones]);

  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange(value as [number, number]);
      setPriceFilter('custom');
    }
  };

  return (
    <div>
      <Title level={2}>{formattedBrandName}</Title>
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Card title="Bộ lọc">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Khoảng giá</Title>
                <Radio.Group onChange={(e) => setPriceFilter(e.target.value)} value={priceFilter}>
                  <Space direction="vertical">
                    <Radio value="all">Tất cả</Radio>
                    <Radio value="under5">Dưới 5 Triệu</Radio>
                    <Radio value="5to10">Từ 5-10 Triệu</Radio>
                    <Radio value="10to20">Từ 10-20 Triệu</Radio>
                    <Radio value="20to40">Từ 20-40 Triệu</Radio>
                    <Radio value="over40">Trên 40 Triệu</Radio>
                    <Radio value="custom">Tùy chỉnh</Radio>
                  </Space>
                </Radio.Group>
              </div>
              <div>
                <Title level={5}>Tùy chỉnh khoảng giá</Title>
                <Slider
                  range
                  min={0}
                  max={50}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  marks={{
                    0: '0đ',
                    10: '10tr',
                    20: '20tr',
                    30: '30tr',
                    40: '40tr',
                    50: '50tr+'
                  }}
                  disabled={priceFilter !== 'custom'}
                />
              </div>
              <div>
                <Title level={5}>Sắp xếp theo giá</Title>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Chọn cách sắp xếp"
                  onChange={(value: 'asc' | 'desc' | '') => setSortOrder(value)}
                >
                  <Option value="">Mặc định</Option>
                  <Option value="asc">Giá thấp đến cao</Option>
                  <Option value="desc">Giá cao đến thấp</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={18}>
          {filteredPhones.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredPhones.map((phone, index) => (
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
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm
                </span>
              }
            >
              <Button type="primary" onClick={() => {
                setPriceFilter('all');
                setPriceRange([0, 50]);
                setSortOrder('');
              }}>
                Đặt lại bộ lọc
              </Button>
            </Empty>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BrandPage;