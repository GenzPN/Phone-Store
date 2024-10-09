import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface AuthEmailProps {
    name: string;
    url: string;
}

export const AuthEmail = ({
    name = 'Người dùng',
    url = 'http://localhost:3000',
}: AuthEmailProps) => (
    <Html>
        <Head />
        <Preview>Cảm ơn bạn đã đăng ký tài khoản</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={logoContainer}>
                    <Heading style={h1}>Trum Phone</Heading>
                </Section>
                <Section style={contentStyle}>
                    <Heading style={h2}>Cảm ơn bạn đã đăng ký tài khoản</Heading>
                    <Text style={paragraph}>Thân gửi {name},</Text>
                    <Text style={paragraph}>
                        Chúng tôi xin chân thành cảm ơn bạn đã đăng ký tài khoản tại Trum Phone. 
                        Chúng tôi rất vui mừng được chào đón bạn tham gia cộng đồng của chúng tôi.
                    </Text>
                    <Text style={paragraph}>
                        Để hoàn tất quá trình đăng ký và bắt đầu sử dụng tài khoản của bạn, 
                        vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn:
                    </Text>
                    <Section style={btnContainer}>
                        <Link style={button} href={url}>
                            Xác nhận email
                        </Link>
                    </Section>
                    <Text style={paragraph}>
                        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
                    </Text>
                    <Text style={paragraph}>
                        Nếu bạn gặp bất kỳ vấn đề gì, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.
                    </Text>
                    <Text style={paragraph}>
                        Trân trọng,<br />
                        Đội ngũ Trum Phone
                    </Text>
                </Section>
                <Text style={footer}>
                    © Trum Phone. Tất cả các quyền được bảo lưu.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default AuthEmail;

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
    padding: '30px 20px',
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
    fontSize: '24px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#333',
    margin: '20px 0 30px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#444',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '30px',
    marginBottom: '30px',
};

const button = {
    backgroundColor: '#0096FF',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
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