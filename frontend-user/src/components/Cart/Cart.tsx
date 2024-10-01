import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table, Typography, Space, Button, InputNumber, Popconfirm, Row, Col, message } from 'antd';
import { ShoppingCartOutlined, ShoppingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCart, CartItem } from '../../contexts/CartContext';

const { Title, Text } = Typography;

const MAX_PRODUCTS = 10;

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [cartItems]);

  const handleQuantityChange = useCallback((id: number, newQuantity: number | null) => {
    if (newQuantity === null) return;
    
    const totalQuantity = cartItems.reduce((total, item) => 
      item.id === id ? total : total + item.quantity, 0) + newQuantity;

    if (totalQuantity > MAX_PRODUCTS) {
      message.warning(`Bạn chỉ có thể mua tối đa ${MAX_PRODUCTS} sản phẩm.`);
      return;
    }

    updateQuantity(id, newQuantity);
  }, [cartItems, updateQuantity]);

  const handleDelete = useCallback((id: number) => {
    removeFromCart(id);
  }, [removeFromCart]);

  const columns = useMemo(() => [
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: CartItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={record.thumbnail} alt={text} style={{ width: 50, marginRight: 10 }} />
          {text}
        </div>
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
      render: (record: CartItem) => `${(record.price * record.quantity).toLocaleString()} đ`,
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
  ], [handleQuantityChange, handleDelete]);

  const total = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const totalQuantity = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);

  if (isLoading) return <div>Đang tải...</div>;

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
          <Text strong style={{ fontSize: '18px' }}>Tổng cộng: {total.toLocaleString()} đ</Text>
        </div>
        <Row justify="space-between" align="middle">
          <Col>
            <Button type="default" icon={<ShoppingOutlined />}>
              <Link to="/products">Tiếp tục mua hàng</Link>
            </Button>
          </Col>
          <Col>
            <Button type="primary" disabled={cartItems.length === 0}>
              <Link to="/products/checkout/">Thanh toán</Link>
            </Button>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Cart;
