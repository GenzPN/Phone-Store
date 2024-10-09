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
  Link,
  Row,
  Column,
} from '@react-email/components';

interface OrderEmailProps {
  orderId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: string;
  products: Array<{
    name: string;
    category: string;
    quantity: number;
    price: string;
  }>;
}

export const OrderEmail: React.FC<OrderEmailProps> = ({
  orderId,
  customerName,
  customerAddress,
  customerPhone,
  orderDate,
  orderStatus,
  totalAmount,
  products,
}) => (
  <Html>
    <Head />
    <Preview>Thông báo đơn hàng {orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Row>
            <Column style={headerLogoColumn}>
              <Img
                src="https://i.imgur.com/uQaX2zy.png"
                width="200"
                style={logoStyle}
              />
            </Column>
            <Column style={headerTextColumn}>
              <Text style={headerText}>Công ty TNHH Trùm</Text>
              <Text style={headerSubText}>Địa chỉ: 77/5B Lê Lai, Phường 12, Quận Tân Bình, TP.HCM</Text>
              <Text style={headerSubText}>Email: startrungkiller2@gmail.com</Text>
            </Column>
          </Row>
        </Section>
        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Thông báo tình trạng đơn hàng</Heading>
          <Text style={text}>Xin chào {customerName}</Text>
          <Text style={text}>
            Cảm ơn bạn đã đặt hàng. Dưới đây là thông tin chi tiết về đơn hàng của bạn:
          </Text>

          {/* Updated Customer Information */}
                      <Heading as="h2" style={h2}>Thông tin khách hàng</Heading>
            <Text style={customerInfoText}>
              Họ và tên : {customerName}
            </Text>
            <Text style={customerInfoText}>
              Địa chỉ : {customerAddress}
            </Text>
            <Text style={customerInfoText}>
              Số điện thoại : {customerPhone}
            </Text>

          {/* Order Details Grid */}
          <Heading as="h2" style={h2}>Thông tin đơn hàng</Heading>
          <Section style={gridContainer}>
            <Row style={gridHeader}>
              <Column style={gridHeaderCellOrderId}>Mã đơn hàng</Column>
              <Column style={gridHeaderCellOrderDate}>Ngày đặt hàng</Column>
              <Column style={gridHeaderCellOrderStatus}>Trạng thái</Column>
            </Row>
            <Row style={gridRowEven}>
              <Column style={gridCellOrderId}>{orderId}</Column>
    <Column style={gridCellOrderDate}>{orderDate}</Column>
    <Column style={gridCellOrderStatus}>{orderStatus}</Column>
            </Row>
          </Section>

          <Heading as="h2" style={h2}>Chi tiết sản phẩm</Heading>
          <Section style={gridContainer}>
            <Row style={gridHeader}>
              <Column style={gridHeaderCellProduct}>Sản phẩm</Column>
              <Column style={gridHeaderCellCategory}>Phân loại</Column>
              <Column style={gridHeaderCellQuantity}>Số lượng</Column>
              <Column style={gridHeaderCellPrice}>Giá</Column>
            </Row>
            {products && products.length > 0 ? (
              products.map((product, index) => (
                <Row key={index} style={index % 2 === 0 ? gridRowEven : gridRowOdd}>
                  <Column style={gridCellProduct}>{product.name}</Column>
                  <Column style={gridCellCategory}>{product.category}</Column>
                  <Column style={gridCellQuantity}>{product.quantity}</Column>
                  <Column style={gridCellPrice}>{product.price}</Column>
                </Row>
              ))
            ) : (
              <Row style={gridRowEven}>
                <Column style={gridCell} colSpan={4}>Không có sản phẩm nào</Column>
              </Row>
            )}
          </Section>

          <Section style={totalAmountSection}>
              <Column style={totalAmountLabel}>Tổng tiền:</Column>
              <Column style={totalAmountValue}>{totalAmount}</Column> 
          </Section>
        </Section>

        {/* Product Showcase Section */}
        <Section style={showcaseSection}>
          <Section style={showcaseHeader}>
            <Row>
              <Text style={showcaseSubtitle}>Sản phẩm của chúng tôi</Text>
              <Text style={showcaseTitle}>Phong Cách Tinh Tế</Text>
              <Text style={showcaseDescription}>
                Khám phá bộ sưu tập sản phẩm mới nhất của chúng tôi. Từ điện thoại thông minh đến phụ kiện cao cấp, chúng tôi có mọi thứ bạn cần để nâng cao trải nghiệm công nghệ của mình.
              </Text>
            </Row>
          </Section>
          <Section style={showcaseGrid}>
            <Row>
              <Column style={showcaseColumn}>
                <Link href="#">
                  <Img
                    alt="iPhone 16 Pro Max"
                    style={showcaseImage}
                    src="https://i.imgur.com/im1Et0g.jpeg"
                  />
                </Link>
              </Column>
              <Column style={showcaseColumn}>
                <Link href="#">
                  <Img
                    alt="AirPods Pro 2"
                    style={showcaseImage}
                    src="https://i.imgur.com/l5kOzf4.jpeg"
                  />
                </Link>
              </Column>
            </Row>
            <Row style={showcaseSecondRow}>
              <Column style={showcaseColumn}>
                <Link href="#">
                  <Img
                    alt="MacBook Pro M3"
                    style={showcaseImage}
                    src="https://i.imgur.com/IFADc88.jpeg"
                  />
                </Link>
              </Column>
              <Column style={showcaseColumn}>
                <Link href="#">
                  <Img
                    alt="Apple Watch Series 10"
                    style={showcaseImage}
                    src="https://i.imgur.com/YBRuHoR.jpeg"
                  />
                </Link>
              </Column>
            </Row>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>© 2024 Công ty TNHH Trùm. All rights reserved.</Text>
          <Text style={footerText}>
            77/5B Lê Lai, Phường 12, Quận Tân Bình, TP.HCM
          </Text>
          <Text style={footerText}>
            <a href="https://trum.com" style={footerLink}>Website</a> | 
            <a href="https://trum.com/privacy" style={footerLink}>Privacy Policy</a> | 
            <a href="https://trum.com/terms" style={footerLink}>Terms of Service</a>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Colors
const colors = {
  primary: '#4F46E5',
  secondary: '#4CAF50',
  background: 'hsl(221, 91%, 91%)',
  white: '#ffffff',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6B7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Typography
const typography = {
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
};

// Common styles
const commonStyles = {
  borderRadius: '4px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
};

// Layout styles
const main: React.CSSProperties = {
  backgroundColor: colors.background,
  fontFamily: typography.fontFamily,
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: `${spacing.xl} 0 ${spacing['3xl']}`,
  width: '580px',
};

const content: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: spacing.xl,
  ...commonStyles,
};

// Header styles
const header: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: `${spacing.xl} ${spacing.lg}`,
  borderBottom: `1px solid ${colors.gray[200]}`,
};

const logoStyle: React.CSSProperties = {
  maxWidth: '200px',
  maxHeight: '150px',
  objectFit: 'contain',
};

// Typography styles
const h1: React.CSSProperties = {
  color: colors.gray[900],
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
  paddingBottom: spacing.lg,
};

const h2: React.CSSProperties = {
  color: colors.gray[900],
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  padding: `${spacing.xl} 0 ${spacing.lg}`,
};

const text: React.CSSProperties = {
  color: colors.gray[700],
  fontSize: typography.fontSize.base,
  lineHeight: '24px',
};

// Grid styles
const gridContainer: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
};

