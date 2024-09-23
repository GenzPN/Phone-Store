import React from 'react';
import { Table, Tag } from 'antd';

const Orders = () => {
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
        render: (text) => (
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
      render: (status) => (
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
      render: (price) => `${price.toLocaleString()} VNĐ`,
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
      render: (status) => {
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
      render: (status) => {
        let color = 'default';
        switch (status) {
          case 'Đã thanh toán':
            color = 'green';
            break;
          case 'Chưa thanh toán':
            color = 'red';
            break;
          case 'Trả góp':
            color = 'orange';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const data = [
    {
      id: 1,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg',
      name: 'Samsung Galaxy S21 Ultra',
      status: 'Đã giao',
      price: 25000000,
      amount: 2,
      currentStatus: 'Đã hoàn thành',
      paymentStatus: 'Đã thanh toán',
    },
    {
      id: 2,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi11-ultra-5g-k1.jpg',
      name: 'Xiaomi Mi 11 Ultra',
      status: 'Đang giao',
      price: 22000000,
      amount: 1,
      currentStatus: 'Đang vận chuyển',
      paymentStatus: 'Chưa thanh toán',
    },
    {
      id: 3,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg',
      name: 'Google Pixel 6 Pro',
      status: 'Đang xử lý',
      price: 18500000,
      amount: 1,
      currentStatus: 'Đang đóng gói',
      paymentStatus: 'Trả góp',
    },
    {
      id: 4,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg',
      name: 'OnePlus 9 Pro',
      status: 'Đã giao',
      price: 17000000,
      amount: 1,
      currentStatus: 'Đã hoàn thành',
      paymentStatus: 'Đã thanh toán',
    },
    {
      id: 5,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-iii.jpg',
      name: 'Sony Xperia 1 III',
      status: 'Đang xử lý',
      price: 28000000,
      amount: 2,
      currentStatus: 'Đang đóng gói',
      paymentStatus: 'Chưa thanh toán',
    },
    {
      id: 6,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/huawei-mate40-pro.jpg',
      name: 'Huawei Mate 40 Pro',
      status: 'Đã huỷ',
      price: 21000000,
      amount: 1,
      currentStatus: 'Đã huỷ',
      paymentStatus: 'Chưa thanh toán',
    },
    {
      id: 7,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/asus-rog-phone-5.jpg',
      name: 'Asus ROG Phone 5',
      status: 'Đang giao',
      price: 23000000,
      amount: 1,
      currentStatus: 'Đang vận chuyển',
      paymentStatus: 'Đã thanh toán',
    },
    {
      id: 8,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x3-pro.jpg',
      name: 'Oppo Find X3 Pro',
      status: 'Đã giao',
      price: 20500000,
      amount: 1,
      currentStatus: 'Đã hoàn thành',
      paymentStatus: 'Trả góp',
    },
    {
      id: 9,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/vivo-x60-pro-plus.jpg',
      name: 'Vivo X60 Pro+',
      status: 'Đang xử lý',
      price: 19500000,
      amount: 2,
      currentStatus: 'Đang đóng gói',
      paymentStatus: 'Chưa thanh toán',
    },
    {
      id: 10,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max-.jpg',
      name: 'iPhone 12 Pro Max',
      status: 'Đang giao',
      price: 19000000,
      amount: 1,
      currentStatus: 'Đang vận chuyển',
      paymentStatus: 'Đã thanh toán',
    },
    {
      id: 11,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/realme-gt-5g.jpg',
      name: 'Realme GT 5G',
      status: 'Đã giao',
      price: 16000000,
      amount: 3,
      currentStatus: 'Đã hoàn thành',
      paymentStatus: 'Đã thanh toán',
    },
    {
      id: 12,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/motorola-edge20-pro-.jpg',
      name: 'Motorola Edge 20 Pro',
      status: 'Đang xử lý',
      price: 15000000,
      amount: 1,
      currentStatus: 'Đang đóng gói',
      paymentStatus: 'Trả góp',
    },
    {
      id: 13,
      image: 'https://fdn2.gsmarena.com/vv/bigpic/nokia-83-5g.jpg',
      name: 'Nokia 8.3 5G',
      status: 'Đã huỷ',
      price: 13500000,
      amount: 1,
      currentStatus: 'Đã huỷ',
      paymentStatus: 'Chưa thanh toán',
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
