import { useState, useEffect } from 'react';
import { Layout, Typography, Card, Image, Row, Col, Space, Button, Divider, Statistic, message, Select, Skeleton } from 'antd';
import { CopyOutlined, MobileOutlined } from '@ant-design/icons';
import './Payment.css';
import React from 'react';

// Custom hook for media query
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

interface PaymentInfo {
  linkQR: string;
  amount: string;
  notify_url: string;
  trade_no: string;
  return_url: string;
  order_id: string;
  STK: string;
  CTK: string;
  KEYWORD: string;
  BANKID: number;
  LOGO_DVS: string;
  URL_ZALO: string;
  THOI_GIAN: number;
  URL_TELEGRAM: string;
  URL_WEB: string;
  directoryPath: string;
  price: number;
  status: number;
  time: number;
  tradeNo: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}

interface BankApp {
  appId: string;
  appName: string;
  bankName: string;
  deeplink: string;
}

function Payment() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankApps, setBankApps] = useState<BankApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For development, use the mock data
        const response = await fetch('/paymentData.json');
        const paymentData = await response.json();
        setPaymentInfo(paymentData);

        // Fetch bank info
        const bankResponse = await fetch('https://api.vietqr.io/v2/banks');
        if (!bankResponse.ok) throw new Error('Failed to fetch bank info');
        const bankData = await bankResponse.json();
        if (bankData.code === '00') {
          const found = bankData.data.find((bank: Bank) => bank.bin === paymentData.BANKID?.toString());
          if (found) {
            setSelectedBank(found);
            console.log('Selected Bank:', found.shortName);
          } else {
            console.log('Bank not found for BANKID:', paymentData.BANKID);
          }
        }

        // Fetch bank apps
        const appsResponse = await fetch('https://api.vietqr.io/v2/ios-app-deeplinks');
        if (!appsResponse.ok) throw new Error('Failed to fetch bank apps');
        const appsData = await appsResponse.json();
        setBankApps(appsData.apps);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!paymentInfo || !paymentInfo.directoryPath) return;

    const checkStatus = async () => {
      try {
        const statusPath = `${paymentInfo.directoryPath}/status.log`;
        const response = await fetch(statusPath);
        if (!response.ok) throw new Error('Failed to check payment status');
        const statusText = await response.text();
        const statusLog = parseInt(statusText.trim(), 10);

        if (statusLog === 1) {
          message.success('Thanh toán thành công', 3);
          setTimeout(() => {
            window.location.href = paymentInfo.return_url;
          }, 3000);
        } else if (statusLog === 0) {
          // Stay on the current page
        } else {
          console.warn('Unexpected status:', statusLog);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        message.error('Error checking payment status');
      }
    };

    const intervalId = setInterval(checkStatus, 1000);

    return () => clearInterval(intervalId);
  }, [paymentInfo]);

  const {
    linkQR,
    amount, 
    notify_url,
    trade_no,
    return_url,
    order_id,
    STK,
    CTK,
    KEYWORD,
    BANKID,
    LOGO_DVS,
    URL_ZALO,
    THOI_GIAN,
    URL_TELEGRAM,
    URL_WEB,
    directoryPath,
    price,
    status,
    time,
    tradeNo,
  } = paymentInfo || {};

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('Đã sao chép thành công!');
    });
  };

  const handleBankAppChange = (value: string) => {
    setSelectedApp(value);
  };

  const openBankApp = () => {
    const app = bankApps.find(app => app.appId === selectedApp);
    if (app) {
      window.location.href = app.deeplink;
    } else {
      message.warning('Vui lòng chọn một ứng dụng ngân hàng.');
    }
  };

  const bankAppOptions = bankApps.map(app => ({
    value: app.appId,
    label: (
      <span>
        {app.appName} - {app.bankName}
      </span>
    )
  }));

  const isMobile = useMediaQuery('(max-width: 767px)');

  useEffect(() => {
    if (paymentInfo && paymentInfo.THOI_GIAN) {
      const left = Math.floor(Date.now() / 1000) - paymentInfo.time;
      const offset = paymentInfo.THOI_GIAN * 60 - left;
      let second = offset > 0 ? offset : 0;
      
      const updateCountdown = () => {
        if (second > 0) {
          setCountdown(second);
          second--;
        } else {
          if (paymentInfo.return_url) {
            window.location.href = paymentInfo.return_url;
          }
        }
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentInfo]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-content">
          <div className="logo-container">
            {selectedBank && (
              <img src={selectedBank.logo} alt={`${selectedBank.shortName} Logo`} className="header-logo" />
            )}
          </div>
          <Title level={3} className="header-title">GenzPN Services</Title>
        </div>
      </Header>
      <Content className="content">
        <Card className="payment-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={12}>
              {loading ? (
                <Skeleton active />
              ) : (
                <Card className="qr-card">
                  <Title level={4} className="text-center">Quét mã QR để thanh toán</Title>
                  <div className="qr-container">
                    <Image
                      src={linkQR}
                      alt="QR Code for payment"
                      style={{ width: '100%', maxWidth: isMobile ? 200 : 300 }}
                      preview={true}
                    />
                  </div>
                  {!isMobile && (
                    <>
                      <Divider />
                      <Paragraph className="text-center">
                        Sử dụng tất cả các app<br />
                        Ngân Hàng hoặc Ví Điện Tử<br />
                        để quét mã QR code
                      </Paragraph>
                    </>
                  )}
                  {isMobile && (
                    <>
                      <Divider />
                      <Paragraph className="text-center">
                        Sử dụng tất cả các app<br />
                        Ngân Hàng hoặc Ví Điện Tử<br />
                        để quét mã QR code
                      </Paragraph>
                      <Divider />
                      <Title level={5} className="text-center">Hoặc Chọn Ứng Dụng Ngân Hàng</Title>
                      <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
                        <Select
                          style={{ width: '100%', maxWidth: '300px' }}
                          placeholder="Chọn ứng dụng ngân hàng"
                          onChange={handleBankAppChange}
                          options={bankAppOptions}
                        />
                        <Button type="primary" icon={<MobileOutlined />} onClick={openBankApp} disabled={!selectedApp}>
                          Mở Ứng Dụng Ngân Hàng
                        </Button>
                        <Button type="primary" icon={<MobileOutlined />} onClick={() => window.location.href = 'momo://'}>
                          Mở Ứng Dụng MoMo
                        </Button>
                      </Space>
                    </>
                  )}
                </Card>
              )}
            </Col>
            <Col xs={24} sm={24} md={12}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : (
                <>
                  <Title level={4}>Đang Chờ Thanh Toán...</Title>
                  <Paragraph>Đơn Hàng: <Text strong>{trade_no}</Text></Paragraph>
                  <Title level={4}>Chuyển Khoản Thủ Công</Title>

                  <Paragraph>
                    Ngân hàng:
                    <Button type="link" onClick={() => copyToClipboard(selectedBank?.shortName || 'N/A')}>
                      <Text strong>{selectedBank?.shortName || 'N/A'}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  
                  <Paragraph>
                    Số tiền: 
                    <Button type="link" onClick={() => copyToClipboard(amount || '')}>
                      <Text strong>{amount}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  
                  <Paragraph>
                    Tên tài khoản: <Text strong>{CTK}</Text>
                  </Paragraph>
                  
                  <Paragraph>
                    Số tài khoản:
                    <Button type="link" onClick={() => copyToClipboard(STK || '')}>
                      <Text strong>{STK || ''}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  
                  <Paragraph>
                    Nội dung chuyển khoản:
                    <Button 
                      type="link"                   
                      onClick={() => copyToClipboard(`${KEYWORD}${order_id}`)}
                    >
                      <Text strong>{`${KEYWORD}${order_id}`}</Text>
                      <CopyOutlined />
                    </Button>
                  </Paragraph>
                  
                  <Paragraph>
                    <Text type="warning" strong>* Đơn hàng sẽ không duyệt nếu chuyển tiền không có nội dung {`${KEYWORD}${order_id}`} này.</Text><br />
                    <Text type="warning" strong>* Chỉ duyệt số tiền = {amount} hoặc Lớn Hơn</Text>
                  </Paragraph>
                  
                  <Text>Tự động duyệt sau 30s</Text>
                  
                  <Title level={4}>Đơn hàng sẽ hết hạn sau:</Title>
                  {countdown !== null && (
                    <>
                      <Title level={4}>Thời gian còn lại:</Title>
                      <Statistic value={formatTime(countdown)} />
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <Button type="primary" onClick={() => {
                      if (return_url) {
                        window.location.href = return_url;
                      }
                    }}>
                      Quay Về Trang Chủ
                    </Button>
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Card>
      </Content>
      <Footer className="footer">
        Created by GenzPN Services | Hỗ trợ: <a href={URL_TELEGRAM}>Telegram</a>
      </Footer>
    </Layout>
  );
}

export default Payment;