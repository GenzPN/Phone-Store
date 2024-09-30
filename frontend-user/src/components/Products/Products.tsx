import React, { useState, useEffect, useCallback } from 'react';
import { Card, Col, Row, Typography, Button, Image, Space, Radio, Slider, Select, Empty, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../../../contexts/CartContext';

const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;

interface Phone {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  brand: string;
}

const Products: React.FC = () => {
  const { cartItems, setCartItems } = useCart();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const filterAndSortPhones = useCallback(() => {
    let filtered = phones;
    
    // Brand filtering
    if (brandFilter.length > 0) {
      filtered = filtered.filter(phone => brandFilter.includes(phone.brand));
    }

    // Price filtering
    if (priceFilter !== 'all') {
      filtered = filtered.filter(phone => {
        const price = phone.price / 1000000;
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
        const price = phone.price / 1000000;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Sorting
    if (sortOrder) {
      filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
    }

    setFilteredPhones(filtered);
  }, [phones, brandFilter, priceFilter, priceRange, sortOrder]);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => {
        console.log('Raw data from API:', data);
        if (data && data.products && Array.isArray(data.products)) {
          const allPhones: Phone[] = data.products.map((product: any) => ({
            id: product.id,
            name: product.title,
            price: parseFloat(product.price.replace(/[^\d]/g, '')),
            thumbnail: product.thumbnail || '', // Sử dụng trường thumbnail
            brand: product.brand
          }));
          console.log('Processed phones:', allPhones);
          setPhones(allPhones);
          setFilteredPhones(allPhones);
          
          // Extract unique brands
          const brandsSet = new Set(allPhones.map(phone => phone.brand));
          const brands = Array.from(brandsSet) as string[];
          console.log('Available brands:', brands);
          setAvailableBrands(brands);
        } else {
          console.error('Invalid data structure:', data);
          setPhones([]);
          setFilteredPhones([]);
        }
      })
      .catch(error => {
        console.error('Error fetching phone data:', error);
        setPhones([]);
        setFilteredPhones([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    filterAndSortPhones();
  }, [filterAndSortPhones]);

  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange(value as [number, number]);
      setPriceFilter('custom');
    }
  };

  const handleBrandFilterChange = (checkedValues: string[]) => {
    setBrandFilter(checkedValues);
  };

  const addToCart = (phone: Phone) => {
    const existingItem = cartItems.find(item => item.id === phone.id);
    let updatedCart;
    if (existingItem) {
      updatedCart = cartItems.map(item =>
        item.id === phone.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { ...phone, quantity: 1 }];
    }
    setCartItems(updatedCart);

    // Lưu đơn hàng vào cookie
    fetch('http://localhost:5000/api/cookie/save-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCart),
      credentials: 'include', // Quan trọng để gửi và nhận cookies
    })
      .then(response => response.json())
      .then(data => console.log(data.message))
      .catch(error => console.error('Error saving order to cookie:', error));

    message.success(`Đã thêm ${phone.name} vào giỏ hàng`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
      <Title level={2}>Tất cả sản phẩm</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={6} lg={6}>
          <Card title="Bộ lọc">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Thương hiệu</Title>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Chọn thương hiệu"
                  onChange={handleBrandFilterChange}
                >
                  {availableBrands.map(brand => (
                    <Option key={brand} value={brand}>{brand}</Option>
                  ))}
                </Select>
              </div>
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
              {priceFilter === 'custom' && (
                <div>
                  <Slider
                    range
                    min={0}
                    max={50}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    marks={{
                      0: '0',
                      10: '10tr',
                      20: '20tr',
                      30: '30tr',
                      40: '40tr',
                      50: '50tr+'
                    }}
                  />
                </div>
              )}
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
        <Col xs={24} sm={24} md={18} lg={18}>
          {loading ? (
            <div>Loading...</div>
          ) : filteredPhones.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredPhones.map((phone, index) => (
                <Col key={index} xs={12} sm={8} md={8} lg={6}>
                  <Card
                    hoverable
                    cover={
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                        padding: '10px'
                      }}>
                        <Image
                          alt={phone.name}
                          src={phone.thumbnail}
                          preview={false}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            width: 'auto',
                            height: 'auto'
                          }}
                        />
                      </div>
                    }
                    bodyStyle={{ padding: '10px' }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Meta 
                        title={<span style={{ fontSize: '14px', fontWeight: 'bold', height: '40px', overflow: 'hidden', display: 'block' }}>{phone.name}</span>} 
                        description={<span style={{ fontSize: '16px', color: '#f5222d', fontWeight: 'bold' }}>{phone.price.toLocaleString()} đ</span>}
                      />
                      <Button 
                        type="primary" 
                        style={{ 
                          width: '100%', 
                          marginTop: '5px',
                        }} 
                        onClick={() => addToCart(phone)}
                      >
                        Thêm vào giỏ
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
                setBrandFilter([]);
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

export default Products;
