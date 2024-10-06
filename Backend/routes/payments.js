import express from 'express';
import db from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const config = require('../config/config.json');

const router = express.Router();

router.use(authenticateJWT);

// Lấy thông tin thanh toán
router.get('/info/:orderId', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM Orders WHERE id = ?', [req.params.orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];
    const paymentInfo = getPaymentInfo(order, req.params.orderId);
    res.json(paymentInfo);
  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xử lý callback thanh toán
router.post('/callback', async (req, res) => {
  // Implement payment callback logic here
  // This will depend on your payment gateway's requirements
});

function getPaymentInfo(order, orderId) {
  const baseInfo = {
    amount: order.total_amount,
    order_id: orderId,
    return_url: `${config.website.url}/order-confirmation/${orderId}`,
    notify_url: `${config.website.url}/api/payment-callback`,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
  };

  switch (order.payment_method) {
    case 'bank_transfer':
      return {
        ...baseInfo,
        linkQR: `https://api.vietqr.io/${config.bank.shortName}/${config.bank.accountNumber}/${order.total_amount}/GEN${orderId}/qr_only.png?accountName=${encodeURIComponent(config.bank.accountHolder)}`,
        accountHolder: config.bank.accountHolder,
        accountNumber: config.bank.accountNumber,
        bankName: config.bank.name,
        transferContent: `GEN${orderId}`,
        orderTimeout: config.bank.orderTimeout
      };
    case 'momo':
      return {
        ...baseInfo,
        linkQR: `https://momosv3.apimienphi.com/api/QRCode?phone=${config.momo.accountNumber}&amount=${order.total_amount}&note=GEN${orderId}`,
        accountHolder: config.momo.accountHolder,
        accountNumber: config.momo.accountNumber,
        transferContent: `GEN${orderId}`,
        orderTimeout: config.momo.orderTimeout
      };
    case 'cod':
      return {
        ...baseInfo,
      };
    default:
      throw new Error('Unsupported payment method');
  }
}

export const paymentRoutes = router;
