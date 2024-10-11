import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (to, orderDetails, isPaymentConfirmation = false) => {
  try {
    const templatePath = path.join(__dirname, '../emails/orderConfirmation.html');
    let emailTemplate = await fs.readFile(templatePath, 'utf8');

    const { 
      orderId, 
      customerName, 
      totalAmount, 
      orderDate,
      paymentMethod,
      items,
      isPaid
    } = orderDetails;

    const itemsHtml = items.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.category || 'Điện thoại'}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString('vi-VN')} VND</td>
      </tr>
    `).join('');

    const replacements = {
      '{{COMPANY_LOGO}}': 'https://example.com/logo.png', // Thay bằng URL logo thực tế
      '{{COMPANY_NAME}}': process.env.COMPANY_NAME || 'Công ty TNHH Trùm',
      '{{COMPANY_ADDRESS}}': process.env.COMPANY_ADDRESS || '77/5B Lê Lai, Phường 12, Quận Tân Bình, TP.HCM',
      '{{SUPPORT_EMAIL}}': process.env.SUPPORT_EMAIL || 'startrungkiller2@gmail.com',
      '{{CUSTOMER_NAME}}': customerName,
      '{{ORDER_ID}}': orderId,
      '{{ORDER_DATE}}': new Date(orderDate).toLocaleString('vi-VN'),
      '{{PAYMENT_METHOD}}': paymentMethod,
      '{{ORDER_ITEMS}}': itemsHtml,
      '{{TOTAL_AMOUNT}}': totalAmount.toLocaleString('vi-VN'),
      '{{PAYMENT_STATUS}}': isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
      '{{EMAIL_TITLE}}': isPaymentConfirmation ? 'Xác nhận thanh toán đơn hàng' : 'Xác nhận đơn hàng',
      '{{EMAIL_CONTENT}}': isPaymentConfirmation 
        ? 'Chúng tôi xin thông báo rằng đơn hàng của bạn đã được thanh toán thành công.' 
        : 'Cảm ơn bạn đã đặt hàng. Dưới đây là thông tin chi tiết về đơn hàng của bạn:'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      emailTemplate = emailTemplate.replace(new RegExp(placeholder, 'g'), value);
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject: isPaymentConfirmation ? `Xác nhận thanh toán đơn hàng #${orderId}` : `Xác nhận đơn hàng #${orderId}`,
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`${isPaymentConfirmation ? 'Payment' : 'Order'} confirmation email sent successfully`);
  } catch (error) {
    console.error(`Error sending ${isPaymentConfirmation ? 'payment' : 'order'} confirmation email:`, error);
    throw error;
  }
};