const gridHeader: React.CSSProperties = {
  backgroundColor: colors.gray[100],
};

const gridHeaderCell: React.CSSProperties = {
  padding: spacing.md,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.bold,
  color: colors.gray[700],
  textAlign: 'left',
  borderBottom: `2px solid ${colors.gray[200]}`,
};

const gridRow: React.CSSProperties = {
  borderBottom: `1px solid ${colors.gray[200]}`,
};

const gridRowEven: React.CSSProperties = {
  backgroundColor: colors.white,
};

const gridRowOdd: React.CSSProperties = {
  backgroundColor: colors.gray[100],
};

const gridCell: React.CSSProperties = {
  padding: spacing.md,
  fontSize: typography.fontSize.sm,
  color: colors.gray[600],
};

// Specific grid cell styles
const gridCellStyles = (width: string, align: 'left' | 'center' | 'right' = 'left', bold: boolean = false): React.CSSProperties => ({
  ...gridCell,
  width,
  textAlign: align,
  ...(bold && { fontWeight: typography.fontWeight.bold }),
});
const gridHeaderCellOrderId = gridCellStyles('30%', 'center');
const gridHeaderCellOrderDate = gridCellStyles('40%', 'center');
const gridHeaderCellOrderStatus = gridCellStyles('30%', 'center');

