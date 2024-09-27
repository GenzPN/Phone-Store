import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Collapse, Space, Input, Select, DatePicker, Button, Modal } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Panel } = Collapse;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  thumbnail: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  user_id: number;
  username: string;
  fullName: string;
  phone: string;
  address: string;
  status: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<Order[]>([]);
  const [filters, setFilters] = useState({
    id: '',
    username: '',
    status: '',
    dateRange: null as [Dayjs, Dayjs] | null,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
        console.log('Fetched orders:', response.data);
        setData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          message.error(error.response?.data?.message || 'Failed to fetch orders');
        } else {
          message.error('An unexpected error occurred');
        }
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleFilter = () => {
    let result = data;

    if (filters.id) {
      result = result.filter(order => order.id.toString().includes(filters.id));
    }

    if (filters.username) {
      result = result.filter(order => order.username.toLowerCase().includes(filters.username.toLowerCase()));
    }

    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }

    if (filters.dateRange) {
      const [start, end] = filters.dateRange;
      result = result.filter(order => {
        const orderDate = dayjs(order.created_at);
        return orderDate.isAfter(start) && orderDate.isBefore(end);
      });
    }

    setFilteredData(result);
  };

  useEffect(() => {
    handleFilter();
  }, [filters, data]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      message.success('Trạng thái đơn hàng đã được cập nhật');
      // Refresh the orders list
      const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
      setData(response.data);
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', error);
    }
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Thông tin giao hàng',
      key: 'shipping',
      render: (text: string, record: Order) => (
        <Space direction="vertical">
          <span>{record.fullName}</span>
          <span>{record.phone}</span>
          <span>{record.address}</span>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <Space>
          <Tag color={
            status === 'delivered' ? 'green' : 
            status === 'shipped' ? 'blue' : 
            status === 'paid' ? 'orange' :
            'red'
          }>
            {status === 'delivered' ? 'Đã giao' :
             status === 'shipped' ? 'Đang giao' :
             status === 'paid' ? 'Đã thanh toán' :
             'Đang xử lý'}
          </Tag>
          <Select
            defaultValue={status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Option value="pending">Đang xử lý</Option>
            <Option value="paid">Đã thanh toán</Option>
            <Option value="shipped">Đang giao</Option>
            <Option value="delivered">Đã giao</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total: number | undefined) => {
        if (typeof total === 'number') {
          return `${total.toLocaleString()} VNĐ`;
        }
        return 'N/A'; // or any default value you prefer
      },
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (text: string, record: Order) => (
        <Button onClick={() => showOrderDetails(record)}>Xem chi tiết</Button>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Quản lý đơn hàng</h2>
      <Space style={{ marginBottom: '20px' }}>
        <Input
          placeholder="ID đơn hàng"
          value={filters.id}
          onChange={e => setFilters({ ...filters, id: e.target.value })}
        />
        <Input
          placeholder="Tên khách hàng"
          value={filters.username}
          onChange={e => setFilters({ ...filters, username: e.target.value })}
        />
        <Select
          style={{ width: 120 }}
          placeholder="Trạng thái"
          value={filters.status}
          onChange={value => setFilters({ ...filters, status: value })}
        >
          <Option value="">Tất cả</Option>
          <Option value="pending">Đang xử lý</Option>
          <Option value="paid">Đã thanh toán</Option>
          <Option value="shipped">Đang giao</Option>
          <Option value="delivered">Đã giao</Option>
        </Select>
        <RangePicker
          value={filters.dateRange}
          onChange={(dates) => setFilters({ ...filters, dateRange: dates as [Dayjs, Dayjs] })}
        />
      </Space>
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Chi tiết đơn hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <p><strong>ID:</strong> {selectedOrder.id}</p>
            <p><strong>Khách hàng:</strong> {selectedOrder.username}</p>
            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Tổng tiền:</strong> {selectedOrder.total_price?.toLocaleString()} VNĐ</p>
            <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            <h3>Sản phẩm:</h3>
            <Table
              columns={[
                {
                  title: 'Hình ảnh',
                  dataIndex: 'thumbnail',
                  key: 'thumbnail',
                  render: (text: string) => (
                    <img src={text} alt="Product" style={{ width: 50, height: 50, objectFit: 'contain' }} />
                  ),
                },
                {
                  title: 'Tên sản phẩm',
                  dataIndex: 'title',
                  key: 'title',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price: number | undefined) => {
                    if (typeof price === 'number') {
                      return `${price.toLocaleString()} VNĐ`;
                    }
                    return 'N/A';
                  },
                },
              ]}
              dataSource={selectedOrder.items}
              pagination={false}
              rowKey="id"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
