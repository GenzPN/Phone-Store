import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message, Tabs, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const { TabPane } = Tabs;

interface AuthProps {
  onLogin: (userData: any, accessToken: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState('login');

  useEffect(() => {
    // Set active key based on the current path
    if (location.pathname === '/api/auth/register') {
      setActiveKey('register');
    } else {
      setActiveKey('login');
    }
  }, [location.pathname]);

  const onFinishLogin = async (values: { username: string; password: string }) => {
    const { username, password } = values;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful, data:', data);
        message.success('Đăng nhập thành công');
        onLogin(data.user, data.accessToken);
        navigate('/');
      } else {
        message.error(data.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };

  const onFinishRegister = async (values: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    gender: string;
  }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Đăng ký thành công');
        form.setFieldsValue({ username: values.username, password: '' });
        setActiveKey('login'); // Chuyển sang tab đăng nhập
      } else {
        const data = await response.json();
        message.error(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    navigate(key === 'login' ? '/api/auth/login' : '/api/auth/register');
  };

  const handleClose = () => {
    const { state } = location;
    if (state && state.from) {
      navigate(state.from);
    } else {
      navigate('/'); // Điều hướng về trang chủ nếu không có trang trước đó
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="auth-form-container">
          <Button 
            icon={<CloseOutlined />} 
            onClick={handleClose}
            className="close-button"
            type="text"
          />
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            <TabPane tab="Đăng Nhập" key="login">
              <Form
                name="normal_login"
                className="auth-form"
                initialValues={{ remember: true }}
                onFinish={onFinishLogin}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Mật khẩu"
                  />
                </Form.Item>
                <Form.Item>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="auth-form-button">
                    Đăng Nhập
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Đăng Ký" key="register">
              <Form
                form={form}
                name="register"
                className="auth-form"
                onFinish={onFinishRegister}
              >
                <Form.Item
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Họ và tên" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item
                  name="gender"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                >
                  <Radio.Group>
                    <Radio value="male">Nam</Radio>
                    <Radio value="female">Nữ</Radio>
                    <Radio value="other">Khác</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                >
                  <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Mật khẩu"
                  />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" className="auth-form-button">
                    Đăng Ký
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
