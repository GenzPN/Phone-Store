import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Spin, message, Rate, Descriptions, Collapse, Empty } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { unformatProductNameFromUrl } from '../../utils/stringUtils';
import './Details.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const Details = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  const averageRating = useMemo(() => {
    if (!productReviews || productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  }, [productReviews]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [productResponse, detailsResponse, reviewsResponse] = await Promise.all([
          fetch('/phoneDetails.json'),
          fetch('/productDetails.json'),
          fetch('/productReviews.json')
        ]);

        if (!productResponse.ok || !detailsResponse.ok || !reviewsResponse.ok) {
          throw new Error('Failed to fetch product data');
        }

        const productData = await productResponse.json();
        const detailsData = await detailsResponse.json();
        const reviewsData = await reviewsResponse.json();

        const unformattedProductName = unformatProductNameFromUrl(productName || '');
        const foundProduct = productData.products.find((p) => p.title.toLowerCase() === unformattedProductName.toLowerCase());

        if (foundProduct) {
          setProduct(foundProduct);
          setMainImage(foundProduct.images[0]);
          setProductDetails(detailsData[foundProduct.title]);
          setProductReviews(reviewsData[foundProduct.title]);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        message.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productName]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!product) {
    return <Text>Product not found</Text>;
  }

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <div className="details-container">
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <div className="image-gallery">
            <div className="main-image-container">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  className="main-image"
                  preview={{
                    mask: 'Click để xem ảnh lớn',
                  }}
                />
              ) : (
                <Empty description="No image available" />
              )}
            </div>
            <div className="thumbnail-container">
              {product.images && product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail-wrapper ${image === mainImage ? 'active' : ''}`}
                    onClick={() => setMainImage(image)}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - view ${index + 1}`}
                      preview={false}
                      className="thumbnail-image"
                    />
                  </div>
                ))
              ) : (
                <Empty description="No thumbnails available" />
              )}
            </div>
          </div>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={2}>{product.title}</Title>
            <Text type="secondary">{product.brand}</Text>
            <Title level={3} type="danger">
              {discountedPrice.toLocaleString()}₫
              {product.discountPercentage > 0 && (
                <Text delete type="secondary" style={{ marginLeft: 8 }}>
                  {product.price.toLocaleString()}₫
                </Text>
              )}
            </Title>
            {product.discountPercentage > 0 && (
              <Text>Giảm giá: {product.discountPercentage}%</Text>
            )}
            <br />
            {productReviews && productReviews.length > 0 ? (
              <>
                <Rate disabled allowHalf value={parseFloat(averageRating)} /> 
                <Text>({averageRating}) - {productReviews.length} đánh giá</Text>
              </>
            ) : (
              <Text>Chưa có đánh giá</Text>
            )}
            <br />
            <Text>Danh mục: {product.category}</Text>
            <br />
            <Text>Mã SKU: {product.sku}</Text>
            <br />
            <Paragraph>{product.description}</Paragraph>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
            >
              Thêm vào giỏ hàng
            </Button>
          </Card>
          <Card style={{ marginTop: 16 }}>
            <Descriptions title="Chi tiết sản phẩm" bordered column={1}>
              <Descriptions.Item label="Bảo hành">{product.warrantyInformation}</Descriptions.Item>
              <Descriptions.Item label="Giao hàng">{product.shippingInformation}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng">{product.availabilityStatus}</Descriptions.Item>
              <Descriptions.Item label="Trả hàng">{product.returnPolicy}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Product Details */}
      <Card style={{ marginTop: 24 }}>
        <Title level={3}>Thông số kỹ thuật</Title>
        {productDetails && productDetails.length > 0 ? (
          <Collapse defaultActiveKey={['0']}>
            {productDetails.map((category, index) => (
              <Panel header={category.category} key={index}>
                <Descriptions column={1} bordered>
                  {category.items.map((item, itemIndex) => (
                    <Descriptions.Item key={itemIndex} label={item.label}>
                      {item.value}
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

      {/* Product Reviews */}
      <Card style={{ marginTop: 24 }}>
        <Title level={3}>Đánh giá sản phẩm</Title>
        {productReviews && productReviews.length > 0 ? (
          productReviews.map((review) => (
            <Card key={review.id} style={{ marginBottom: 16 }}>
              <Rate disabled defaultValue={review.rating} />
              <Paragraph>{review.comment}</Paragraph>
              <Text type="secondary">Bởi {review.user}</Text>
            </Card>
          ))
        ) : (
          <Empty description="Chưa có đánh giá nào cho sản phẩm này" />
        )}
      </Card>
    </div>
  );
};

export default Details;
