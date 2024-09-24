import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Collapse, Space } from 'antd';
import axios from 'axios';

const { Panel } = Collapse;

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
  total_amount: number;
  note: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched orders:', response.data); // Log để kiểm tra
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
      render: (status: string) => (
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
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (total: number) => `${total.toLocaleString()} VNĐ`,
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
        <Collapse>
          <Panel header="Xem chi tiết" key="1">
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
                  render: (price: number) => `${price.toLocaleString()} VNĐ`,
                },
              ]}
              dataSource={record.items}
              pagination={false}
              rowKey="id"
            />
          </Panel>
        </Collapse>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Quản lý đơn hàng</h2>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Orders;
