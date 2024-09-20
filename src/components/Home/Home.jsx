import React from "react";
import PropTypes from "prop-types";
import { Layout, Row, Col, Typography, Image, Input, Button, Card } from "antd";
import { SearchOutlined, ShoppingCartOutlined, ZoomInOutlined } from "@ant-design/icons";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const { Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const brands = ["IPHONE", "SAMSUNG", "OPPO", "HUAWEI", "REALME", "VIVO", "XIAOMI", "NOKIA"];
  const phones = [
    { name: "Iphone 12", price: "27.990.000 đ", img: "rectangle-25.png" },
    { name: "Oppo", price: "10.990.000 đ", img: "image.png" },
    { name: "Xiaomi", price: "5.499.000 đ", img: "rectangle-25-2.png" },
    { name: "Samsung", price: "19.499.000 đ", img: "rectangle-25-3.png" },
    { name: "Iphone X series", price: "19.499.000 đ", img: "rectangle-25-4.png" },
  ];

  return (
    <Layout>
      <Header brands={brands} />
      <Content style={{ padding: "20px 50px" }}>
        <Row justify="center">
          <Image width={1723} src="rectangle-22.png" preview={false} />
        </Row>
        <Row justify="center" style={{ marginTop: 20 }}>
          <Card
            title={
              <Row align="middle">
                <Image width={53} src="campfire.png" preview={false} />
                <Title level={4} style={{ marginLeft: 10, color: "#219ebc" }}>
                  Điện thoại nổi bật
                </Title>
              </Row>
            }
            bordered={false}
            style={{ width: 1724, borderRadius: 20 }}
          >
            <Row gutter={16} justify="center">
              {phones.map((phone) => (
                <Col key={phone.name}>
                  <Card
                    cover={<Image alt={phone.name} src={phone.img} preview={false} />}
                    bordered={false}
                    style={{ width: 250, borderRadius: 20 }}
                  >
                    <Title level={5} style={{ color: "#219ebc", textAlign: "center" }}>
                      {phone.name}
                    </Title>
                    <Text style={{ display: "block", textAlign: "center" }}>{phone.price}</Text>
                    <Row justify="space-between" style={{ marginTop: 20 }}>
                      <Button icon={<ZoomInOutlined />} style={{ borderRadius: 5 }} />
                      <Button icon={<ShoppingCartOutlined />} style={{ borderRadius: 5 }}>
                        Thêm vào
                      </Button>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
};

Home.propTypes = {
  brands: PropTypes.arrayOf(PropTypes.string),
  phones: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      price: PropTypes.string,
      img: PropTypes.string,
    })
  ),
};

export default Home;