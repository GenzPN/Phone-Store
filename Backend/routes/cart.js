const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const authenticateToken = require('../middleware/auth'); // Xóa dòng này

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    // Giả sử bạn có user_id từ authentication middleware
    const user_id = req.user.id; // Thay thế bằng cách lấy user_id thực tế

    const [cartItems] = await db.promise().query(`
      SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
      FROM Cart c
      JOIN Products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [user_id]);

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id; // Thay thế bằng cách lấy user_id thực tế

    const [result] = await db.promise().query(
      'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [user_id, product_id, quantity]
    );

    res.status(201).json({ message: 'Product added to cart', id: result.insertId });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    const [result] = await db.promise().query(
      'UPDATE Cart SET quantity = ? WHERE id = ?',
      [quantity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.promise().query('DELETE FROM Cart WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
