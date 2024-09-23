import React from 'react';
import { Table } from 'antd';

const Products = () => {
  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text) => (
        <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Số lượng',
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  const data = [
    {
        "id": "1",
        "name": "Samsung Galaxy S21 Ultra",
        "price": "25,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s21-ultra-5g-.jpg",
        "amount": 302
    },
    {
        "id": "2",
        "name": "Xiaomi Mi 11 Ultra",
        "price": "22,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-mi11-ultra-5g-k1.jpg",
        "amount": 206
    },
    {
        "id": "3",
        "name": "Google Pixel 6 Pro",
        "price": "18,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-6-pro.jpg",
        "amount": 255
    },
    {
        "id": "4",
        "name": "OnePlus 9 Pro",
        "price": "17,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/oneplus-9-pro-.jpg",
        "amount": 153
    },
    {
        "id": "5",
        "name": "Sony Xperia 1 III",
        "price": "28,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-iii.jpg",
        "amount": 106
    },
    {
        "id": "6",
        "name": "Huawei Mate 40 Pro",
        "price": "21,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/huawei-mate40-pro.jpg",
        "amount": 185
    },
    {
        "id": "7",
        "name": "Asus ROG Phone 5",
        "price": "23,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/asus-rog-phone-5.jpg",
        "amount": 229
    },
    {
        "id": "8",
        "name": "Oppo Find X3 Pro",
        "price": "20,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x3-pro.jpg",
        "amount": 124
    },
    {
        "id": "9",
        "name": "Vivo X60 Pro+",
        "price": "19,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/vivo-x60-pro-plus.jpg",
        "amount": 1745
    },
    {
        "id": "10",
        "name": "iPhone 12 Pro Max",
        "price": "19,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max-.jpg",
        "amount": 455
    },
    {
        "id": "11",
        "name": "Realme GT 5G",
        "price": "16,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/realme-gt-5g.jpg",
        "amount": 307
    },
    {
        "id": "12",
        "name": "Motorola Edge 20 Pro",
        "price": "15,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-edge20-pro-.jpg",
        "amount": 208
    },
    {
        "id": "13",
        "name": "Nokia 8.3 5G",
        "price": "13,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/nokia-83-5g.jpg",
        "amount": 253
    },
    {
        "id": "14",
        "name": "Poco F3",
        "price": "12,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-poco-f3.jpg",
        "amount": 404
    },
    {
        "id": "15",
        "name": "ZTE Axon 30 Ultra",
        "price": "14,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/zte-axon-30-ultra.jpg",
        "amount": 183
    },
    {
        "id": "16",
        "name": "Honor Magic 3 Pro",
        "price": "22,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/honor-magic3-pro.jpg",
        "amount": 122
    },
    {
        "id": "17",
        "name": "Xiaomi Redmi Note 10 Pro",
        "price": "9,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note10-pro.jpg",
        "amount": 355
    },
    {
        "id": "18",
        "name": "LG Wing 5G",
        "price": "18,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/lg-wing.jpg",
        "amount": 1047
    },
    {
        "id": "19",
        "name": "Lenovo Legion Duel 2",
        "price": "19,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-2-pro-phone-duel2-1.jpg",
        "amount": 254
    },
    {
        "id": "20",
        "name": "TCL 20 Pro 5G",
        "price": "12,500,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/tcl-20-pro-5g.jpg",
        "amount": 282
    },
    {
        "id": "21",
        "name": "iPhone 15 Pro Max",
        "price": "27,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg",
        "amount": 10920
    },
    {
        "id": "22",
        "name": "Samsung Galaxy Z Fold 6",
        "price": "30,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg",
        "amount": 5556
    },
    {
        "id": "23",
        "name": "Xiaomi 13",
        "price": "15,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-redmi-note-13-5g.jpg",
        "amount": 833
    },
    {
        "id": "24",
        "name": "iPhone 7",
        "price": "6,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-7r4.jpg",
        "amount": 121
    },
    {
        "id": "25",
        "name": "Motorola G5S Plus",
        "price": "5,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/motorola-moto-g5s.jpg",
        "amount": 76
    },
    {
        "id": "26",
        "name": "Galaxy J7 Pro",
        "price": "2,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-j7-pro.jpg",
        "amount": 152
    },
    {
        "id": "27",
        "name": "Lenovo Legion Duel 2",
        "price": "7,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/lenovo-legion-2-pro-phone-duel2-1.jpg",
        "amount": 31
    },
    {
        "id": "28",
        "name": "Galaxy S8+",
        "price": "5,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s8-plus-.jpg",
        "amount": 92
    },
    {
        "id": "29",
        "name": "iPhone 13 Pro Max",
        "price": "20,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg",
        "amount": 62
    },
    {
        "id": "30",
        "name": "iPhone 12 Pro Max",
        "price": "19,000,000 VND",
        "image": "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-12-pro-max-.jpg",
        "amount": 45
    }
  ];

  return (
    <div>
      <h2 style={{ marginRight: '20px', minWidth: '200px' }}>Danh sách sản phẩm</h2>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
};

export default Products;
