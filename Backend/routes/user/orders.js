import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

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