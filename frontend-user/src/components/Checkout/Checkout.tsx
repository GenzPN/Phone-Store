import React, { useState, useMemo, useEffect } from 'react';
import { Card, Col, Row, Typography, Table, Radio, Button, message, Space, Form, Select, Input } from 'antd';
import { MobileOutlined, BankOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/tokenStorage';
import { useCart, CartItem } from '../../contexts/CartContext';
import api from '../../utils/api';
import axios, { AxiosError } from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  is_default: boolean;
}

const Checkout: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [addressType, setAddressType] = useState<string>('home');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const total = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);

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
    setPaymentMethod(e.target.value);
  };

  const handleAddressTypeChange = (value: string) => {
    setAddressType(value);
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      message.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      const values = await form.validateFields();
      let shipping_address_id = values.id;

      if (shipping_address_id === 'new' || !shipping_address_id) {
        // Gọi API để tạo địa chỉ mới và lấy ID
        const response = await api.post('/api/user/addresses', {
          fullName: values.fullName,
          phone: values.phone,
          address: values.newAddress,
          city: values.city,
          isDefault: false // hoặc true nếu bạn muốn đặt làm địa chỉ mặc định
        });
        shipping_address_id = response.data.id;
      }

      const orderData = { 
        items: cartItems, 
        total_amount: total,
        paymentMethod, 
        shipping_address_id,
        note: values.note
      };

      console.log('Sending order data:', orderData);

      const token = getToken();
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      const response = await api.post('/api/user/orders', orderData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 201) {
        message.success('Đơn hàng đã được tạo thành công.');
        clearCart();
        navigate('/payment', { 
          state: { 
            orderId: response.data.orderId,
            transactionId: response.data.transactionId,
            total: total,
            paymentMethod
          } 
        });
      }
    } catch (error: unknown) {
      console.error('Error during payment:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          console.error('Error response:', axiosError.response.data);
          message.error((axiosError.response.data as any).message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        } else {
          message.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        }
      } else {
        message.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = getToken();
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        navigate('/login');
        return;
      }

      const response = await api.get('/api/user/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Không thể tải danh sách địa chỉ');
    }
  };

  const handleAddressChange = (value: string) => {
    if (value === 'new') {
      form.setFieldsValue({
        fullName: '',
        phone: '',
        newAddress: '',
        city: '',
      });
    } else {
      const selectedAddress = addresses.find(addr => addr.id === parseInt(value));
      if (selectedAddress) {
        form.setFieldsValue({
          fullName: selectedAddress.full_name,
          phone: selectedAddress.phone,
          newAddress: selectedAddress.address,
          city: selectedAddress.city,
        });
      }
    }
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
            <Form form={form} layout="vertical">
              <Form.Item name="id" label="Địa chỉ giao hàng">
                <Select 
                  placeholder="Chọn địa chỉ giao hàng"
                  onChange={handleAddressChange}
                >
                  {addresses.map((address: Address) => (
                    <Option key={address.id} value={address.id}>
                      {address.full_name} - {address.address}, {address.city}
                    </Option>
                  ))}
                  <Option value="new">Thêm địa chỉ mới</Option>
                </Select>
              </Form.Item>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="newAddress" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
                <Input.TextArea />
              </Form.Item>
              <Form.Item name="city" label="Thành phố" rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea />
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
              <Radio value="bank_transfer" style={{display: 'block', height: '30px', lineHeight: '30px'}}>
                <BankOutlined /> Thanh toán ngân hàng
              </Radio>
              <Radio value="cod" style={{display: 'block', height: '30px', lineHeight: '30px'}}>
                <DollarOutlined /> Thanh toán khi nhận hàng (COD)
              </Radio>
            </Radio.Group>
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
                onClick={() => navigate('/cart')}
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