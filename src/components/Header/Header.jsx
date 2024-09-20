import { Link, useLocation } from "react-router-dom";
import { Row, Col, Image, Input, Tabs, Button } from "antd";
import { SearchOutlined, UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import styles from './Header.module.css';

const Header = ({ brands }) => {
  const location = useLocation();
  const currentPath = location.pathname;

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
          <Input
            size="large"
            placeholder="Nhập thứ cần tìm..."
            prefix={<SearchOutlined />}
            className={styles.searchInput}
          />
        </Col>
        <Col span={4} className={styles.userCol}>
          <Button type="link" className={styles.iconTextButton}>
            <UserOutlined className={styles.icon} />
            <span>Đăng nhập</span>
          </Button>
        </Col>
        <Col span={4} className={styles.cartCol}>
          <Button type="link" className={styles.iconTextButton}>
            <ShoppingOutlined className={styles.icon} />
            <span>Sản phẩm</span>
          </Button>
        </Col>
      </Row>
      <Row justify="center" className={styles.brandRow}>
        <Tabs activeKey={getActiveKey()} className={styles.brandTabs} items={items} />
      </Row>
    </header>
  );
};

export default Header;