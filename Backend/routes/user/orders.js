import express from 'express';
import db from '../../config/database.js';
import { authenticateJWT } from '../../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const router = express.Router();

// Import config
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the config file
const config = JSON.parse(readFileSync(path.join(__dirname, '../../config/config.json'), 'utf8'));

// Function to create order folder and files
async function createOrderFiles(orderId, totalAmount, transactionId) {
  const orderDir = path.join(__dirname, '../../Order', `order${orderId}`);
  await fs.mkdir(orderDir, { recursive: true });

  await fs.writeFile(path.join(orderDir, 'price.log'), totalAmount.toString());
  await fs.writeFile(path.join(orderDir, 'status.log'), '0');
  await fs.writeFile(path.join(orderDir, 'time.log'), Math.floor(Date.now() / 1000).toString());
  await fs.writeFile(path.join(orderDir, 'tradeno.log'), transactionId);
}

// Function to check payment status
async function checkPaymentStatus(orderId) {
  const orderDir = path.join(__dirname, '../../Order', `order${orderId}`);
  const [price, status, time, tradeno] = await Promise.all([
    fs.readFile(path.join(orderDir, 'price.log'), 'utf8'),
    fs.readFile(path.join(orderDir, 'status.log'), 'utf8'),
    fs.readFile(path.join(orderDir, 'time.log'), 'utf8'),
    fs.readFile(path.join(orderDir, 'tradeno.log'), 'utf8')
  ]);

  if (status === '1') {
    return { isPaid: true, transactionId: tradeno.trim() };
  }

  const apiUrl = `${config.bank.domain}${config.bank.token}`;
  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.transactions;

    for (const transaction of transactions) {
      const transactionAmount = parseFloat(transaction.amount);
      const orderAmount = parseFloat(price);

      if (transactionAmount >= orderAmount && transaction.remark.includes(`GEN${orderId}`)) {
        await fs.writeFile(path.join(orderDir, 'status.log'), '1');
        await db.query('UPDATE Orders SET status = "paid", payment_status = "completed" WHERE id = ?', [orderId]);
        return { isPaid: true, transactionId: transaction.trxId };
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }

  return { isPaid: false, transactionId: tradeno.trim() };
}

// Thêm hàm này vào đầu file
function calculateTimeLeft(orderTime) {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeElapsed = currentTime - orderTime;
  const totalTimeout = 30 * 60; // 30 phút
  return Math.max(0, totalTimeout - timeElapsed);
}

// Create a new order
router.post('/', authenticateJWT, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { shipping_address_id, items, total_amount, note, paymentMethod } = req.body;

    console.log('Received order data:', { shipping_address_id, items, total_amount, note, paymentMethod });

    if (!shipping_address_id) {
      throw new Error('Missing shipping address');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid or empty items array');
    }

    if (!total_amount || isNaN(total_amount)) {
      throw new Error('Invalid total amount');
    }

    if (!paymentMethod) {
      throw new Error('Missing payment method');
    }

    const validPaymentMethods = ['bank_transfer', 'momo', 'cod'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      throw new Error(`Invalid payment method. Valid methods are: ${validPaymentMethods.join(', ')}`);
    }

    const transactionId = uuidv4();
    const [result] = await connection.query(
      'INSERT INTO Orders (user_id, shipping_address_id, total_amount, note, payment_method, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, shipping_address_id, total_amount, note, paymentMethod, transactionId]
    );

    const orderId = result.insertId;

    // Create order files
    await createOrderFiles(orderId, total_amount, transactionId);

    for (const item of items) {
      await connection.query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Cập nhật số lượng sản phẩm trong kho
      await connection.query(
        'UPDATE Products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Xóa các mục trong giỏ hàng của người dùng sau khi đặt hàng
    await connection.query('DELETE FROM Cart WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({ 
      success: true, 
      orderId: orderId, 
      message: 'Order created successfully',
      paymentMethod
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Get payment info
router.get('/payment-info/:orderId', authenticateJWT, async (req, res) => {
  try {
    console.log('Fetching order:', req.params.orderId);
    const [orders] = await db.query('SELECT * FROM Orders WHERE id = ?', [req.params.orderId]);
    
    console.log('Order found:', orders);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];
    
    // Kiểm tra trạng thái thanh toán và lấy mã giao dịch
    const { isPaid, transactionId } = await checkPaymentStatus(req.params.orderId);
    if (isPaid && order.status === 'pending') {
      await db.query('UPDATE Orders SET status = "paid", payment_status = "completed" WHERE id = ?', [req.params.orderId]);
      order.status = 'paid';
      order.payment_status = 'completed';
    }

    const orderDir = path.join(__dirname, '../../Order', `order${req.params.orderId}`);
    const orderTime = parseInt(await fs.readFile(path.join(orderDir, 'time.log'), 'utf8'));
    const timeLeft = calculateTimeLeft(orderTime);

    let paymentInfo;
    
    if (order.payment_method === 'bank_transfer') {
      paymentInfo = {
        linkQR: `https://api.vietqr.io/${config.bank.shortName}/${config.bank.accountNumber}/${order.total_amount}/GEN${req.params.orderId}/qr_only.png?accountName=${encodeURIComponent(config.bank.accountHolder)}`,
        amount: order.total_amount,
        accountHolder: config.bank.accountHolder,
        accountNumber: config.bank.accountNumber,
        transferContent: `GEN${req.params.orderId}`,
        order_id: req.params.orderId,
        return_url: `${config.website.url}/order-confirmation/${req.params.orderId}`,
        notify_url: `${config.website.url}/api/payment-callback`,
        orderTimeout: timeLeft,
        orderStartTime: orderTime,
        payment_status: order.payment_status,
        transactionId: transactionId
      };
    } else if (order.payment_method === 'momo') {
      paymentInfo = {
        linkQR: `https://momosv3.apimienphi.com/api/QRCode?phone=${config.momo.accountNumber}&amount=${order.total_amount}&note=GEN${req.params.orderId}`,
        amount: order.total_amount,
        accountHolder: config.momo.accountHolder,
        accountNumber: config.momo.accountNumber,
        transferContent: `GEN${req.params.orderId}`,
        order_id: req.params.orderId,
        return_url: `${config.website.url}/order-confirmation/${req.params.orderId}`,
        notify_url: `${config.website.url}/api/payment-callback`,
        orderTimeout: timeLeft,
        orderStartTime: orderTime,
        payment_status: order.payment_status,
        transactionId: transactionId
      };
    } else if (order.payment_method === 'cod') {
      paymentInfo = {
        amount: order.total_amount,
        order_id: req.params.orderId,
        payment_method: 'cod',
        status: order.payment_status,
        return_url: `${config.website.url}/order-confirmation/${req.params.orderId}`,
        transactionId: transactionId
      };
    } else {
      console.log('Unsupported payment method:', order.payment_method);
      return res.status(400).json({ message: 'Unsupported payment method' });
    }

    res.json(paymentInfo);
  } catch (error) {
    console.error('Get payment info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders with detailed information (for admin)
router.get('/all', async (req, res) => {
  try {
    const [orders] = await db.promise().query(`
      SELECT o.*, u.username, ua.fullName, ua.phone, ua.address
      FROM Orders o
      JOIN Users u ON o.user_id = u.id
      LEFT JOIN UserAddresses ua ON o.address_id = ua.id
      ORDER BY o.created_at DESC
    `);

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.promise().query(`
        SELECT oi.*, p.title, p.thumbnail
        FROM OrderItems oi
        JOIN Products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get order details by ID
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.promise().query(`
      SELECT o.*, u.username, ua.fullName, ua.phone, ua.address
      FROM Orders o
      JOIN Users u ON o.user_id = u.id
      LEFT JOIN UserAddresses ua ON o.address_id = ua.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await db.promise().query(`
      SELECT oi.*, p.title, p.thumbnail
      FROM OrderItems oi
      JOIN Products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);

    res.json({ ...order, items });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    if (!['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [result] = await db.promise().query(
      'UPDATE Orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const [order] = await db.promise().query(
      'SELECT status FROM Orders WHERE id = ?',
      [req.params.id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order[0].status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }

    const [result] = await db.promise().query(
      'UPDATE Orders SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to cancel order' });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update order items
router.put('/:id/items', async (req, res) => {
  const { items, discountType, discountValue } = req.body;
  try {
    await db.promise().query('START TRANSACTION');

    await db.promise().query('DELETE FROM OrderItems WHERE order_id = ?', [req.params.id]);

    for (const item of items) {
      await db.promise().query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [req.params.id, item.product_id, item.quantity, item.price]
      );
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discount = discountType === 'percent' ? (subtotal * discountValue) / 100 : discountValue;
    const totalAmount = subtotal - discount;

    await db.promise().query('UPDATE Orders SET total_amount = ?, discount_type = ?, discount_value = ? WHERE id = ?', 
      [totalAmount, discountType, discountValue, req.params.id]);

    await db.promise().query('COMMIT');

    res.json({ message: 'Order items updated successfully' });
  } catch (error) {
    await db.promise().query('ROLLBACK');
    console.error('Update order items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userOrderRoutes = router;