const gridHeaderCellProduct = gridCellStyles('30%', 'center');
const gridHeaderCellCategory = gridCellStyles('25%', 'center');
const gridHeaderCellQuantity = gridCellStyles('15%', 'center');
const gridHeaderCellPrice = gridCellStyles('30%', 'center');

const gridCellOrderId = gridCellStyles('30%', 'center', true);
const gridCellOrderDate = gridCellStyles('40%', 'center');
const gridCellOrderStatus = gridCellStyles('30%', 'center');

const gridCellProduct = gridCellStyles('30%', 'center', true);
const gridCellCategory = gridCellStyles('25%', 'center');
const gridCellQuantity = gridCellStyles('15%', 'center');
const gridCellPrice = gridCellStyles('30%', 'center');

// Footer styles
const footer: React.CSSProperties = {
  backgroundColor: colors.white,
  padding: spacing.xl,
  borderTop: `1px solid ${colors.gray[200]}`,
  ...commonStyles,
};

const footerText: React.CSSProperties = {
  color: colors.gray[500],
  fontSize: typography.fontSize.xs,
  lineHeight: '16px',
  textAlign: 'center',
};

const footerLink: React.CSSProperties = {
  color: colors.gray[500],
  textDecoration: 'underline',
};

const showcaseSection: React.CSSProperties = {
  marginTop: '16px',
  marginBottom: '16px',
};

const showcaseHeader: React.CSSProperties = {
  marginTop: '42px',
};

const showcaseSubtitle: React.CSSProperties = {
  margin: '0',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  color: '#4F46E5',
};

const showcaseTitle: React.CSSProperties = {
  margin: '0',
  marginTop: '8px',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  color: '#111827',
};

const showcaseDescription: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6B7280',
};

const showcaseGrid: React.CSSProperties = {
  marginTop: '16px',
};

const showcaseColumn: React.CSSProperties = {
  width: '50%',
  paddingRight: '8px',
  paddingLeft: '8px',
};

const showcaseImage: React.CSSProperties = {
  width: '100%',
  borderRadius: '12px',
  objectFit: 'cover',
  height: '288px',
};

const showcaseSecondRow: React.CSSProperties = {
  marginTop: '16px',
};

const totalAmountSection: React.CSSProperties = {
  marginTop: '20px',
  paddingTop: '10px',
};

const totalAmountLabel: React.CSSProperties = {
  ...gridCell,
  fontWeight: 'bold',
  textAlign: 'right',
  width: '70%',
};

const totalAmountValue: React.CSSProperties = {
  ...gridCell,
  fontWeight: 'bold',
  textAlign: 'left',
  width: '30%',
};

const headerLogoColumn: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'middle',
};

const headerTextColumn: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'middle',
  textAlign: 'right',
};

const headerText: React.CSSProperties = {
  ...text,
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  marginBottom: spacing.xs,
};

const headerSubText: React.CSSProperties = {
  ...text,
  fontSize: typography.fontSize.sm,
  color: colors.gray[600],
  marginBottom: spacing.xs,
};

const customerInfoText: React.CSSProperties = {
  ...text,
  marginBottom: spacing.sm,
};