const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const authenticateToken = require('../middleware/auth'); // Xóa dòng này

// Lấy danh sách đơn hàng
router.get('/', async (req, res) => {
  try {
    const [orders] = await db.promise().query('SELECT * FROM Orders');
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Tạo đơn hàng mới
router.post('/', async (req, res) => {
  const { user_id, total_price, status, items } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO Orders (user_id, total_price, status) VALUES (?, ?, ?)',
      [user_id, total_price, status]
    );
    const orderId = result.insertId;

    for (const item of items) {
      await db.promise().query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: 'Order created', id: orderId });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await db.promise().query('SELECT * FROM Orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(orders[0]);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm route mới để lấy tất cả đơn hàng (chỉ cho admin)
router.get('/all', async (req, res) => {
  try {
    // Kiểm tra xem người dùng có phải là admin không
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

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

    console.log('Orders with items:', ordersWithItems); // Log để kiểm tra

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Thêm route mới để kiểm tra lấy tất cả đơn hàng
router.get('/test', async (req, res) => {
  try {
    const [orders] = await db.promise().query('SELECT * FROM Orders');
    res.json(orders);
  } catch (error) {
    console.error('Test orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
