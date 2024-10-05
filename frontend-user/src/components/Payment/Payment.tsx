import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Card, Image, Row, Col, Space, Button, Divider, Statistic, message, Select } from 'antd';
import { CopyOutlined, MobileOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import './Payment.css';
import axios, { AxiosError } from 'axios';  // Import AxiosError

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface PaymentInfo {
  linkQR: string;
  amount: string;
  accountHolder: string;
  accountNumber: string;
  transferContent: string;
  order_id: string;
  return_url: string;
  notify_url: string;
  orderTimeout: number;
}

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, transactionId, total, paymentMethod } = location.state as { 
    orderId: string; 
    transactionId: string;
    total: number; 
    paymentMethod: string 
  };

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const response = await api.get(`/api/user/orders/payment-info/${orderId}`);
        setPaymentInfo(response.data);
        setLoading(false);

        // Bắt đầu đếm ngược
        if (response.data.orderTimeout) {
          setCountdown(response.data.orderTimeout * 60);
        }
      } catch (error) {
        let errorMessage = 'Đã xảy ra lỗi không xác định';
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<{ message: string }>;
          console.error('Error fetching payment info:', axiosError.response?.data || axiosError.message);
          errorMessage = axiosError.response?.data?.message || axiosError.message;
        } else if (error instanceof Error) {
          console.error('Error fetching payment info:', error.message);
          errorMessage = error.message;
        }
        message.error('Không thể lấy thông tin thanh toán: ' + errorMessage);
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [orderId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev !== null ? prev - 1 : null);
      }, 1000);
    } else if (countdown === 0) {
      // Hết thời gian, chuyển hướng về trang chủ hoặc trang đơn hàng
      navigate('/');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Đang tải thông tin thanh toán...</div>;
  }

  if (!paymentInfo) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Không thể tải thông tin thanh toán</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 800 }}>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12}>
              <Title level={3}>Thông tin thanh toán</Title>
              <Paragraph>
                Mã đơn hàng: <Text strong>{orderId}</Text>
              </Paragraph>
              <Paragraph>
                Mã giao dịch: <Text strong>{transactionId}</Text>
              </Paragraph>
              <Paragraph>
                Tổng tiền: <Text strong>{total.toLocaleString('vi-VN')} đ</Text>
              </Paragraph>
              <Paragraph>
                Phương thức thanh toán: <Text strong>{paymentMethod}</Text>
              </Paragraph>
              {paymentMethod === 'bank' && (
                <>
                  <Paragraph>
                    Số tài khoản: 
                    <Button type="link" onClick={() => navigator.clipboard.writeText(paymentInfo.accountNumber)}>
                      <Text strong>{paymentInfo.accountNumber}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  <Paragraph>
                    Chủ tài khoản: <Text strong>{paymentInfo.accountHolder}</Text>
                  </Paragraph>
                  <Paragraph>
                    Nội dung chuyển khoản:
                    <Button type="link" onClick={() => navigator.clipboard.writeText(paymentInfo.transferContent)}>
                      <Text strong>{paymentInfo.transferContent}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  <div className="qr-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Image
                      src={paymentInfo.linkQR}
                      alt="QR Code for payment"
                      style={{ width: '100%', maxWidth: 300 }}
                    />
                  </div>
                </>
              )}
              {paymentMethod === 'momo' && (
                <>
                  <Paragraph>
                    Số điện thoại MoMo: 
                    <Button type="link" onClick={() => navigator.clipboard.writeText(paymentInfo.accountNumber)}>
                      <Text strong>{paymentInfo.accountNumber}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  <div className="qr-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Image
                      src={paymentInfo.linkQR}
                      alt="QR Code for MoMo payment"
                      style={{ width: '100%', maxWidth: 300 }}
                    />
                  </div>
                </>
              )}
              {countdown !== null && (
                <Statistic title="Thời gian còn lại" value={formatTime(countdown)} style={{ marginTop: 20 }} />
              )}
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
}

export default Payment;