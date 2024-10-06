import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import { authenticateJWT } from '../middleware/auth.js';
import crypto from 'crypto'; // Thêm import này

const router = express.Router();

// Lấy thông tin người dùng (không cần xác thực)
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, fullName, gender, image, isAdmin, created_at FROM Users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json(user);
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
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Log để debug

    // Thay đổi truy vấn để tìm kiếm cả email và username
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ? OR username = ?', [username, username]);
    console.log('Database query result:', rows); // Log kết quả truy vấn

    if (rows.length === 0) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', isPasswordValid); // Log kết quả so sánh mật khẩu

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set token vào cookie
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000 // 1 giờ
    });

    console.log('Login successful:', user.email);
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        fullName: user.fullName,
        gender: user.gender,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm route đăng xuất
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'  // Thêm dòng này
  });
  res.json({ message: 'Logged out successfully' });
});

// Thêm route đăng ký mới hoặc cập nhật route đăng ký hiện có
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, gender } = req.body;

    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const [existingUser] = await db.query('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo Gravatar URL với chất lượng cao hơn
    const gravatarUrl = getGravatarUrl(email);

    // Thêm người dùng mới vào database
    const [result] = await db.query(
      'INSERT INTO Users (username, email, password, fullName, gender, image) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, fullName, gender, gravatarUrl]
    );

    // Tạo token JWT
    const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Gửi phản hồi
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        username,
        email,
        fullName,
        gender,
        image: gravatarUrl
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Hàm tạo Gravatar URL
function getGravatarUrl(email, size = 200) {
  const trimmedEmail = email.trim().toLowerCase();
  const hash = crypto.createHash('sha256').update(trimmedEmail).digest('hex');
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

export { router as authRoutes };
