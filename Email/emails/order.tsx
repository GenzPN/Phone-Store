import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
  productName: string;
  productCategory: string;
  productQuantity: number;
  productPrice: string;
}

export const OrderEmail: React.FC<OrderEmailProps> = ({
}) => (
  <Html>
    <Head />
    <Preview>Thông báo đơn hàng  9</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="/static/logo.png"
            width="200"
            height="auto"
            alt="Your Company Logo"
            style={logoStyle}
          />
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Thông báo tình trạng đơn hàng</Heading>
          <Text style={text}>Xin chào Nguyễn Văn A,</Text>
          <Text style={text}>
            Cảm ơn bạn đã đặt hàng. Dưới đây là thông tin chi tiết về đơn hàng của bạn:
          </Text>

          <Section style={gridContainer}>
            <div style={gridHeader}>
              <div style={gridCell}>Mã đơn hàng</div>
              <div style={gridCell}>Ngày đặt hàng</div>
              <div style={gridCell}>Trạng thái</div>
              <div style={gridCell}>Tổng tiền</div>
            </div>
            <div style={gridRow}>
              <div style={gridCell}>9</div>
              <div style={gridCell}>07/10/2024 13:22:45</div>
              <div style={gridCell}>Đã thanh toán</div>
              <div style={gridCell}>69.980.000 VND</div>
            </div>
          </Section>

          <Heading as="h2" style={h2}>Chi tiết sản phẩm</Heading>
          <Section style={gridContainer}>
            <div style={gridHeader}>
              <div style={gridCell}>Sản phẩm</div>
              <div style={gridCell}>Phân loại</div>
              <div style={gridCell}>Số lượng</div>
              <div style={gridCell}>Giá</div>
            </div>
            <div style={gridRow}>
              <div style={gridCell}>iPhone 16 Pro Max</div>
              <div style={gridCell}>Điện thoại</div>
              <div style={gridCell}>2</div>
              <div style={gridCell}>34.990.000 VND</div>
            </div>
            <div style={gridRow}>
              <div style={gridCell}>AirPods Pro 2</div>
              <div style={gridCell}>Tai nghe</div>
              <div style={gridCell}>2</div>
              <div style={gridCell}>1.990.000 VND</div>
            </div>
          </Section>

          <Text style={text}>
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
          </Text>
          <Text style={text}>Trân trọng,</Text>
          <Text style={text}>Đội ngũ hỗ trợ khách hàng</Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© 2024 Your Company Name. All rights reserved.</Text>
          <Text style={footerText}>
            123 Your Street, Your City, Your Country
          </Text>
          <Text style={footerText}>
            <a href="https://your-website.com" style={footerLink}>Website</a> | 
            <a href="https://your-website.com/privacy" style={footerLink}>Privacy Policy</a> | 
            <a href="https://your-website.com/terms" style={footerLink}>Terms of Service</a>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderEmail;

const main: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const header: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '30px 0',
  borderTopLeftRadius: '4px',
  borderTopRightRadius: '4px',
  borderBottom: '1px solid #eaeaea',
  textAlign: 'center',
  height: '100px',
};

const content: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
};

const footer: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: '#eaeaea',
  borderBottomLeftRadius: '4px',
  borderBottomRightRadius: '4px',
};

const h1: React.CSSProperties = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingBottom: '10px',
};

const h2: React.CSSProperties = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '20px 0 10px',
};

const text: React.CSSProperties = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
};

const gridContainer: React.CSSProperties = {
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  overflow: 'hidden',
};

const gridHeader: React.CSSProperties = {
  backgroundColor: '#f4f4f4',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
};

const gridRow: React.CSSProperties = {
  borderTop: '1px solid #eaeaea',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
};

const gridCell: React.CSSProperties = {
  color: '#333',
  fontSize: '14px',
  padding: '10px',
  textAlign: 'left',
};

const footerText: React.CSSProperties = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center',
};

const footerLink: React.CSSProperties = {
  color: '#666',
  textDecoration: 'underline',
};

const logoStyle: React.CSSProperties = {
  maxWidth: '200px',
  maxHeight: '80px',
  objectFit: 'contain',
};
