import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import './Auth.css'; // Updated import

const Login = () => {
  const navigate = useNavigate(); // Updated hook

  const onFinish = (values) => {
    const { username, password } = values;
    if (username === 'admin' && password === '12345678') {
      console.log('Login successful');
      message.success('Đăng nhập thành công');
      navigate('/catalogs'); // Updated navigation
    } else {
      message.error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="auth-form-container">
          <Form
            name="normal_login"
            className="auth-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <h2 className="auth-title">Đăng Nhập</h2>
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
              <div className="auth-link">
                Hoặc <Link to="/signup">Đăng ký ngay!</Link>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
