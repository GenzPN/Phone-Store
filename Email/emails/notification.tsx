import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface NotificationEmailProps {
    name: string;
    content: string;
    url: string;
  }
  
  export const NotificationEmail = ({
    name = 'Trum Phone',
    content = 'Nội dung email',
    url = 'http://localhost:3000',
  }: NotificationEmailProps) => (
    <Html>
      <Head />
      <Preview>Email thông báo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Heading style={h1}>{name}</Heading>
          </Section>
          <Section style={contentStyle}>
            <Heading style={h2}>Email thông báo</Heading>
            <Text style={paragraph}>Thân gửi người dùng:</Text>
            <Text style={paragraph} dangerouslySetInnerHTML={{ __html: content }} />
            <Text style={paragraph}>
              (Email này được gửi tự động bởi hệ thống, vui lòng không trả lời)
            </Text>
            <Section style={btnContainer}>
              <Link style={button} href={url}>
                Đăng nhập
              </Link>
            </Section>
          </Section>
          <Text style={footer}>
            © {name}. Tất cả các quyền được bảo lưu.
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default NotificationEmail;
  
  // Styles
  const main = {
    backgroundColor: '#ffffff',
    fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
  };
  
  const logoContainer = {
    background: 'linear-gradient(to right, #0096FF 10%, #2F5DFF 45%, #4F35FF 100%)',
    padding: '70px 20px',
    textAlign: 'center' as const,
  };
  
  const h1 = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0',
  };
  
  const contentStyle = {
    padding: '20px',
  };
  
  const h2 = {
    fontSize: '34px',
    lineHeight: '1em',
    margin: '20px 0 30px',
  };
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
  };
  
  const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '20px',
  };
  
  const button = {
    backgroundColor: '#111111',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '18px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 30px',
    fontWeight: 'bold',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    marginTop: '20px',
    textAlign: 'center' as const,
  };