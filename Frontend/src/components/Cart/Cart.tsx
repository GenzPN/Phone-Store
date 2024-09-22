import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Image, Typography, Space, Button, InputNumber, Popconfirm, Row, Col, message } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface CartItem {
  id: number;
  image: string;
  name: string;
  quantity: number;
  price: number;
}

const MAX_PRODUCTS = 10;

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch('/cart.json');
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu giỏ hàng');
        }
        const data: CartItem[] = await response.json();
        setCartItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const calculateTotal = (item: CartItem) => {
    return item.quantity * item.price;
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + calculateTotal(item), 0);
  };

  const handleQuantityChange = (id: number, newQuantity: number | null) => {
    if (newQuantity === null) return;
    
    const totalQuantity = cartItems.reduce((total, item) => 
      item.id === id ? total : total + item.quantity, 0) + newQuantity;

    if (totalQuantity > MAX_PRODUCTS) {
      message.warning(`Bạn chỉ có thể mua tối đa ${MAX_PRODUCTS} sản phẩm.`);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'image',
      key: 'image',
      render: (image: string, record: CartItem) => (
        <Space>
          <Image src={image} alt={record.name} width={50} />
          <Text>{record.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} đ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          max={MAX_PRODUCTS}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.id, value)}
        />
      ),
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (record: CartItem) => `${calculateTotal(record).toLocaleString()} đ`,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: CartItem) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button icon={<DeleteOutlined />} danger />
        </Popconfirm>
      ),
    },
  ];

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '1000px' }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          <ShoppingCartOutlined /> Giỏ hàng
        </Title>
        {totalQuantity >= MAX_PRODUCTS && (
          <Text type="warning" style={{ textAlign: 'center', display: 'block' }}>
            Bạn đã đạt giới hạn {MAX_PRODUCTS} sản phẩm trong giỏ hàng.
          </Text>
        )}
        <Table 
          dataSource={cartItems} 
          columns={columns} 
          pagination={false}
          rowKey="id"
        />
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ fontSize: '18px' }}>Tổng cộng: {calculateCartTotal().toLocaleString()} đ</Text>
        </div>
        <Row justify="space-between" align="middle">
          <Col>
            <Button type="default" icon={<ShoppingOutlined />}>
              <Link to="/products">Tiếp tục mua hàng</Link>
            </Button>
          </Col>
          <Col>
            <Button type="primary">
              <Link to="/checkout">Thanh toán</Link>
            </Button>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Cart;
