const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Lấy danh sách đơn hàng của người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.promise().query(
      'SELECT o.id, o.status, o.total_amount, oi.product_id, p.title as name, p.thumbnail as image, oi.quantity as amount, o.note, o.created_at, p.price FROM Orders o JOIN OrderItems oi ON o.id = oi.order_id JOIN Products p ON oi.product_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
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

module.exports = router;
