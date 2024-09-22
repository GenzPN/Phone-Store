import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Table, Radio, Button, message, Space } from 'antd';
import { MobileOutlined, BankOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface CartItem {
  id: number;
  image: string;
  name: string;
  quantity: number;
  price: number;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart items from cart.json
    fetch('/cart.json')
      .then(response => response.json())
      .then(data => {
        setCartItems(data);
        
        // Calculate total
        const calculatedTotal = data.reduce((acc: number, item: CartItem) => {
          return acc + (item.price * item.quantity);
        }, 0);
        setTotal(calculatedTotal);
      })
      .catch(error => console.error('Error fetching cart data:', error));
  }, []);

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CartItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={record.image} alt={text} style={{ width: 50, marginRight: 10 }} />
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

  const handlePayment = () => {
    if (!paymentMethod) {
      message.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    switch (paymentMethod) {
      case 'momo':
        // Xử lý thanh toán MoMo
        message.info('Đang chuyển hướng đến thanh toán MoMo...');
        // Thêm logic chuyển hướng đến MoMo ở đây
        break;
      case 'bank':
        // Xử lý thanh toán ngân hàng
        fetch(`/api/payment/${cartItems[0].id}`)
          .then(response => response.json())
          .then(data => {
            // Xử lý dữ liệu trả về từ API
            console.log('Payment data:', data);
            // Chuyển hướng đến trang thanh toán ngân hàng hoặc hiển thị thông tin thanh toán
            // window.location.href = data.paymentUrl; // Ví dụ
          })
          .catch(error => console.error('Error fetching payment data:', error));
        break;
      case 'cod':
        // Xử lý thanh toán tiền mặt khi nhận hàng
        message.success('Đơn hàng đã được đặt thành công. Bạn sẽ thanh toán khi nhận hàng.');
        // Thêm logic xử lý đơn hàng COD ở đây
        break;
      default:
        message.error('Phương thức thanh toán không hợp lệ');
    }
  };

  const handleBackToCart = () => {
    navigate('/cart'); // Điều hướng về trang giỏ hàng
  };

  return (
    <div>
      <Title level={2}>Thanh toán</Title>
      <Row gutter={[24, 24]}>
        <Col span={16}>
          <Card title="Giỏ hàng">
            <Table dataSource={cartItems} columns={columns} pagination={false} />
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
            <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }}>
              <Button 
                type="primary" 
                onClick={handlePayment} 
                style={{ width: '100%' }}
                disabled={!paymentMethod}
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
