import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Card, Image, Row, Col, Space, Button, Divider, Statistic, message, Progress } from 'antd';
import { CopyOutlined, QrcodeOutlined, BankOutlined, MobileOutlined, ClockCircleOutlined, ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../../utils/api';
import './Payment.css';
import axios, { AxiosError } from 'axios';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface PaymentInfo {
  linkQR: string;
  amount: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  transferContent: string;
  order_id: string;
  return_url: string;
  notify_url: string;
  orderTimeout: number;
  transactionId: string;
  payment_status: string;
}

function Payment() {
  const { orderId, paymentMethod: urlPaymentMethod } = useParams<{ orderId: string, paymentMethod: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [totalTimeout, setTotalTimeout] = useState<number>(30 * 60); // 30 phút
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');
  };

  useEffect(() => {
    // Sử dụng paymentMethod từ URL nếu có
    if (urlPaymentMethod) {
      setPaymentMethod(urlPaymentMethod);
    } else if (location.state && location.state.paymentMethod) {
      setPaymentMethod(location.state.paymentMethod);
    }

    const fetchPaymentInfo = async () => {
      try {
        const response = await api.get(`/api/user/orders/payment-info/${orderId}`);
        setPaymentInfo(response.data);
        setLoading(false);

        if (response.data.orderTimeout) {
          setCountdown(response.data.orderTimeout);
          setTotalTimeout(30 * 60); // 30 phút
        }

        // Cập nhật total từ response.data
        if (response.data.total) {
          setTotal(response.data.total);
        } else if (response.data.amount) {
          // Fallback nếu total không tồn tại nhưng amount có
          setTotal(parseFloat(response.data.amount));
        }

        if (response.data.paymentMethod) {
          setPaymentMethod(response.data.paymentMethod);
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

    if (orderId) {
      fetchPaymentInfo();
    }
  }, [orderId, location.state, urlPaymentMethod]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép vào clipboard');
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Ngân Hàng';
      case 'momo':
        return 'Momo';
      default:
        return method;
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  const handleCheckPayment = async () => {
    try {
      const response = await api.get(`/api/user/orders/payment-info/${orderId}`);
      if (response.data.payment_status === 'completed') {
        message.success('Thanh toán đã được xác nhận!');
        navigate(`/order-confirmation/${orderId}`);
      } else if (response.data.status === 'paid') {
        message.success('Đơn hàng đã được thanh toán và đang được xử lý!');
        navigate(`/order-confirmation/${orderId}`);
      } else {
        message.info('Thanh toán chưa được xác nhận. Vui lòng thử lại sau.');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi kiểm tra thanh toán.');
    }
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Đang tải thông tin thanh toán...</div>;
  }

  if (!paymentInfo) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Không thể tải thông tin thanh toán</div>;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card style={{ width: '100%', maxWidth: 1000, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <Row gutter={24}>
            <Col xs={24} md={14}>
              <Space style={{ marginBottom: 20 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={handleGoBack}>Quay lại</Button>
                <Button icon={<CheckOutlined />} onClick={handleCheckPayment} type="primary">Kiểm tra thanh toán</Button>
              </Space>
              <Title level={3}><ClockCircleOutlined /> Thông tin thanh toán</Title>
              <Card style={{ marginBottom: 20 }}>
                <Paragraph>
                  <strong>Mã đơn hàng:</strong> {orderId}
                </Paragraph>
                <Paragraph>
                  <strong>Mã giao dịch:</strong> {paymentInfo.transactionId}
                </Paragraph>
                <Paragraph>
                  <Space>
                    <Text strong>Tổng tiền:</Text>
                    <Text type="danger" copyable={{ text: total.toString() }}>
      {formatCurrency(total)}
    </Text>
                  </Space>
                </Paragraph>
                <Paragraph>
                  <strong>Phương thức thanh toán:</strong> {paymentMethod === 'bank_transfer' ? <BankOutlined /> : <MobileOutlined />} {getPaymentMethodDisplay(paymentMethod)}
                </Paragraph>
              </Card>
              
              {paymentMethod === 'bank_transfer' && (
                <Card title="Thông tin chuyển khoản" extra={<BankOutlined />}>
                  <Paragraph>
                    <Space>
                      <Text strong>Tên ngân hàng:</Text>
                      <Text copyable>{paymentInfo.bankName}</Text>
                    </Space>
                  </Paragraph>
                  <Paragraph>
                    <Space>
                      <Text strong>Số tài khoản:</Text>
                      <Text copyable>{paymentInfo.accountNumber}</Text>
                    </Space>
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Chủ tài khoản:</Text> {paymentInfo.accountHolder}
                  </Paragraph>
                  <Paragraph>
                    <Space>
                      <Text strong>Nội dung chuyển khoản:</Text>
                      <Text copyable>{paymentInfo.transferContent}</Text>
                    </Space>
                  </Paragraph>
                </Card>
              )}
              
              {paymentMethod === 'momo' && (
                <Card title="Thông tin MoMo" extra={<MobileOutlined />}>
                  <Paragraph>
                    <Space>
                      <Text strong>Số điện thoại MoMo:</Text>
                      <Text copyable>{paymentInfo.accountNumber}</Text>
                    </Space>
                  </Paragraph>
                  <Paragraph>
                    <Space>
                      <Text strong>Nội dung chuyển khoản:</Text>
                      <Text copyable>{paymentInfo.transferContent}</Text>
                    </Space>
                  </Paragraph>
                </Card>
              )}
              
              {countdown !== null && (
                <Card style={{ marginTop: 20 }}>
                  <Statistic
                    title="Thời gian còn lại"
                    value={formatTime(countdown)}
                    prefix={<ClockCircleOutlined />}
                    suffix=""
                  />
                  <Progress 
                    percent={Math.round((countdown / totalTimeout) * 100)} 
                    showInfo={false} 
                    status="active" 
                  />
                </Card>
              )}
            </Col>
            <Col xs={24} md={10}>
              <Card title="Mã QR thanh toán" extra={<QrcodeOutlined />}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Image
                    src={paymentInfo.linkQR}
                    alt="QR Code for payment"
                    style={{ width: '100%', maxWidth: 250 }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
}

export default Payment;