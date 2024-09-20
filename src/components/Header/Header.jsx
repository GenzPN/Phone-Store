import React from "react";
import { Row, Col, Typography, Image, Input } from "antd";
import { SearchOutlined, UserOutlined, ShoppingOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Header = ({ brands }) => {
  return (
    <header style={{ height: 200 }}>
      <Row justify="space-between" align="middle" style={{ height: "100%" }}>
        <Col>
          <Image width={150} src="rectangle-19.png" preview={false} />
        </Col>
        <Col flex="auto">
          <Input
            size="large"
            placeholder="Nhập thứ cần tìm..."
            prefix={<SearchOutlined />}
            style={{ borderRadius: 5 }}
          />
        </Col>
        <Col>
          <UserOutlined style={{ fontSize: '32px', color: 'white', marginRight: '20px' }} />
          <ShoppingOutlined style={{ fontSize: '32px', color: 'white' }} />
        </Col>
        <Col>
          <Title level={3} style={{ color: "white" }}>
            Đăng nhập
          </Title>
        </Col>
      </Row>
      <Row justify="center">
        {brands.map((brand) => (
          <Col key={brand} style={{ padding: "0 20px" }}>
            <Title level={4} style={{ color: "white" }}>
              {brand}
            </Title>
          </Col>
        ))}
      </Row>
    </header>
  );
};

export default Header;