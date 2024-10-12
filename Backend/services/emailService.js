import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Đọc template email
const readEmailTemplate = async () => {
  const templatePath = join(__dirname, '../emails/orderConfirmation.html');
  console.log('Reading email template from:', templatePath);
  try {
    const template = await fs.readFile(templatePath, 'utf8');
    console.log('Email template read successfully');
    return template;
  } catch (error) {
    console.error('Error reading email template:', error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  console.log('Attempting to send email to:', email);
  console.log('Order details:', JSON.stringify(orderDetails, null, 2));
  try {
    console.log('Creating transporter with config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Transporter created');

    const template = await readEmailTemplate();
    console.log('Email template read');

    // Thay thế các placeholder trong template
    let htmlContent = template
      .replace(/{{COMPANY_NAME}}/g, process.env.COMPANY_NAME)
      .replace(/{{COMPANY_ADDRESS}}/g, process.env.COMPANY_ADDRESS)
      .replace(/{{SUPPORT_EMAIL}}/g, process.env.SUPPORT_EMAIL)
      .replace(/{{EMAIL_TITLE}}/g, orderDetails.isPaid ? `Xác nhận thanh toán đơn hàng #${orderDetails.orderId}` : `Xác nhận đơn hàng #${orderDetails.orderId}`)
      .replace(/{{CUSTOMER_NAME}}/g, orderDetails.customerName)
      .replace(/{{EMAIL_CONTENT}}/g, orderDetails.isPaid ? 'Cảm ơn bạn đã thanh toán đơn hàng.' : 'Cảm ơn bạn đã đặt hàng. Vui lòng thanh toán để hoàn tất đơn hàng.')
      .replace(/{{ORDER_ID}}/g, orderDetails.orderId)
      .replace(/{{ORDER_DATE}}/g, new Date(orderDetails.orderDate).toLocaleString())
      .replace(/{{PAYMENT_METHOD}}/g, orderDetails.paymentMethod === 'bank_transfer' ? 'Ngân hàng' : orderDetails.paymentMethod)
      .replace(/{{PAYMENT_STATUS}}/g, orderDetails.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán')
      .replace(/{{TOTAL_AMOUNT}}/g, orderDetails.totalAmount ? orderDetails.totalAmount.toLocaleString() : '0');

    // Tạo bảng các mặt hàng
    let itemsHtml = '';
    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      for (const item of orderDetails.items) {
        itemsHtml += `
          <tr>
            <td class="product-name">${item.title || 'Sản phẩm không xác định'}</td>
            <td>${item.quantity || 0}</td>
            <td>${item.price ? item.price.toLocaleString() : '0'} đ</td>
            <td>${(item.price * item.quantity).toLocaleString()} đ</td>
          </tr>
        `;
      }
    } else {
      itemsHtml = '<tr><td colspan="4">Không có thông tin sản phẩm</td></tr>';
    }
    htmlContent = htmlContent.replace('{{ORDER_ITEMS}}', itemsHtml);

    console.log('Sending email with options:', {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SUPPORT_EMAIL}>`,
      to: email,
      subject: orderDetails.isPaid ? `Xác nhận thanh toán đơn hàng #${orderDetails.orderId}` : `Xác nhận đơn hàng #${orderDetails.orderId}`,
    });

    const info = await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME}" <${process.env.SUPPORT_EMAIL}>`,
      to: email,
      subject: orderDetails.isPaid ? `Xác nhận thanh toán đơn hàng #${orderDetails.orderId}` : `Xác nhận đơn hàng #${orderDetails.orderId}`,
      html: htmlContent,
    });

    console.log('Email sent successfully. Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};