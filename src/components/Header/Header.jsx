import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Row, Col, Image, AutoComplete, Tabs, Button, Input, Avatar } from "antd";
import { SearchOutlined, UserOutlined, ShoppingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown } from 'antd';
import styles from './Header.module.css';

const Header = ({ brands, user, onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

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
    const brand = brands.find(brand => currentPath.includes(`/brand/${brand.toLowerCase()}`));
    return brand || 'home';
  };

  const items = [
    {
      key: 'home',
      label: <Link to="/">Trang chủ</Link>,
    },
    ...brands.map(brand => ({
      key: brand,
      label: <Link to={`/brand/${brand.toLowerCase()}`}>{brand}</Link>,
    }))
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'logout',
      label: (
        <span onClick={onLogout}>
          <LogoutOutlined /> Logout
        </span>
      ),
    },
  ];

  return (
    <header className={styles.header}>
      <Row justify="space-between" align="middle" className={styles.topRow}>
        <Col span={4} className={styles.logoCol}>
          <Image
            width={80}
            src="https://github.com/fluidicon.png"
            alt="Apple Logo"
            preview={false}
          />
        </Col>
        <Col span={12} className={styles.searchCol}>
          <AutoComplete
            options={options}
            style={{ width: '100%' }}
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
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
        <Col span={4} className={styles.userCol}>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="link" className={styles.iconTextButton}>
                <Avatar src={user.image} alt={user.firstName} />
                <span>{`${user.firstName} ${user.lastName}`}</span>
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
        <Col span={4} className={styles.cartCol}>
          <Link to="/cart">
            <Button type="link" className={styles.iconTextButton}>
              <ShoppingOutlined className={styles.icon} />
              <span>Giỏ hàng</span>
            </Button>
          </Link>
        </Col>
      </Row>
      <Row justify="center" className={styles.brandRow}>
        <Tabs activeKey={getActiveKey()} className={styles.brandTabs} items={items} />
      </Row>
    </header>
  );
};

export default Header;