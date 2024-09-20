import React from "react";
import { Row, Col, Typography, Image } from "antd";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Footer = () => {
  return (
    <footer style={{ padding: "20px 50px" }}>
      <Row justify="space-between">
        <Col>
          <Image width={188} src="rectangle-19-2.png" preview={false} />
        </Col>
        <Col>
          <Title level={5}>
            GIỚI THIỆU VỀ CÔNG TY
          </Title>
          <Text>CÂU HỎI THƯỜNG GẶP</Text>
          <br />
          <Text>CHÍNH SÁCH BẢO MẬT</Text>
          <br />
          <Text>QUY CHẾ HOẠT ĐỘNG</Text>
        </Col>
        <Col>
          <Title level={5}>
            KIỂM TRA HÓA ĐƠN ĐIỂN TỬ
          </Title>
          <Text>TRA CỨU THÔNG TIN BẢO HÀNH</Text>
          <br />
          <Text>TIN TUYỂN DỤNG</Text>
          <br />
          <Text>TIN KHUYẾN MÃI</Text>
          <br />
          <Text>HƯỚNG DẪN ONLINE</Text>
        </Col>
        <Col>
          <Title level={5}>
            HỆ THỐNG CỬA HÀNG
          </Title>
          <Text>HỆ THỐNG BẢO HÀNH</Text>
          <br />
          <Text>KIỂM TRA HÀNG APPLE CHÍNH HÃNG</Text>
          <br />
          <Text>GIỚI THIỆU ĐỔI MÁY</Text>
          <br />
          <Text>CHÍNH SÁCH ĐỔI TRẢ</Text>
        </Col>
        <Col>
          <Title level={5}>
            SOCIAL MEDIA
          </Title>
          <FacebookOutlined style={{ fontSize: '32px', marginRight: '20px' }} />
          <GoogleOutlined style={{ fontSize: '32px' }} />
          <Title level={5}>
            HAT Shop
          </Title>
        </Col>
      </Row>
    </footer>
  );
};

export default Footer;