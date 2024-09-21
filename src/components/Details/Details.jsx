import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Col, Row, Typography, Button, Image, Spin, message, Rate, Descriptions, Tag } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { unformatProductNameFromUrl } from '../../utils/stringUtils';
import './Details.css';

const { Title, Text, Paragraph } = Typography;

const Details = () => {
  const { productName } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/phoneDetails.json');
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        const data = await response.json();
        const unformattedProductName = unformatProductNameFromUrl(productName || '');
        const foundProduct = data.products.find((p) => p.title.toLowerCase() === unformattedProductName.toLowerCase());
        if (foundProduct) {
          setProduct(foundProduct);
          setMainImage(foundProduct.images[0]);
        } else {
          throw new Error('Product not found');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        message.error('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
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
          <Image
            src={mainImage}
            alt={product.title}
            className="main-image"
          />
          <Row gutter={[8, 8]} className="thumbnail-container">
            {product.images.map((image, index) => (
              <Col span={6} key={index}>
                <Image
                  src={image}
                  alt={`${product.title} - view ${index + 1}`}
                  onClick={() => setMainImage(image)}
                  preview={false}
                />
              </Col>
            ))}
          </Row>
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
              <Text>Discount: {product.discountPercentage}% off</Text>
            )}
            <br />
            <Rate disabled defaultValue={product.rating} /> <Text>({product.rating})</Text>
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
          <Card style={{ marginTop: 16 }}>
            <Title level={4}>Đánh giá</Title>
            {product.reviews.map((review, index) => (
              <Card key={index} style={{ marginBottom: 16 }}>
                <Rate disabled defaultValue={review.rating} />
                <Paragraph>{review.comment}</Paragraph>
                <Text type="secondary">Bởi {review.reviewerName} vào {new Date(review.date).toLocaleDateString()}</Text>
              </Card>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Details;
