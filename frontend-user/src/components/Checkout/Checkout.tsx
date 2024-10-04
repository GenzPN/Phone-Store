import React, { useState, useMemo } from 'react';
import { Card, Col, Row, Typography, Table, Radio, Button, message, Space, Input, Form, Select } from 'antd';
import { MobileOutlined, BankOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/tokenStorage';
import { useCart, CartItem } from '../../contexts/CartContext';
import api from '../../utils/api';

const { Title } = Typography;
const { Option } = Select;

interface AddressData {
  fullName: string;
  phone: string;
  address: string;
  addressType: string;
  companyName?: string;
  note?: string;
}

const Checkout: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('cod'); // Đặt 'cod' làm giá trị mặc định
  const [addressType, setAddressType] = useState<string>('home');
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const total = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
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
      render: (price: number) => `${price.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Tổng',
      key: 'total',
      render: (text: string, record: CartItem) => {
        return `${(record.price * record.quantity).toLocaleString('vi-VN')} đ`;
      },
    },
  ];

  const handlePaymentMethodChange = (e: any) => {
    console.log('Selected payment method:', e.target.value);
    setPaymentMethod(e.target.value);
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      message.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      const addressData = await form.validateFields();
      const orderData = {
        items: cartItems,
        total,
        paymentMethod,
        address: addressData,
      };

      const token = getToken();
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      const response = await api.post('/api/user/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        message.success('Đơn hàng đã được tạo thành công.');
        clearCart();

        // Đảm bảo rằng paymentMethod được gửi đúng cách
        navigate('/payment', { 
          state: { 
            orderId: response.data.orderId,
            total: total,
            paymentMethod: paymentMethod // Đảm bảo giá trị này là 'bank' khi chọn thanh toán ngân hàng
          } 
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error during payment:', error);
      message.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handleAddressTypeChange = (value: string) => {
    setAddressType(value);
    form.setFieldsValue({ addressType: value });
  };

  return (
    <div>
      <Title level={2}>Thanh toán</Title>
      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Giỏ hàng">
            <Table dataSource={cartItems} columns={columns} pagination={false} />
          </Card>
          <Card title="Địa chỉ giao hàng" style={{ marginTop: '20px' }}>
            <Form form={form} layout="vertical" initialValues={{ addressType: 'home' }}>
              <Form.Item name="addressType" label="Loại địa chỉ">
                <Select style={{ width: 120 }} onChange={handleAddressTypeChange}>
                  <Option value="home">Nhà riêng</Option>
                  <Option value="company">Công ty</Option>
                </Select>
              </Form.Item>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
              {addressType === 'company' && (
                <Form.Item name="companyName" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                  <Input placeholder="Nhập tên công ty" />
                </Form.Item>
              )}
              <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input.TextArea 
                  placeholder={addressType === 'home' ? "Nhập địa chỉ nhà" : "Nhập địa chỉ công ty"} 
                  rows={4} 
                />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea 
                  placeholder="Nhập ghi chú cho đơn hàng (nếu có)" 
                  rows={3} 
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Tổng cộng">
            <Title level={3}>{total.toLocaleString('vi-VN')} đ</Title>
          </Card>
          <Card title="Phương thức thanh toán" style={{ marginTop: '20px' }}>
            <Radio.Group onChange={handlePaymentMethodChange} value={paymentMethod}>
              <Radio value="momo" style={{display: 'block', height: '30px', lineHeight: '30px'}}>
                <MobileOutlined /> Thanh toán MoMo
              </Radio>
              <Radio value="bank" style={{display: 'block', height: '30px', lineHeight: '30px'}}>
                <BankOutlined /> Thanh toán ngân hàng
              </Radio>
              <Radio value="cod" style={{display: 'block', height: '30px', lineHeight: '30px'}}>
                <DollarOutlined /> Thanh toán khi nhận hàng (COD)
              </Radio>
            </Radio.Group>
            <div style={{ marginTop: '10px' }}>
              Phương thức thanh toán đã chọn: {paymentMethod}
            </div>
            <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
              <Button 
                type="primary" 
                onClick={handlePayment} 
                style={{ width: '100%' }}
              >
                {paymentMethod === 'cod' ? 'Đặt hàng' : 'Tiến hành thanh toán'}
              </Button>
              <Button 
                icon={<ShoppingCartOutlined />} 
                onClick={handleBackToCart}
                style={{ width: '100%' }}
              >
                Quay lại giỏ hàng
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;