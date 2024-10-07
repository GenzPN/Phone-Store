import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message, Card, Row, Col, Statistic, Modal, Descriptions } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getToken, getCookie } from '../../utils/tokenStorage';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  title: string;
  thumbnail: string;
}

interface Order {
  id: number;
  user_id: number;
  shipping_address_id: number;
  total_amount: number;
  status: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
}

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    completedOrders: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = getToken() || getCookie('accessToken');
      const response = await axios.get('http://localhost:5000/api/admin/orders/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken() || getCookie('accessToken');
      const response = await axios.get('http://localhost:5000/api/admin/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Không thể lấy thống kê');
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        completedOrders: 0,
      });
    }
  };

  // Hàm chuyển đổi số sang định dạng tiền tệ VNĐ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button onClick={() => handleViewDetails(record)}>Xem chi tiết</Button>
          <Button onClick={() => handleUpdateStatus(record)}>Cập nhật trạng thái</Button>
        </Space>
      ),
    },
  ];

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'paid': return 'Đã thanh toán';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'paid': return 'green';
      case 'shipped': return 'blue';
      case 'delivered': return 'cyan';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleUpdateStatus = async (order: Order) => {
    // Implement update status logic here
    console.log('Update status for order:', order);
  };

  return (
    <div>
      <h1>Tổng quan</h1>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value as number)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={stats.completedOrders}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <h2>Danh sách đơn hàng gần đây</h2>
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="id" 
        loading={loading}
      />
      <Modal
        title="Chi tiết đơn hàng"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID đơn hàng">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">{selectedOrder.customer_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedOrder.customer_email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedOrder.customer_phone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{selectedOrder.customer_address}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">{formatCurrency(selectedOrder.total_amount)}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{selectedOrder.created_at}</Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>{selectedOrder.note}</Descriptions.Item>
          </Descriptions>
        )}
        {selectedOrder && (
          <Table
            title={() => <h3>Sản phẩm trong đơn hàng</h3>}
            columns={[
              { title: 'Sản phẩm', dataIndex: 'title', key: 'title' },
              { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Giá', dataIndex: 'price', key: 'price', render: (price: number) => formatCurrency(price) },
              { title: 'Tổng', key: 'total', render: (_, record: OrderItem) => formatCurrency(record.price * record.quantity) },
            ]}
            dataSource={selectedOrder.items}
            rowKey="id"
            pagination={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;