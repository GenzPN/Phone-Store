import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Space, Input, Select, DatePicker, Button, Modal, Dropdown, Menu, InputNumber, Form, Radio } from 'antd';
import { DownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

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
  discount: number;
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
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>('http://localhost:5000/api/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error('API did not return an array:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
      setProducts([]);
    }
  };

  useEffect(() => {
    if (productSearch) {
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(productSearch.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

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

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`);
      console.log('Cancel response:', response.data);
      message.success('Đơn hàng đã được hủy');
      // Refresh the orders list
      const ordersResponse = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
      console.log('Updated orders:', ordersResponse.data);
      setData(ordersResponse.data);
    } catch (error) {
      message.error('Không thể hủy đơn hàng');
      console.error('Error cancelling order:', error);
    }
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditedItems(order.items);
    setDiscount(order.discount || 0);
    setIsModalVisible(true);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number | null) => {
    if (newQuantity === null) return;
    setEditedItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleDeleteItem = (itemId: number) => {
    setEditedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const productToAdd = products.find(p => p.id === selectedProduct);
    if (!productToAdd) return;

    setEditedItems(prevItems => [
      ...prevItems,
      {
        id: Date.now(), // temporary id
        product_id: productToAdd.id,
        title: productToAdd.title,
        thumbnail: productToAdd.thumbnail,
        quantity: 1,
        price: productToAdd.price
      }
    ]);
    setSelectedProduct(null);
    setIsAddingProduct(false);
  };

  const calculateDiscount = () => {
    if (discountType === 'percent') {
      const subtotal = editedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = editedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return subtotal - calculateDiscount();
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      await axios.put(`http://localhost:5000/api/orders/${selectedOrder.id}/items`, { 
        items: editedItems,
        discountType,
        discountValue
      });
      message.success('Đơn hàng đã được cập nhật');
      setIsModalVisible(false);
      // Refresh the orders list
      const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
      setData(response.data);
    } catch (error) {
      message.error('Không thể cập nhật đơn hàng');
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'paid':
        return 'orange';
      case 'pending':
        return 'gold';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Đã Giao';
      case 'shipped':
        return 'Đang Giao';
      case 'paid':
        return 'Đã Thanh Toán';
      case 'pending':
        return 'Chờ Xử Lý';
      case 'cancelled':
        return 'Đã Hủy';
      default:
        return 'Không xác định';
    }
  };

  const handleDiscountValueChange = (value: number | null) => {
    if (value === null) return;
    if (discountType === 'percent' && value > 100) {
      setDiscountValue(100);
    } else {
      setDiscountValue(value);
    }
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
      render: (status: string, record: Order) => {
        const menu = (
          <Menu>
            <Menu.Item key="pending" onClick={() => handleStatusChange(record.id, 'pending')}>Chờ Xử Lý</Menu.Item>
            <Menu.Item key="paid" onClick={() => handleStatusChange(record.id, 'paid')}>Đã Thanh Toán</Menu.Item>
            <Menu.Item key="shipped" onClick={() => handleStatusChange(record.id, 'shipped')}>Đang Giao</Menu.Item>
            <Menu.Item key="delivered" onClick={() => handleStatusChange(record.id, 'delivered')}>Đã Giao</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="cancelled" onClick={() => handleCancelOrder(record.id)}>Hủy Đơn Hàng</Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Tag color={getStatusColor(status)} style={{ cursor: 'pointer' }}>
              {getStatusText(status)} <DownOutlined />
            </Tag>
          </Dropdown>
        );
      },
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
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveChanges}>
            Lưu thay đổi
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <p><strong>ID:</strong> {selectedOrder.id}</p>
            <p><strong>Khách hàng:</strong> {selectedOrder.username}</p>
            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
            <p><strong>Trạng thái:</strong> {getStatusText(selectedOrder.status)}</p>
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
                  render: (text: number, record: OrderItem) => (
                    <InputNumber
                      min={1}
                      value={text}
                      onChange={(value) => handleQuantityChange(record.id, value)}
                    />
                  ),
                },
                {
                  title: 'Giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price: number) => `${price.toLocaleString()} VNĐ`,
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  render: (text: string, record: OrderItem) => (
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteItem(record.id)}
                      danger
                    >
                      Xóa
                    </Button>
                  ),
                },
              ]}
              dataSource={editedItems}
              pagination={false}
              rowKey="id"
            />
            <div style={{ marginTop: 16, marginBottom: 16 }}>
              {isAddingProduct ? (
                <>
                  <Select
                    style={{ width: 200, marginRight: 8 }}
                    placeholder="Chọn sản phẩm để thêm"
                    value={selectedProduct}
                    onChange={setSelectedProduct}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onSearch={value => setProductSearch(value)}
                  >
                    {filteredProducts.map(product => (
                      <Option key={product.id} value={product.id}>{product.title}</Option>
                    ))}
                  </Select>
                  <Button type="primary" onClick={handleAddProduct} style={{ marginRight: 8 }}>
                    Thêm
                  </Button>
                  <Button onClick={() => {
                    setIsAddingProduct(false);
                    setProductSearch('');
                  }}>
                    Hủy
                  </Button>
                </>
              ) : (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddingProduct(true)}>
                  Chọn sản phẩm để thêm
                </Button>
              )}
            </div>
            <Form layout="inline" style={{ marginTop: 16 }}>
              <Form.Item label="Loại chiết khấu">
                <Radio.Group
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <Radio.Button value="percent">Phần trăm</Radio.Button>
                  <Radio.Button value="amount">Tiền mặt</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Giá trị chiết khấu">
              <InputNumber
                  value={discountValue}
                  onChange={handleDiscountValueChange}
                  formatter={(value) => 
                    discountType === 'percent'
                      ? `${value}`
                    : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                }
                parser={(value) => parseFloat(value!.replace(/\%|\./g, ''))}
                max={discountType === 'percent' ? 100 : undefined}
                min={0}
                step={discountType === 'percent' ? 1 : 1000}
                style={{ width: 200 }}
                addonAfter={discountType === 'percent' ? '%' : 'đ'}
              />
              </Form.Item>
              <Form.Item label="Tổng tiền">
                <Input
                  value={`${calculateTotal().toLocaleString('vi-VN')} đ`}
                  readOnly
                  style={{ width: 200 }}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;