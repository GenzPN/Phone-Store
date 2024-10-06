import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Typography, Input, Select, message, Card, Image, Modal } from 'antd';
import { ShoppingOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

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
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: string;
  city: string; // Thêm trường city
  note?: string;
}

const Order: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/user/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId: number, paymentMethod: string, status: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          {(paymentMethod === 'bank_transfer' || paymentMethod === 'momo') && status === 'paid' && (
            <p>Lưu ý: Đơn hàng đã được thanh toán. Tiền sẽ được hoàn lại trong vòng 48 giờ làm việc.</p>
          )}
          {paymentMethod === 'bank_transfer' && (
            <p>Vui lòng cung cấp thông tin tài khoản ngân hàng để nhận tiền hoàn lại (nếu có).</p>
          )}
          {paymentMethod === 'momo' && (
            <p>Tiền sẽ được hoàn lại vào tài khoản Momo của bạn (nếu có).</p>
          )}
        </div>
      ),
      okText: 'Xác nhận hủy',
      cancelText: 'Không hủy',
      onOk: async () => {
        try {
          await api.put(`/api/user/orders/${orderId}/cancel`);
          message.success('Đơn hàng đã được hủy thành công');
          fetchOrders();
        } catch (error) {
          console.error('Error cancelling order:', error);
          message.error('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
        }
      },
    });
  };

  const renderPaymentMethod = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'momo':
        return 'Momo';
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      default:
        return method;
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Chờ thanh toán</Tag>;
      case 'paid':
        return <Tag color="green">Đã thanh toán</Tag>;
      case 'shipped':
        return <Tag color="blue">Đang giao hàng</Tag>;
      case 'delivered':
        return <Tag color="green">Đã giao hàng</Tag>;
      case 'cancelled':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const handleExpand = (expanded: boolean, record: Order) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
  };

  const showOrderDetails = (record: Order) => {
    setSelectedOrder(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <Card title="Chi tiết đơn hàng" style={{ marginBottom: 16 }}>
        <Card.Grid style={{ width: '100%' }} hoverable={false}>
          <Text strong>Địa chỉ giao hàng:</Text> {`${selectedOrder.shipping_address}, ${selectedOrder.city}`}
        </Card.Grid>
        <Card.Grid style={{ width: '100%' }} hoverable={false}>
          <Text strong>Sản phẩm:</Text>
          <Table
            columns={[
              {
                title: 'Sản phẩm',
                dataIndex: 'title',
                key: 'title',
                render: (text, item) => (
                  <Space>
                    <Image
                      width={50}
                      src={item.thumbnail}
                      alt={item.title}
                    />
                    {text}
                  </Space>
                ),
              },
              { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
              { 
                title: 'Giá', 
                dataIndex: 'price', 
                key: 'price', 
                render: (price: number) => `${price.toLocaleString('vi-VN')} đ` 
              },
            ]}
            dataSource={selectedOrder.items}
            pagination={false}
            rowKey="id"
          />
        </Card.Grid>
        <Card.Grid style={{ width: '50%' }} hoverable={false}>
          <Text strong>Tổng tiền:</Text> {selectedOrder.total_amount.toLocaleString('vi-VN')} đ
        </Card.Grid>
        <Card.Grid style={{ width: '50%' }} hoverable={false}>
          <Text strong>Ghi chú:</Text> {selectedOrder.note || 'Không có ghi chú'}
        </Card.Grid>
        <Card.Grid style={{ width: '50%' }} hoverable={false}>
          <Text strong>Trạng thái:</Text> {renderStatus(selectedOrder.status)}
        </Card.Grid>
        <Card.Grid style={{ width: '50%' }} hoverable={false}>
          <Text strong>Phương thức thanh toán:</Text> {renderPaymentMethod(selectedOrder.payment_method)}
        </Card.Grid>
      </Card>
    );
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString('vi-VN'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: renderPaymentMethod,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: Order) => (
        <Space size="middle">
          <Button onClick={() => showOrderDetails(record)}>Chi tiết</Button>
          {record.status === 'pending' && (
            <Button onClick={() => handleCancel(record.id, record.payment_method, record.status)}>Hủy đơn hàng</Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter(order => 
    (statusFilter === 'all' || order.status === statusFilter) &&
    (order.id.toString().includes(searchText) || 
     order.payment_method.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <ShoppingOutlined /> Đơn hàng của bạn
      </Title>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo mã đơn hàng hoặc phương thức thanh toán"
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Select 
          defaultValue="all" 
          style={{ width: 120 }} 
          onChange={value => setStatusFilter(value)}
        >
          <Option value="all">Tất cả</Option>
          <Option value="pending">Chờ thanh toán</Option>
          <Option value="paid">Đã thanh toán</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
      />
      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        {renderOrderDetails()}
      </Modal>
    </div>
  );
};

export default Order;