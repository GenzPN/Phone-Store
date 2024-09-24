const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Lấy danh sách đơn hàng của người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('User ID:', req.user.id); // Log user ID để kiểm tra

    const [orders] = await db.promise().query(
      'SELECT * FROM Orders WHERE user_id = ?',
      [req.user.id]
    );

    console.log('Raw orders:', orders); // Log raw orders data

    const formattedOrders = orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    console.log('Formatted orders:', formattedOrders); // Log formatted orders

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Tạo đơn hàng mới
router.post('/', authenticateToken, async (req, res) => {
  const { address_id, total_amount, note, items } = req.body;
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      'INSERT INTO Orders (user_id, address_id, total_amount, note) VALUES (?, ?, ?, ?)',
      [req.user.id, address_id, total_amount, note]
    );

    const order_id = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    await conn.query('DELETE FROM Cart WHERE user_id = ?', [req.user.id]);

    await conn.commit();
    res.status(201).json({ message: 'Order created', order_id });
  } catch (error) {
    await conn.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    conn.release();
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.promise().query(
      'SELECT * FROM Orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const [orderItems] = await db.promise().query(
      'SELECT oi.*, p.title, p.thumbnail FROM OrderItems oi JOIN Products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [req.params.id]
    );
    res.json({ ...orders[0], items: orderItems });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm route mới để lấy tất cả đơn hàng (chỉ cho admin)
router.get('/all', authenticateToken, async (req, res) => {
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
router.get('/test', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.promise().query('SELECT * FROM Orders');
    res.json(orders);
  } catch (error) {
    console.error('Test orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
