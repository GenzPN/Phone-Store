import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Typography, Spin, Card, Descriptions } from 'antd';
import { CheckCircleOutlined, HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import api from '../../utils/api';

const { Title, Paragraph } = Typography;

interface OrderDetails {
  id: string;
  total_amount: number;
  created_at: string;
  payment_method: string;
  status: string;
}

const Order: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/user/orders/${orderId}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <Result
        status="error"
        title="Không tìm thấy thông tin đơn hàng"
        subTitle="Xin lỗi, chúng tôi không thể tìm thấy thông tin cho đơn hàng này."
        extra={[
          <Button type="primary" key="home" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
        title="Thanh toán thành công!"
        subTitle={`Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là #${orderDetails.id}`}
        extra={[
          <Button type="primary" key="console" icon={<ShoppingOutlined />} onClick={() => navigate('/orders')}>
            Xem đơn hàng
          </Button>,
          <Button key="buy" icon={<HomeOutlined />} onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>,
        ]}
      />
      <Card style={{ marginTop: '20px' }}>
        <Descriptions title="Chi tiết đơn hàng" bordered>
          <Descriptions.Item label="Mã đơn hàng">{orderDetails.id}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{orderDetails.total_amount.toLocaleString('vi-VN')} đ</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">{new Date(orderDetails.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán">{orderDetails.payment_method}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">{orderDetails.status}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Paragraph style={{ marginTop: '20px', textAlign: 'center' }}>
        Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email support@example.com hoặc số điện thoại 1900 1234.
      </Paragraph>
    </div>
  );
};

export default Order;
