import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Lấy thông tin người dùng (không cần xác thực)
router.get('/me', async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, username, email, fullName, gender, image, isAdmin FROM Users LIMIT 1');
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as authRoutes };
