import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Row, Col, Image, AutoComplete, Tabs, Button, Input, Avatar, Badge } from "antd";
import { SearchOutlined, UserOutlined, ShoppingOutlined, LogoutOutlined, FileTextOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown } from 'antd';
import styles from './Header.module.css';
import { useConfig } from '../../hook/useConfig';
import { useCart } from '../../contexts/CartContext'; // Thêm import này

interface User {
  image: string;
  fullName: string;
  username: string;
  isAdmin?: boolean; // Thêm thuộc tính này
}

interface HeaderProps {
  brands: string[];
  user: User | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ brands, user, onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const config = useConfig();
  const { cartItems } = useCart(); // Sử dụng hook useCart

  // Sample data for AutoComplete
  const options = [
    { value: 'iPhone 13' },
    { value: 'iPhone 13 Pro' },
    { value: 'iPhone 13 Pro Max' },
    { value: 'iPhone 12' },
    { value: 'iPhone 12 Pro' },
    { value: 'iPhone SE' },
    { value: 'Apple Watch Series 7' },
    { value: 'iPad Pro' },
    { value: 'MacBook Air' },
    { value: 'MacBook Pro' },
  ];

  const getActiveKey = () => {
    if (currentPath === '/') return 'home';
    if (currentPath === '/products') return 'products';
    const brand = brands.find(brand => currentPath.includes(`/brand/${brand.toLowerCase()}`));
    return brand || 'home';
  };

  const items = [
    {
      key: 'home',
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: 'products',
      label: <Link to="/products">Sản phẩm</Link>,
    },
    ...brands.map(brand => ({
      key: brand,
      label: <Link to={`/brand/${brand.toLowerCase()}`}>{brand}</Link>,
    }))
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Hồ sơ</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'orders',
      label: <Link to="/order">Đơn hàng của tôi</Link>,
      icon: <FileTextOutlined />,
    },
    // Thêm mục menu admin nếu user là admin
    ...(user?.isAdmin ? [{
      key: 'admin',
      label: <Link to="/admin">Quản trị</Link>,
      icon: <SettingOutlined />,
    }] : []),
    {
      key: 'logout',
      label: (
        <span onClick={() => onLogout()}>
          Đăng xuất
        </span>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <header className={styles.header}>
      <Row justify="space-between" align="middle" className={styles.topRow}>
        <Col span={4} className={styles.logoCol}>
          <Image
            width={80}
            src={config?.logo || "https://github.com/fluidicon.png"}
            alt={config?.name || "Store Logo"}
            preview={false}
          />
        </Col>
        <Col span={15} className={styles.searchCol}>
          <AutoComplete
            options={options}
            style={{ width: '100%' }}
            filterOption={(inputValue, option) =>
              option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          >
            <Input
              size="large"
              placeholder="Nhập thứ cần tìm..."
              prefix={<SearchOutlined />}
              className={styles.searchInput}
            />
          </AutoComplete>
        </Col>
        <Col span={5} className={styles.userAndCartCol}>
          <Row gutter={8} justify="end" align="middle">
            <Col>
              {user ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Button type="link" className={styles.iconTextButton}>
                    <Avatar src={user.image} alt={user.fullName || user.username} />
                    <span>{user.fullName || user.username}</span>
                  </Button>
                </Dropdown>
              ) : (
                <Link to="/api/auth">
                  <Button type="link" className={styles.iconTextButton}>
                    <UserOutlined className={styles.icon} />
                    <span>Đăng nhập</span>
                  </Button>
                </Link>
              )}
            </Col>
            <Col>
              <Link to="/cart">
                <Badge count={cartItems.length} showZero>
                  <Button type="link" className={styles.iconTextButton}>
                    <ShoppingOutlined className={styles.icon} />
                    <span>Giỏ hàng</span>
                  </Button>
                </Badge>
              </Link>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row justify="center" className={styles.brandRow}>
        <Tabs activeKey={getActiveKey()} className={styles.brandTabs} items={items} />
      </Row>
    </header>
  );
};

export default Header;