const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please set it in your .env file.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',  // Mặc định XAMPP không có password
  database: 'phone_store',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Middleware để xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API endpoints
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM Products', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password }); // Log thông tin đăng nhập

  db.query('SELECT * FROM Users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log('Query results:', results); // Log kết quả truy vấn

    if (results.length > 0) {
      const user = results[0];
      console.log('Stored hashed password:', user.password); // Log mật khẩu đã hash trong DB

      const match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match); // Log kết quả so sánh mật khẩu

      if (match) {
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ user: { id: user.id, username: user.username, email: user.email }, accessToken: token });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO Users (username, email, password, firstName, lastName, phone) VALUES (?, ?, ?, ?, ?, ?)', 
      [username, email, hashedPassword, fullName.split(' ')[0], fullName.split(' ').slice(1).join(' '), phone], 
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.query('SELECT id, username, email, firstName, lastName, gender, image FROM Users WHERE id = ?', [req.user.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

app.get('/api/users/:userId/addresses', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  db.query('SELECT * FROM UserAddresses WHERE user_id = ?', [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/api/users/:userId/addresses', authenticateToken, (req, res) => {
  const userId = req.params.userId;
  const { address, phone, is_default } = req.body;
  db.query('INSERT INTO UserAddresses (user_id, address, phone, is_default) VALUES (?, ?, ?, ?)', 
    [userId, address, phone, is_default], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, message: 'Address added successfully' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
});

// Add this error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});