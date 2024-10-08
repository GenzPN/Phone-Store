import React from 'react';
import { OrderEmail } from './order';

const sampleData = {
  orderId: "9",
  customerName: "Văn Đức",
  orderDate: "07/10/2024 13:22:45",
  orderStatus: "Đã thanh toán",
  totalAmount: "69.980.000 VND",
  products: [
    {
      name: "iPhone 16 Pro Max",
      category: "Điện thoại",
      quantity: 2,
      price: "34.990.000 VND"
    },
    {
      name: "AirPods Pro 2",
      category: "Tai nghe",
      quantity: 2,
      price: "1.990.000 VND"
    }
  ]
};

export default function Preview() {
  return (
    <OrderEmail {...sampleData} />
  );
}