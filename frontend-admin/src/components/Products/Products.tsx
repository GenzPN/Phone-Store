import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, InputNumber, Select, List } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  thumbnail: string;
  images: string[];
  category: string;
  screen: string;
  back_camera: string;
  front_camera: string;
  ram: string;
  storage: string;
  battery: string;
  sku: string;
  warranty_information: string;
  shipping_information: string;
  availability_status: string;
  return_policy: string;
  minimum_order_quantity: number;
  discount_percentage: number;
  is_featured: number;
  featured_sort_order: number;
  brand: string;
  description: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Chưa có giá';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const CustomImageUpload: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: 8, marginBottom: 8 }}>
        <img
          src={value || 'https://via.placeholder.com/100'}
          alt="Preview"
          style={{ width: 100, height: 100, objectFit: 'contain' }}
        />
      </div>
      <Input
        placeholder="Nhập URL ảnh"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{ flex: 1 }}
      />
    </div>
  );
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [currentReviews, setCurrentReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchProducts = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const brandQuery = brandFilter.length > 0 ? `&brand=${brandFilter.join(',')}` : '';
      const isFeaturedQuery = isFeaturedFilter !== null ? `&isFeatured=${isFeaturedFilter}` : '';
      const response = await axios.get(`http://localhost:5000/api/products?page=${page}&limit=${pageSize}${brandQuery}${isFeaturedQuery}`);
      setProducts(response.data.products);
      setPagination({
        current: response.data.currentPage,
        pageSize: pageSize,
        total: response.data.totalProducts,
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      message.error('Không thể lấy danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [brandFilter, isFeaturedFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      price: record.price,
      images: record.images || [],
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (record: Product) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${record.id}`);
      message.success('Sản phẩm đã được xóa thành công');
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedProduct = {
        ...values,
        price: Number(values.price) || 0,
        stock: Number(values.stock),
        minimum_order_quantity: Number(values.minimum_order_quantity),
        discount_percentage: Number(values.discount_percentage),
        is_featured: Number(values.is_featured),
        featured_sort_order: Number(values.featured_sort_order),
        brand: values.brand,
        description: values.description
      };
      console.log('Updated Product:', updatedProduct);
  
      await axios.put(`http://localhost:5000/api/admin/products/${editingProduct?.id}`, updatedProduct, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      message.success('Sản phẩm đã được cập nhật thành công');
      setEditModalVisible(false);
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'Không thể cập nhật sản phẩm');
      } else {
        message.error('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
      }
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
    fetchProducts(pagination.current, pagination.pageSize);
  };

  const handleViewReviews = async (productId: number) => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
      setCurrentReviews(response.data);
      setReviewModalVisible(true);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      message.error('Không thể lấy đánh giá sản phẩm');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setAddModalVisible(true);
  };

  const handleAddModalOk = async () => {
    try {
      const values = await addForm.validateFields();
      const newProduct = {
        ...values,
        price: Number(values.price) || 0,
        stock: Number(values.stock),
        minimum_order_quantity: Number(values.minimum_order_quantity),
        discount_percentage: Number(values.discount_percentage),
        is_featured: Number(values.is_featured),
        featured_sort_order: Number(values.featured_sort_order),
      };

      await axios.post('http://localhost:5000/api/admin/products', newProduct, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      message.success('Sản phẩm đã được thêm thành công');
      setAddModalVisible(false);
      addForm.resetFields();
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      if (axios.isAxiosError(error) && error.response) {
        message.error(error.response.data.message || 'Không thể thêm sản phẩm');
      } else {
        message.error('Không thể thêm sản phẩm. Vui lòng thử lại sau.');
      }
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (text: string) => (
        <div style={{ width: 50, height: 50, overflow: 'hidden' }}>
          <img 
            src={text} 
            alt="Product" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              objectPosition: 'center'
            }} 
          />
        </div>
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number | null | undefined) => formatCurrency(price),
    },
    {
      title: 'Số lượng',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger>
            Xóa
          </Button>
          <Button icon={<StarOutlined />} onClick={() => handleViewReviews(record.id)}>
            Đánh giá
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Danh sách sản phẩm</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddProduct}
        >
          Thêm sản phẩm
        </Button>
        <Select
          mode="multiple"
          placeholder="Lọc theo thương hiệu"
          onChange={setBrandFilter}
          style={{ width: 200 }}
        >
          <Option value="Apple">Apple</Option>
          <Option value="Samsung">Samsung</Option>
          <Option value="Xiaomi">Xiaomi</Option>
          {/* Thêm các thương hiệu khác nếu cần */}
        </Select>
        <Select
          placeholder="Lọc theo nổi bật"
          onChange={setIsFeaturedFilter}
          style={{ width: 200 }}
          allowClear
        >
          <Option value="1">Nổi bật</Option>
          <Option value="0">Không nổi bật</Option>
        </Select>
      </Space>
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        style={{ background: 'white' }}
        bordered
      />
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditModalOk}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="title" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="thumbnail" label="Ảnh Thumbnail" rules={[{ required: true }]}>
            <CustomImageUpload />
          </Form.Item>
          <Form.Item name="images" label="Ảnh Chi tiết">
            <Form.List name="images">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => {
                    // Tách key ra khỏi field
                    const { key, ...restField } = field;
                    return (
                      <Form.Item
                        key={key}
                        {...restField}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập URL ảnh hoặc xóa trường này.",
                          },
                        ]}
                        noStyle
                      >
                        <CustomImageUpload />
                      </Form.Item>
                    );
                  })}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm ảnh
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Giá" 
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 0, message: 'Giá phải là số dương' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value!.replace(/\./g, '')}
              step={1000}
              addonAfter="đ"
            />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}>
            <Select>
              <Option value="Apple">Apple</Option>
              <Option value="Samsung">Samsung</Option>
              <Option value="Xiaomi">Xiaomi</Option>
              <Option value="Oppo">Oppo</Option>
              <Option value="Vivo">Vivo</Option>
              <Option value="Realme">Realme</Option>
              <Option value="Asus">Asus</Option>
              <Option value="Acer">Acer</Option>
              <Option value="HP">HP</Option>
              <Option value="Dell">Dell</Option>
              <Option value="Lenovo">Lenovo</Option>
              <Option value="Microsoft">Microsoft</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="stock" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
            <Select>
              <Option value="smartphone">Điện thoại</Option>
              <Option value="tablet">Máy tính bảng</Option>
              <Option value="laptop">Laptop</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="warranty_information" label="Thông tin bảo hành" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shipping_information" label="Thông tin giao hàng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="availability_status" label="Tình trạng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="return_policy" label="Chính sách đổi trả" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="minimum_order_quantity" label="Số lượng đặt hàng tối thiểu" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="discount_percentage" label="Phần trăm giảm giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
          <Form.Item name="is_featured" label="Nổi bật" rules={[{ required: true }]}>
            <Select>
              <Option value={1}>Có</Option>
              <Option value={0}>Không</Option>
            </Select>
          </Form.Item>
          <Form.Item name="featured_sort_order" label="Thứ tự nổi bật" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <h3>Chi tiết</h3>
          <Form.Item name="screen" label="Màn hình">
            <Input />
          </Form.Item>
          <Form.Item name="back_camera" label="Camera sau">
            <Input />
          </Form.Item>
          <Form.Item name="front_camera" label="Camera trước">
            <Input />
          </Form.Item>
          <Form.Item name="ram" label="RAM">
            <Input />
          </Form.Item>
          <Form.Item name="storage" label="Bộ nhớ trong">
            <Input />
          </Form.Item>
          <Form.Item name="battery" label="Pin">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Đánh giá sản phẩm"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {reviewsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Đang tải đánh giá...
          </div>
        ) : currentReviews.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={currentReviews}
            renderItem={(review) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      {review.reviewer_name} - {review.rating} sao
                      <span style={{ float: 'right', fontSize: '0.8em', color: '#888' }}>
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </span>
                  }
                  description={<p>{review.comment}</p>}
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Không có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </Modal>
      
      {/* Add Product Modal */}
      <Modal
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddModalOk}
        title="Thêm sản phẩm mới"
        width={800}
      >
        <Form form={addForm} layout="vertical">
          {/* Add the same form fields as in the edit modal */}
          <Form.Item name="title" label="Tên" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>
          <Form.Item name="thumbnail" label="Ảnh Thumbnail" rules={[{ required: true }]}>
            <Input placeholder="Nhập URL ảnh thumbnail" />
          </Form.Item>
          <Form.Item name="images" label="Ảnh Chi tiết">
            <Form.List name="images">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => {
                    // Tách key ra khỏi field
                    const { key, ...restField } = field;
                    return (
                      <Form.Item
                        key={key}
                        {...restField}
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập URL ảnh hoặc xóa trường này.",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="Nhập URL ảnh chi tiết" />
                      </Form.Item>
                    );
                  })}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm ảnh
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item 
            name="price" 
            label="Giá" 
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 0, message: 'Giá phải là số dương' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value!.replace(/\./g, '')}
              step={1000}
              addonAfter="đ"
              placeholder="Nhập giá"
            />
          </Form.Item>
          <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}>
            <Select placeholder="Chọn thương hiệu">
              <Option value="Apple">Apple</Option>
              <Option value="Samsung">Samsung</Option>
              <Option value="Xiaomi">Xiaomi</Option>
              <Option value="Oppo">Oppo</Option>
              <Option value="Vivo">Vivo</Option>
              <Option value="Realme">Realme</Option>
              <Option value="Asus">Asus</Option>
              <Option value="Acer">Acer</Option>
              <Option value="HP">HP</Option>
              <Option value="Dell">Dell</Option>
              <Option value="Lenovo">Lenovo</Option>
              <Option value="Microsoft">Microsoft</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>
          <Form.Item name="stock" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng" />
          </Form.Item>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
            <Select placeholder="Chọn danh mục">
              <Option value="smartphone">Điện thoại</Option>
              <Option value="tablet">Máy tính bảng</Option>
              <Option value="laptop">Laptop</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input placeholder="Nhập SKU" />
          </Form.Item>
          <Form.Item name="warranty_information" label="Thông tin bảo hành" rules={[{ required: true }]}>
            <Input placeholder="Nhập thông tin bảo hành" />
          </Form.Item>
          <Form.Item name="shipping_information" label="Thông tin giao hàng" rules={[{ required: true }]}>
            <Input placeholder="Nhập thông tin giao hàng" />
          </Form.Item>
          <Form.Item name="availability_status" label="Tình trạng" rules={[{ required: true }]}>
            <Input placeholder="Nhập tình trạng" />
          </Form.Item>
          <Form.Item name="return_policy" label="Chính sách đổi trả" rules={[{ required: true }]}>
            <Input placeholder="Nhập chính sách đổi trả" />
          </Form.Item>
          <Form.Item name="minimum_order_quantity" label="Số lượng đặt hàng tối thiểu" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng đặt hàng tối thiểu" />
          </Form.Item>
          <Form.Item name="discount_percentage" label="Phần trăm giảm giá" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} addonAfter="%" placeholder="Nhập phần trăm giảm giá" />
          </Form.Item>
          <Form.Item name="is_featured" label="Nổi bật" rules={[{ required: true }]}>
            <Select placeholder="Chọn có/không">
              <Option value={1}>Có</Option>
              <Option value={0}>Không</Option>
            </Select>
          </Form.Item>
          <Form.Item name="featured_sort_order" label="Thứ tự nổi bật" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Nhập thứ tự nổi bật" />
          </Form.Item>
          <h3>Chi tiết</h3>
          <Form.Item name="screen" label="Màn hình">
            <Input placeholder="Nhập chi tiết màn hình" />
          </Form.Item>
          <Form.Item name="back_camera" label="Camera sau">
            <Input placeholder="Nhập chi tiết camera sau" />
          </Form.Item>
          <Form.Item name="front_camera" label="Camera trước">
            <Input placeholder="Nhập chi tiết camera trước" />
          </Form.Item>
          <Form.Item name="ram" label="RAM">
            <Input placeholder="Nhập chi tiết RAM" />
          </Form.Item>
          <Form.Item name="storage" label="Bộ nhớ trong">
            <Input placeholder="Nhập chi tiết bộ nhớ trong" />
          </Form.Item>
          <Form.Item name="battery" label="Pin" rules={[{ required: true }]}>
            <Input placeholder="4422 mAh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;