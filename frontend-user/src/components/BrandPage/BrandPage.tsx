import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Space, Radio, Slider, Select, Empty, message, Pagination, Spin } from 'antd';
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useCart } from '../../contexts/CartContext';
import api from '../../utils/api';

const { Meta } = Card;
const { Title } = Typography;
const { Option } = Select;

interface Phone {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  brand: string;
}

const formatProductNameForUrl = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

const BrandPage: React.FC = () => {
  const { brandName: urlBrandName } = useParams<{ brandName: string }>();
  const { addToCart } = useCart();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 12; // Số sản phẩm trên mỗi trang

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const formattedBrandName = urlBrandName ? capitalizeFirstLetter(urlBrandName) : '';

  const fetchPhones = useCallback(async () => {
    if (!formattedBrandName) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/products/brand/${formattedBrandName}`, {
        params: {
          page: currentPage,
          limit: pageSize
        }
      });
      const data = response.data;
      if (data && data.products) {
        setPhones(data.products);
        setTotalProducts(data.totalProducts);
      }
    } catch (error) {
      console.error('Error fetching phone data:', error);
      message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [formattedBrandName, currentPage]);

  useEffect(() => {
    fetchPhones();
  }, [fetchPhones]);

  const filterAndSortPhones = useCallback(() => {
    let filtered = [...phones];
    
    // Filtering logic
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
    }

    // Sorting logic
    if (sortOrder) {
      filtered.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      });
    }

    setFilteredPhones(filtered);
  }, [phones, priceFilter, priceRange, sortOrder]);

  useEffect(() => {
    filterAndSortPhones();
  }, [filterAndSortPhones]);

  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setPriceRange(value as [number, number]);
      setPriceFilter('custom');
    }
  };

  const handleAddToCart = (phone: Phone) => {
    addToCart({
      id: phone.id,
      product_id: phone.id,
      quantity: 1,
      title: phone.title,
      price: phone.price,
      thumbnail: phone.thumbnail
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
      <Title level={2}>{formattedBrandName}</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={6} lg={6}>
          <Card title="Bộ lọc">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Giữ nguyên phần bộ lọc */}
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
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
            </div>
          ) : filteredPhones.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {filteredPhones.map((phone) => (
                  <Col key={phone.id} xs={12} sm={8} md={8} lg={6}>
                    <Link to={`/details/${phone.brand.toLowerCase()}/${formatProductNameForUrl(phone.title)}`} style={{ textDecoration: 'none' }}>
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
                              alt={phone.title}
                              src={phone.thumbnail}
                              preview={false}
                              style={{
                                maxWidth: '90%',
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
                            title={<span style={{ fontSize: '14px', fontWeight: 'bold', height: '40px', overflow: 'hidden', display: 'block' }}>{phone.title}</span>} 
                            description={<span style={{ fontSize: '16px', color: '#f5222d', fontWeight: 'bold' }}>{phone.price.toLocaleString()} đ</span>}
                          />
                          <Button 
                            type="primary" 
                            icon={<ShoppingCartOutlined />}
                            style={{ width: '100%', marginTop: '5px' }}
                            onClick={(e) => {
                              e.preventDefault(); // Prevent navigation
                              handleAddToCart(phone);
                            }}
                          >
                            Thêm vào giỏ
                          </Button>
                        </Space>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
              <Pagination
                current={currentPage}
                total={totalProducts}
                pageSize={pageSize}
                onChange={handlePageChange}
                style={{ marginTop: '20px', textAlign: 'center' }}
              />
            </>
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
                fetchPhones(); // Gọi lại API để lấy tất cả sản phẩm
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