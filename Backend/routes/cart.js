const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const authenticateToken = require('../middleware/auth'); // Xóa dòng này

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    const user_id = req.user.id;

    const [cartItems] = await db.promise().query(`
      SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
      FROM Cart c
      JOIN Products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [user_id]);

    console.log('Cart items fetched:', cartItems);
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
  try {
    const { quantity } = req.body;
    const user_id = req.user.id;
    const cart_item_id = req.params.id;

    await db.promise().query(
      'UPDATE Cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cart_item_id, user_id]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', async (req, res) => {
  try {
    const user_id = req.user.id;
    const cart_item_id = req.params.id;

    await db.promise().query(
      'DELETE FROM Cart WHERE id = ? AND user_id = ?',
      [cart_item_id, user_id]
    );

    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
