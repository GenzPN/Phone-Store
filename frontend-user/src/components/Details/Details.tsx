import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Spin, message, Rate, Descriptions, Collapse, Empty, Modal, Tabs } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import { useCart } from '../../contexts/CartContext';
import './Details.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  user: string;
}

interface ProductDetail {
  category: string;
  items: Array<{ label: string; value: string }>;
}

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  discount_percentage: number;
  images: string[];
  category: string;
  sku: string;
  description: string;
  warranty_information: string;
  shipping_information: string;
  availability_status: string;
  return_policy: string;
  details: ProductDetail[];
  reviews: ProductReview[];
  stock: number;
}

const Details: React.FC = () => {
  const { brand, title } = useParams<{ brand: string; title: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetail[] | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const { addToCart } = useCart();

  const encodedBrand = encodeURIComponent(brand || '').replace(/%20/g, '+');
  const encodedTitle = encodeURIComponent(title || '').replace(/%20/g, '+');

  const averageRating = useMemo(() => {
    if (!productReviews || productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / productReviews.length).toFixed(1);
  }, [productReviews]);

  const fetchProductData = useCallback(async () => {
    try {
      console.log('Fetching product data for:', { brand, title });
      const response = await api.get(`/api/products/${encodedBrand}/${encodedTitle}`);
      console.log('API response:', response.data);
      if (response.data) {
        setProduct(response.data);
        setMainImage(response.data.images[0]);
        setProductDetails(response.data.details || []);
        setProductReviews(response.data.reviews || []);
      } else {
        throw new Error('Product not found');
      }
    } catch (error: any) {
      console.error('Error fetching product data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        message.error(`Không thể tải thông tin sản phẩm: ${error.response.data.message}`);
      } else {
        message.error('Không thể tải thông tin sản phẩm: Lỗi kết nối');
      }
    } finally {
      setLoading(false);
    }
  }, [brand, title, encodedBrand, encodedTitle]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        product_id: product.id,
        quantity: 1,
        title: product.title,
        price: product.price,
        thumbnail: product.images[0]
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng');
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <Text>Không tìm thấy sản phẩm</Text>;
  }

  const discountedPrice = product.price * (1 - (product.discount_percentage || 0) / 100);

  const showReviewModal = () => {
    setIsReviewModalVisible(true);
  };

  const handleReviewModalCancel = () => {
    setIsReviewModalVisible(false);
    setSelectedRating(0);
  };

  const filteredReviews = selectedRating === 0
    ? productReviews
    : productReviews.filter(review => review.rating === selectedRating);

  const visibleReviews = productReviews.slice(0, 4);

  const renderReviewCards = (reviews: ProductReview[]) => (
    reviews.map((review) => (
      <Card key={review.id} style={{ marginBottom: 16 }}>
        <Rate disabled defaultValue={review.rating} />
        <Paragraph>{review.comment}</Paragraph>
        <Text type="secondary">Bởi {review.user}</Text>
      </Card>
    ))
  );

  return (
    <div className="details-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={10} lg={10}>
          <div className="image-gallery" style={{ border: '1px solid #d9d9d9', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="main-image-container" style={{ width: '90%', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              {mainImage ? (
                <Image
                   src={mainImage}
                   alt={product?.title || 'Product image'}
                   className="main-image"
                   preview={{
                     mask: 'Click để xem ảnh lớn',
                   }}
                   style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: 'auto' }}
                 />
               ) : (
                 <Empty description="No image available" />
               )}
            </div>
            <div className="thumbnail-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-wrapper ${image === mainImage ? 'active' : ''}`}
                    onClick={() => setMainImage(image)}
                    style={{ 
                      margin: '4px', 
                      cursor: 'pointer', 
                      opacity: image === mainImage ? 1 : 0.6,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - view ${index + 1}`}
                      preview={false}
                      className="thumbnail-image"
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                ))
              ) : (
                <Empty description="Không có hình ảnh" />
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} sm={24} md={14} lg={14}>
          <Card>
            <Title level={2}>{product.title || 'Không có tiêu đề'}</Title>
            <Text type="secondary">{product.brand || 'Không có thương hiệu'}</Text>
            <Title level={3} type="danger">
              {discountedPrice.toLocaleString()}₫
              {(product.discount_percentage || 0) > 0 && (
                <Text delete type="secondary" style={{ marginLeft: 8 }}>
                  {product.price.toLocaleString()}₫
                </Text>
              )}
            </Title>
            {(product.discount_percentage || 0) > 0 && (
              <Text>Giảm giá: {product.discount_percentage}%</Text>
            )}
            <br />
            {productReviews && productReviews.length > 0 ? (
              <>
                <Rate disabled allowHalf value={Number(averageRating)} /> 
                <Text>({averageRating}) - {productReviews.length} đánh giá</Text>
              </>
            ) : (
              <Text>Chưa có đánh giá</Text>
            )}
            <Paragraph style={{ marginTop: 16 }}>{product.description}</Paragraph>
            <Descriptions column={1}>
              <Descriptions.Item label="Danh mục">{product.category}</Descriptions.Item>
              <Descriptions.Item label="Mã SKU">{product.sku}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng">{product.availability_status}</Descriptions.Item>
              <Descriptions.Item label="Số lượng còn lại">{product.stock}</Descriptions.Item>
            </Descriptions>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              onClick={handleAddToCart}
              style={{ marginTop: 16 }}
            >
              Thêm vào giỏ hàng
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Descriptions title="Chi tiết sản phẩm" bordered>
              <Descriptions.Item label="Bảo hành" span={3}>{product.warranty_information}</Descriptions.Item>
              <Descriptions.Item label="Giao hàng" span={3}>{product.shipping_information}</Descriptions.Item>
              <Descriptions.Item label="Trả hàng" span={3}>{product.return_policy}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Title level={3}>Thông số kỹ thuật</Title>
            {productDetails && productDetails.length > 0 ? (
              <Collapse defaultActiveKey={['0']}>
                {productDetails.map((category, index) => (
                  <Panel header={category.category} key={index}>
                    <Descriptions column={1} bordered>
                      {category.items.map((item, itemIndex) => (
                        <Descriptions.Item key={itemIndex} label={item.label}>
                          {item.value || 'Không có thông tin'}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <Empty description="Không có thông tin thông số kỹ thuật" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card>
            <Title level={3}>Đánh giá sản phẩm</Title>
            {productReviews && productReviews.length > 0 ? (
              <>
                {renderReviewCards(visibleReviews)}
                {productReviews.length > 5 && (
                  <Button 
                    onClick={showReviewModal}
                    style={{ marginTop: 16 }}
                  >
                    Xem tất cả đánh giá
                  </Button>
                )}
              </>
            ) : (
              <Empty description="Chưa có đánh giá nào cho sản phẩm này" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Tất cả đánh giá"
        visible={isReviewModalVisible}
        onCancel={handleReviewModalCancel}
        footer={null}
        width={800}
      >
        <Tabs defaultActiveKey="0" onChange={(key) => setSelectedRating(Number(key))}>
          <TabPane tab="Tất cả" key="0">
            {renderReviewCards(filteredReviews)}
          </TabPane>
          {[5, 4, 3, 2, 1].map(rating => (
            <TabPane tab={`${rating} sao`} key={rating}>
              {renderReviewCards(filteredReviews)}
            </TabPane>
          ))}
        </Tabs>
      </Modal>
    </div>
  );
};

export default Details;