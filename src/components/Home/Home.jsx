import React from 'react';
import { Layout, Menu, Input, Button, Card, Row, Col } from 'antd';

const { Header, Content, Footer } = Layout;

export default function Home() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-cyan-500">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            {/* Image component omitted */}
            <h1 className="text-white text-2xl ml-2">H.D.T</h1>
          </div>
          <Input placeholder="Nhập thứ cần tìm..." className="flex-grow mx-4" />
          <Button type="primary">Đăng nhập</Button>
        </div>
      </Header>

      <Menu mode="horizontal" className="bg-cyan-400">
        {['IPHONE', 'SAMSUNG', 'OPPO', 'HUAWEI', 'REALME', 'VIVO', 'XIAOMI', 'NOKIA'].map((brand) => (
          <Menu.Item key={brand}>
            {/* Link component omitted */}
            {brand}
          </Menu.Item>
        ))}
      </Menu>

      <Content className="container mx-auto p-4">
        <div className="mb-4">
          {/* Image component omitted */}
        </div>

        <h2 className="text-xl font-bold mb-4">Điện thoại nổi bật</h2>
        <Row gutter={16}>
          {['Iphone 12', 'Oppo', 'Xiaomi', 'Samsung', 'Iphone X Series'].map((phone) => (
            <Col span={4} key={phone}>
              <Card
                cover={<img src="path/to/your/image.png" alt={phone} />}
                actions={[
                  <Button type="default">Xem</Button>,
                  <Button type="primary">Thêm vào giỏ</Button>
                ]}
              >
                <Card.Meta title={phone} description="Giá: X,XXX,XXX đ" />
              </Card>
            </Col>
          ))}
        </Row>
      </Content>

      <Footer className="bg-cyan-500 text-white p-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold">Về công ty</h3>
            <ul>
              <li>Giới thiệu</li>
              <li>Chính sách bảo mật</li>
              <li>Quy chế hoạt động</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Hỗ trợ khách hàng</h3>
            <ul>
              <li>Kiểm tra đơn hàng</li>
              <li>Tra cứu thông tin bảo hành</li>
              <li>Hướng dẫn mua online</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Kết nối với chúng tôi</h3>
            <div className="flex space-x-2 mt-2">
              {/* Link component omitted */}
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}