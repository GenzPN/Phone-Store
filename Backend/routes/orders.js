const express = require('express');
const router = express.Router();
const db = require('../config/database');

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
    const [result] = await db.promise().query(
      'UPDATE Orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
