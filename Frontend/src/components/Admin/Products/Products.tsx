import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, InputNumber, Select, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

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
}


const CustomImageUpload: React.FC<{ value?: string; onChange?: (value: string) => void }> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: 8, marginBottom: 8 }}>
        <img
          src={value || 'https://via.placeholder.com/100'}
          alt="Preview"
          style={{ width: 100, height: 100, objectFit: 'cover' }}
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
      const response = await fetch(`http://localhost:5000/api/products?page=${page}&limit=${pageSize}${brandQuery}${isFeaturedQuery}`);
      const data = await response.json();
      setProducts(data.products);
      setPagination({
        current: data.currentPage,
        pageSize: pageSize,
        total: data.totalProducts,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [brandFilter, isFeaturedFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleTableChange = (pagination: any) => {
    fetchProducts(pagination.current, pagination.pageSize); 
  };    
  
  const handleBrandFilterChange = (value: string[]) => {    
    setBrandFilter(value);  
    fetchProducts(pagination.current, pagination.pageSize); 
  };

  const handleIsFeaturedFilterChange = (value: string | null) => {
    setIsFeaturedFilter(value);
    fetchProducts(pagination.current, pagination.pageSize);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      images: record.images || [],
      category: record.category,
      screen: record.screen,
      back_camera: record.back_camera,
      front_camera: record.front_camera,
      ram: record.ram,
      storage: record.storage,
      battery: record.battery,
      sku: record.sku,
      warranty_information: record.warranty_information,
      shipping_information: record.shipping_information,
      availability_status: record.availability_status,
      return_policy: record.return_policy,
      minimum_order_quantity: record.minimum_order_quantity,
      discount_percentage: record.discount_percentage,
      is_featured: record.is_featured,
      featured_sort_order: record.featured_sort_order
    });
    setEditModalVisible(true);
  };

  const handleDelete = async (record: Product) => {
    try {
      await fetch(`http://localhost:5000/api/products/${record.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin': 'true'
        }
      });
      message.success('Sản phẩm đã được xóa thành công');
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  const handleEditModalOk = () => {
    form.validateFields().then(async (values) => {
      const updatedProduct = {
        ...values,
        images: JSON.stringify(values.images) // Chuyển images sang định dạng JSON
      };
      console.log('Updated Product:', updatedProduct); // Thêm dòng này để kiểm tra dữ liệu
      try {
        await fetch(`http://localhost:5000/api/products/${editingProduct?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin': 'true'
          },
          body: JSON.stringify(updatedProduct)
        });
        message.success('Sản phẩm đã được cập nhật thành công');
        setEditModalVisible(false);
        fetchProducts(pagination.current, pagination.pageSize);
      } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        message.error('Không thể cập nhật sản phẩm');
      }
    });
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
              objectFit: 'cover',
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách sản phẩm</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select
          mode="multiple"
          placeholder="Lọc theo thương hiệu"
          onChange={handleBrandFilterChange}
          style={{ width: 200 }}
        >
          <Option value="Apple">Apple</Option>
          <Option value="Samsung">Samsung</Option>
          <Option value="Xiaomi">Xiaomi</Option>
          {/* Thêm các thương hiệu khác nếu cần */}
        </Select>
        <Select
          placeholder="Lọc theo nổi bật"
          onChange={handleIsFeaturedFilterChange}
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
        title="Chỉnh sửa sản phẩm"
        visible={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={() => setEditModalVisible(false)}
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
                  {fields.map((field, index) => (
                    <Form.Item required={false} key={field.key}>
                      <Form.Item
                        {...field}
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
                      {fields.length > 1 ? (
                        <Button type="link" onClick={() => remove(field.name)} style={{ marginLeft: 8 }}>
                          Xóa
                        </Button>
                      ) : null}
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm ảnh
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
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
    </div>
  );
};

export default Products;
