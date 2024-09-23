import React, { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import axios from 'axios';

const Orders = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders', {
          withCredentials: true,
        });
        setData(response.data);
      } catch (error) {
        message.error('Failed to fetch orders');
        console.error('Error fetching orders:', error);
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
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => (
        <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
          <img 
            src={text} 
            alt="Product" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain'
            }} 
          />
        </div>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'Đã giao' ? 'green' : 
          status === 'Đang giao' ? 'blue' : 
          status === 'Đang xử lý' ? 'orange' :
          'red'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Số lượng mua',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Trạng thái hiện tại',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case 'Đã hoàn thành':
            color = 'green';
            break;
          case 'Đang đóng gói':
            color = 'blue';
            break;
          case 'Đang vận chuyển':
            color = 'cyan';
            break;
          case 'Đã huỷ':
            color = 'red';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case 'Đã thanh toán':
            color = 'green';
            break;
          case 'Chưa thanh toán':
            color = 'red';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Danh sách đơn hàng</h2>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default Orders;
