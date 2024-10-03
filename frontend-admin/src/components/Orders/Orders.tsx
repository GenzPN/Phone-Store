import React, { useEffect, useState } from 'react';
import { Table, Tag, message, Space, Input, Select, DatePicker, Button, Modal, Dropdown, Menu, InputNumber, Form, Radio, Card, AutoComplete } from 'antd';
import { DownOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios, { isAxiosError } from 'axios';
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
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  status: string;
  total_amount: number;
  discount_value: number;
  discount_type: 'percent' | 'amount' | null;
  created_at: string;
  items: OrderItem[];
  shipping_address_id?: number;
  note?: string;
}

interface UpdateOrderData {
  id: number;
  shipping_address_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  items: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  status: string;
  note?: string;
  user_id: number;
  discount_type?: 'percent' | 'amount';
  discount_value?: number;
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customerForm] = Form.useForm();
  const [productOptions, setProductOptions] = useState<{ value: number; label: string }[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
        console.log('Fetched orders:', response.data);
        setData(response.data);
        setFilteredData(response.data); // Initialize filteredData with all orders
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
      const response = await axios.get<{ products: Product[] }>('http://localhost:5000/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
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
      result = result.filter(order => order.customer_name.toLowerCase().includes(filters.username.toLowerCase()));
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
      // Cập nhật lại danh sách đơn hàng
      fetchOrders();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái đơn hàng');
      console.error('Error updating order status:', error);
    }
  };

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditedItems(order.items || []);
    setDiscount(order.discount_value || 0);
    setDiscountType(order.discount_type || 'amount');
    setDiscountValue(order.discount_value || 0);
    customerForm.setFieldsValue({
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      address: order.address,
    });
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

  const handleAddProduct = (productToAdd: Product) => {
    const existingItem = editedItems.find(item => item.product_id === productToAdd.id);

    if (existingItem) {
      setEditedItems(prevItems =>
        prevItems.map(item =>
          item.product_id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
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
    }
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
    if (discountType === 'percent') {
      return subtotal * (1 - discountValue / 100);
    } else {
      return subtotal - discountValue;
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      const customerInfo = customerForm.getFieldsValue();
      const totalAmount = calculateTotal();

      const updatedOrderData: UpdateOrderData = {
        id: selectedOrder.id,
        shipping_address_id: selectedOrder.shipping_address_id,
        customer_name: customerInfo.customer_name,
        customer_email: customerInfo.customer_email,
        customer_phone: customerInfo.customer_phone,
        address: customerInfo.address,
        items: editedItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: totalAmount,
        status: selectedOrder.status,
        note: selectedOrder.note,
        user_id: selectedOrder.user_id
      };

      if (discountType) {
        updatedOrderData.discount_type = discountType;
      }
      if (discountValue !== undefined) {
        updatedOrderData.discount_value = discountValue;
      }

      const response = await axios.put(`http://localhost:5000/api/admin/orders/${selectedOrder.id}`, updatedOrderData);
      message.success('Đơn hàng đã được cập nhật');
      setIsModalVisible(false);
      fetchOrders();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error updating order:', error.response?.data || error.message);
      } else {
        console.error('Error updating order:', error);
      }
      message.error('Không thể cập nhật đơn hàng');
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

  const handleProductSearch = (value: string) => {
    const filtered = products.filter(product => 
      product.title.toLowerCase().includes(value.toLowerCase())
    );
    setProductOptions(filtered.map(product => ({
      value: product.id,
      label: `${product.title} - ${product.price.toLocaleString()} VNĐ`
    })));
  };

  const handleProductSelect = (value: number) => {
    const selectedProduct = products.find(p => p.id === value);
    if (selectedProduct) {
      handleAddProduct(selectedProduct);
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
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Thông tin giao hàng',
      key: 'shipping',
      render: (text: string, record: Order) => (
        <Space direction="vertical">
          <span>{record.customer_name || 'N/A'}</span>
          <span>{record.customer_phone || 'N/A'}</span>
          <span>{record.address || 'N/A'}</span>
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
            <Menu.Item key="cancelled" onClick={() => handleStatusChange(record.id, 'cancelled')}>Đã Hủy</Menu.Item>
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
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (total: number | undefined) => {
        if (typeof total === 'number') {
          return `${total.toLocaleString()} VNĐ`;
        }
        return 'N/A';
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Order[]>('http://localhost:5000/api/orders/all');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchOrders trong useEffect
  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm để mở modal tạo đơn hàng mới
  const showCreateOrderModal = () => {
    setIsCreateModalVisible(true);
  };

  // Hàm để đóng modal tạo đơn hàng mới
  const handleCreateModalCancel = () => {
    setIsCreateModalVisible(false);
    createForm.resetFields();
  };

  // Hàm để tạo đơn hàng mới
  const handleCreateOrder = async (values: any) => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders', values);
      message.success('Đơn hàng đã được tạo thành công');
      setIsCreateModalVisible(false);
      createForm.resetFields();
      fetchOrders(); // Tải lại danh sách đơn hàng
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể tạo đơn hàng');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Quản lý đơn hàng</h2>
        <Button type="primary" onClick={showCreateOrderModal} style={{ marginBottom: '20px' }}>
          Tạo đơn hàng mới
        </Button>
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>
      <Card title="Bộ lọc" style={{ width: 300 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
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
            style={{ width: '100%' }}
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
            style={{ width: '100%' }}
          />
        </Space>
      </Card>

      {/* Modal tạo đơn hàng mới */}
      <Modal
        title="Tạo đơn hàng mới"
        visible={isCreateModalVisible}
        onCancel={handleCreateModalCancel}
        footer={null}
      >
        <Form form={createForm} onFinish={handleCreateOrder} layout="vertical">
          <Form.Item name="user_id" label="ID Khách hàng (nếu có)">
            <Input />
          </Form.Item>
          <Form.Item name="customer_name" label="Tên khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customer_email" label="Email khách hàng" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customer_phone" label="Số điện thoại khách hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="address_type" label="Loại địa chỉ">
            <Select>
              <Option value="home">Nhà riêng</Option>
              <Option value="company">Công ty</Option>
            </Select>
          </Form.Item>
          <Form.Item name="company_name" label="Tên công ty">
            <Input />
          </Form.Item>
          <Form.Item name="address_id" label="ID Địa chỉ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* Thêm các trường khác như items, total_amount, status, note, discount_type, discount_value */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo đơn hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết đơn hàng */}
      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        visible={isModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveChanges}>
            Lưu thay đổi
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <Card title="Thông tin khách hàng" style={{ marginBottom: '24px' }}>
                <Form form={customerForm} layout="vertical">
                  <Form.Item name="customer_name" label="Tên khách hàng">
                    <Input />
                  </Form.Item>
                  <Form.Item name="customer_email" label="Email">
                    <Input />
                  </Form.Item>
                  <Form.Item name="customer_phone" label="Số điện thoại">
                    <Input />
                  </Form.Item>
                  <Form.Item name="address" label="Địa chỉ">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Form>
              </Card>
              <Card title="Thông tin đơn hàng">
                <p><strong>ID:</strong> {selectedOrder.id}</p>
                <p><strong>Khách hàng:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Trạng thái:</strong> <Tag color={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Tag></p>
                <p><strong>Ngày đặt hàng:</strong> {dayjs(selectedOrder.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>
              </Card>
            </div>
            <div style={{ flex: 2 }}>
              <Card title="Sản phẩm" style={{ marginBottom: '24px' }}>
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
                <div style={{ marginTop: '16px' }}>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={productOptions}
                    onSearch={handleProductSearch}
                    onSelect={handleProductSelect}
                    placeholder="Tìm và chọn sản phẩm để thêm"
                  />
                </div>
              </Card>
              <Card title="Tổng kết">
                <Form layout="horizontal">
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
                          ? `${value}%`
                          : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                      }
                      parser={(value) => parseFloat(value!.replace(/\%|\./g, ''))}
                      max={discountType === 'percent' ? 100 : undefined}
                      min={0}
                      step={discountType === 'percent' ? 1 : 1000}
                      style={{ width: 200 }}
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
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;