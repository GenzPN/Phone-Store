import React from 'react';
import { OrderEmail } from './input/order';

const sampleData = {
  orderId: "18",
  customerName: "Văn Đức",
  customerAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  customerPhone: "0964747524",
  orderDate: "07/10/2024",
  orderStatus: "Đã thanh toán",
  products: [
    {
      name: "iPhone 16 Pro Max",
      category: "Điện thoại",
      quantity: 3,
      price: 34990000
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      category: "Điện thoại",
      quantity: 3,
      price: 32990000
    }
  ]
};

// Hàm để tính tổng số tiền và định dạng giá tiền
const calculateTotalAmount = (products) => {
  const total = products.reduce((total, product) => total + product.price * product.quantity, 0);
  return total.toLocaleString('vi-VN');
};

// Hàm để định dạng giá tiền cho từng sản phẩm
const formatPrice = (price) => price.toLocaleString('vi-VN');

export default function Preview() {
  const totalAmount = calculateTotalAmount(sampleData.products);
  const formattedProducts = sampleData.products.map(product => ({
    ...product,
    price: formatPrice(product.price)
  }));
  
  return (
    <OrderEmail 
      {...sampleData} 
      products={formattedProducts}
      totalAmount={`${totalAmount} VND`}
    />
  );
}