import React from 'react';
import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
  productName: string;
  productCategory: string; // Added this line
  productQuantity: number;
  productPrice: string;
}

// Dữ liệu demo
const demoData: OrderEmailProps = {
  orderId: "9",
  customerName: "Khách hàng demo",
  orderDate: "07/10/2024 13:22:45",
  orderStatus: "Đã thanh toán",
  totalAmount: "69.980.000 VND",
  productName: "iPhone 16 Pro Max",
  productCategory: "Điện thoại", // Added this line
  productQuantity: 2,
  productPrice: "34.990.000 VND",
};

export const OrderEmail: React.FC<OrderEmailProps> = ({
  orderId,
  customerName,
  orderDate,
  orderStatus,
  totalAmount,
  productName,
  productCategory,
  productQuantity,
  productPrice,
}) => (
  <Html>
    <Head />
    <Preview>Thông báo đơn hàng 9</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Thông báo tình trạng đơn hàng</Heading>
        <Text style={text}>Xin chào Nguyễn Võ Quốc Trung,</Text>
        <Text style={text}>
          Cảm ơn bạn đã đặt hàng. Dưới đây là thông tin chi tiết về đơn hàng của bạn:
        </Text>

        <Section style={tableContainer}>
          <Row style={tableHeader}>
            <Column style={tableHeaderColumn}>Mã đơn hàng</Column>
            <Column style={tableHeaderColumn}>Ngày đặt hàng</Column>
            <Column style={tableHeaderColumn}>Trạng thái</Column>
            <Column style={tableHeaderColumn}>Tổng tiền</Column>
          </Row>
          <Row style={tableRow}>
            <Column style={tableColumn}>9</Column>
            <Column style={tableColumn}>07/10/2024 13:22:45</Column>
            <Column style={tableColumn}>Đã thanh toán</Column>
            <Column style={tableColumn}>69.980.000 VND</Column>
          </Row>
        </Section>

        <Heading as="h2" style={h2}>Chi tiết sản phẩm</Heading>
        <Section style={tableContainer}>
          <Row style={tableHeader}>
            <Column style={tableHeaderColumn}>Sản phẩm</Column>
            <Column style={tableHeaderColumn}>Phân loại</Column>
            <Column style={tableHeaderColumn}>Số lượng</Column>
            <Column style={tableHeaderColumn}>Giá</Column>
          </Row>
          <Row style={tableRow}>
            <Column style={tableColumn}>iPhone 16 Pro Max</Column>
            <Column style={tableColumn}>Điện thoại</Column>
            <Column style={tableColumn}>2</Column>
            <Column style={tableColumn}>34.990.000 VND</Column>
          </Row>
        </Section>

        <Text style={text}>
          Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
        </Text>
        <Text style={text}>Trân trọng,</Text>
        <Text style={text}>Đội ngũ hỗ trợ khách hàng</Text>
      </Container>
    </Body>
  </Html>
);

// Sử dụng dữ liệu demo
export const OrderEmailDemo = () => <OrderEmail {...demoData} />;

export default OrderEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingBottom: '10px',
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
};

const tableContainer = {
  border: '1px solid #ccc',
  borderRadius: '4px',
  overflow: 'hidden',
};

const tableHeader = {
  backgroundColor: '#f4f4f4',
};

const tableHeaderColumn = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '10px',
};

const tableRow = {
  borderTop: '1px solid #ccc',
};

const tableColumn = {
  color: '#333',
  fontSize: '14px',
  padding: '10px',
};
