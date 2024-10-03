import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalOrdersResult] = await db.query('SELECT COUNT(*) as total FROM Orders');
    const [totalRevenueResult] = await db.query('SELECT SUM(total_amount) as total FROM Orders WHERE status != "cancelled"');
    const [totalCustomersResult] = await db.query('SELECT COUNT(DISTINCT user_id) as total FROM Orders');
    const [completedOrdersResult] = await db.query('SELECT COUNT(*) as total FROM Orders WHERE status = "delivered"');

    res.json({
      totalOrders: totalOrdersResult[0].total,
      totalRevenue: totalRevenueResult[0].total || 0,
      totalCustomers: totalCustomersResult[0].total,
      completedOrders: completedOrdersResult[0].total,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all orders with detailed information (for admin)
router.get('/all', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, 
             u.username AS customer_name, 
             u.email AS customer_email,
             ua.full_name, ua.phone, ua.address, ua.city
      FROM Orders o
      LEFT JOIN Users u ON o.user_id = u.id
      LEFT JOIN UserAddresses ua ON o.shipping_address_id = ua.id
      ORDER BY o.created_at DESC
    `);

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.query(`
        SELECT oi.*, p.title, p.thumbnail
        FROM OrderItems oi
        JOIN Products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      return { 
        ...order, 
        items,
        customer_phone: order.phone || 'N/A',
        customer_address: order.address ? `${order.address}, ${order.city}` : 'N/A'
      };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get order details by ID
router.get('/:id', async (req, res) => {
  // Kiểm tra nếu id là 'stats', bỏ qua xử lý
  if (req.params.id === 'stats') {
    return next();
  }

  try {
    console.log('Fetching order with ID:', req.params.id);  // Thêm log
    const [orders] = await db.query(`
      SELECT o.*, u.username, u.email AS customer_email, 
             ua.full_name, ua.phone, ua.address, ua.city
      FROM Orders o
      LEFT JOIN Users u ON o.user_id = u.id
      LEFT JOIN UserAddresses ua ON o.shipping_address_id = ua.id
      WHERE o.id = ?
    `, [req.params.id]);

    console.log('Query result:', orders);  // Thêm log

    if (orders.length === 0) {
      console.log('Order not found');  // Thêm log
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    const [items] = await db.query(`
      SELECT oi.*, p.title, p.thumbnail
      FROM OrderItems oi
      JOIN Products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order.id]);

    console.log('Order items:', items);  // Thêm log

    res.json({ 
      ...order, 
      items,
      customer_phone: order.phone || 'N/A',
      customer_address: order.address ? `${order.address}, ${order.city}` : 'N/A'
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  const { 
    user_id, 
    shipping_address_id,
    total_amount, 
    status, 
    note,
    items
  } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Create new order
    const [orderResult] = await connection.query(
      'INSERT INTO Orders (user_id, shipping_address_id, total_amount, status, note) VALUES (?, ?, ?, ?, ?)',
      [user_id, shipping_address_id, total_amount, status, note]
    );

    const orderId = orderResult.insertId;

    // Add order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Update an existing order
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    shipping_address_id,
    items, 
    total_amount, 
    status, 
    note,
    customer_name,
    customer_email,
    customer_phone,
    address,
    discount_type,
    discount_value,
    user_id // Thêm user_id vào đây
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !total_amount || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate the status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Prepare update fields
    const updateFields = [
      'shipping_address_id = ?',
      'total_amount = ?',
      'status = ?',
      'note = ?',
      'updated_at = CURRENT_TIMESTAMP'
    ];
    const updateValues = [shipping_address_id, total_amount, status, note];

    // Add discount fields if they are provided
    if (discount_type !== undefined) {
      updateFields.push('discount_type = ?');
      updateValues.push(discount_type);
    }
    if (discount_value !== undefined) {
      updateFields.push('discount_value = ?');
      updateValues.push(discount_value);
    }

    // Add the order ID to the update values
    updateValues.push(id);

    // Update order information
    const [updateResult] = await connection.query(
      `UPDATE Orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update or create shipping address
    if (shipping_address_id) {
      await connection.query(
        `UPDATE UserAddresses SET 
          full_name = ?, 
          phone = ?, 
          address = ?, 
          city = ? 
        WHERE id = ?`,
        [customer_name, customer_phone, address, '', shipping_address_id]
      );
    } else {
      const [addressResult] = await connection.query(
        `INSERT INTO UserAddresses (user_id, full_name, phone, address, city) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id || null, customer_name, customer_phone, address, '']
      );
      await connection.query(
        'UPDATE Orders SET shipping_address_id = ? WHERE id = ?',
        [addressResult.insertId, id]
      );
    }

    // Delete existing order items
    await connection.query('DELETE FROM OrderItems WHERE order_id = ?', [id]);

    // Add new order items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price) {
        await connection.rollback();
        return res.status(400).json({ message: 'Invalid item data' });
      }

      await connection.query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [id, item.product_id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    connection.release();
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate the status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const [result] = await db.query(
      'UPDATE Orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
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

// Cancel an order (simplified version of status update)
router.put('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE Orders SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as adminOrderRoutes };