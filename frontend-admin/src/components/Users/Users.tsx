import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Select } from 'antd';
import axios from 'axios';
import { getToken, getCookie } from '../../utils/tokenStorage';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  image: string;
  isAdmin: boolean;
}

const Users: React.FC = () => {
  // Remove this line:
  // const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken() || getCookie('accessToken');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      message.error('Không thể lấy danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = getToken() || getCookie('accessToken');
      await axios.put(`http://localhost:5000/api/users/${editingUser?.id}`, values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Thông tin người dùng đã được cập nhật thành công');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      message.error('Không thể cập nhật thông tin người dùng');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => (
        <img src={text} alt="User" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Quản trị viên',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (isAdmin ? 'Có' : 'Không'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Sửa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditModalOk}
        title="Chỉnh sửa thông tin người dùng"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="image" label="Ảnh" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isAdmin" label="Quản trị viên" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
