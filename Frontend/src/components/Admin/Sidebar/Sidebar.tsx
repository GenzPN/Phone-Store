import React from 'react';
import { Menu } from 'antd';
import { HomeOutlined, ProfileOutlined, ShoppingCartOutlined, FundProjectionScreenOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/catalogs">Xem Danh Mục</Link>,
    },
    {
      key: '2',
      icon: <ProfileOutlined />,
      label: <Link to="/products">Xem Sản Phẩm</Link>,
    },
    {
      key: '3',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Xem Đơn Hàng</Link>,
    },
    {
      key: '4',
      icon: <FundProjectionScreenOutlined />,
      label: <Link to="/charts">Thống Kê Báo Cáo</Link>,
    },
  ];

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={['1']}
      style={{ height: '100%', borderRight: 0 }}
      theme="light"
      items={menuItems}
    />
  );
};

export default Sidebar;
