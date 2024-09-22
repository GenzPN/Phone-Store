import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Typography, Table, QRCode, Radio, Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface CartItem {
  name: string;
  price: string;
  quantity: number;
}

interface PaymentData {
  linkQR: string;
  trade_no: string;
  amount: string;
  CTK: string;
  STK: string;
  KEYWORD: string;
  order_id: string;
  return_url: string;
  BANKID: number;
  URL_TELEGRAM: string;
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedBank, setSelectedBank] = useState('vietcombank');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  useEffect(() => {
    // Fetch cart items from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCartItems(parsedCart);
      
      // Calculate total
      const calculatedTotal = parsedCart.reduce((acc: number, item: CartItem) => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        return acc + (price * item.quantity);
      }, 0);
      setTotal(calculatedTotal);
    }

    // Fetch payment data
    fetch('/paymentData.json')
      .then(response => response.json())
      .then(data => setPaymentData(data))
      .catch(error => console.error('Error fetching payment data:', error));
  }, []);

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
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
        const price = parseInt(record.price.replace(/[^\d]/g, ''), 10);
        return `${(price * record.quantity).toLocaleString('vi-VN')} đ`;
      },
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Đã sao chép thành công!');
    });
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
          {paymentData && (
            <Card title="Thông tin thanh toán" style={{ marginTop: '20px' }}>
              <Paragraph>
                Số tiền: 
                <Button type="link" onClick={() => copyToClipboard(paymentData.amount)}>
                  <Text strong>{paymentData.amount}</Text>
                  <CopyOutlined />
                </Button>
              </Paragraph>
              <Paragraph>
                Tên tài khoản: <Text strong>{paymentData.CTK}</Text>
              </Paragraph>
              <Paragraph>
                Số tài khoản:
                <Button type="link" onClick={() => copyToClipboard(paymentData.STK)}>
                  <Text strong>{paymentData.STK}</Text>
                  <CopyOutlined />
                </Button>
              </Paragraph>
              <Paragraph>
                Nội dung chuyển khoản:
                <Button 
                  type="link"                   
                  onClick={() => copyToClipboard(`${paymentData.KEYWORD}${paymentData.order_id}`)}
                >
                  <Text strong>{`${paymentData.KEYWORD}${paymentData.order_id}`}</Text>
                  <CopyOutlined />
                </Button>
              </Paragraph>
              <Paragraph>
                <Text type="warning" strong>* Đơn hàng sẽ không duyệt nếu chuyển tiền không có nội dung {`${paymentData.KEYWORD}${paymentData.order_id}`} này.</Text>
              </Paragraph>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <QRCode value={paymentData.linkQR} size={200} />
              </div>
              <Paragraph style={{ textAlign: 'center', marginTop: '10px' }}>
                Quét mã QR để thanh toán
              </Paragraph>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <Button type="primary" onClick={() => {
                  if (paymentData.return_url) {
                    window.location.href = paymentData.return_url;
                  }
                }}>
                  Hoàn tất thanh toán
                </Button>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
