import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const router = express.Router();

// Lấy thông tin người dùng (không cần xác thực)
router.get('/me', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, fullName, gender, image, isAdmin FROM Users LIMIT 1');
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.options('/login', (req, res) => {
  res.sendStatus(200);
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set token vào cookie
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Sử dụng HTTPS trong production
      sameSite: 'strict',
      maxAge: 3600000 // 1 giờ
    });

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName,
        gender: user.gender,
        isAdmin: user.isAdmin
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as authRoutes };
