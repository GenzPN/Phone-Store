import React, { useState, useEffect } from 'react';
import { Table, Typography, message } from 'antd';

const { Title } = Typography;

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  thumbnail: string;
}

const Test: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
  ];

  return (
    <div>
      <Title level={2}>Product List</Title>
      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default Test;
