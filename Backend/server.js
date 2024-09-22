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
app.get('/api/products', async (req, res) => {
  try {
    const results = await executeQuery('SELECT * FROM Products');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  try {
    const [users] = await db.promise().query('SELECT * FROM Users WHERE username = ?', [username]);
    console.log('Query results:', users);

    if (users.length > 0) {
      const user = users[0];
      console.log('Stored password:', user.password);
      console.log('Password hashed:', user.password_hashed);

      let passwordMatch = false;

      if (user.password_hashed) {
        // If the password is hashed, use bcrypt to compare
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // If the password is not hashed, compare directly and then hash it
        passwordMatch = password === user.password;
        if (passwordMatch) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.promise().query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
          console.log('Password hashed and updated for user:', user.id);
        }
      }

      console.log('Password match:', passwordMatch);

      if (passwordMatch) {
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ 
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            fullName: user.fullName
          }, 
          accessToken: token 
        });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(400).json({ error: 'User not found' });
    }

    // After login attempt, hash any remaining unhashed passwords
    await hashExistingPasswords();

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, username, password, gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query(
      'INSERT INTO Users (username, email, fullName, password, password_hashed, gender, phone) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [username, email, fullName, hashedPassword, 1, gender, phone]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const results = await executeQuery('SELECT id, username, email, fullName, gender, image FROM Users WHERE id = ?', [req.user.id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Thêm endpoint để lấy đánh giá sản phẩm
app.get('/api/products/:productId/ratings', (req, res) => {
  const productId = req.params.productId;
  db.query('SELECT * FROM ProductRatings WHERE product_id = ? ORDER BY created_at DESC', [productId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Thêm endpoint để thêm đánh giá mới
app.post('/api/products/:productId/ratings', (req, res) => {
  const productId = req.params.productId;
  const { name, rating, comment } = req.body;
  
  db.query('INSERT INTO ProductRatings (product_id, name, rating, comment) VALUES (?, ?, ?, ?)', 
    [productId, name, rating, comment], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: result.insertId, message: 'Rating added successfully' });
  });
});

// Add this new endpoint for creating orders
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total, paymentMethod, address } = req.body;
  const userId = req.user.id;

  try {
    // Start a transaction
    await db.promise().query('START TRANSACTION');

    // Insert address if it's new
    let addressId;
    const [existingAddresses] = await db.promise().query('SELECT id FROM UserAddresses WHERE user_id = ? AND address = ?', [userId, address.address]);
    if (existingAddresses.length === 0) {
      const [addressResult] = await db.promise().query(
        'INSERT INTO UserAddresses (user_id, fullName, phone, address, address_type, company_name) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, address.fullName, address.phone, address.address, address.addressType, address.companyName]
      );
      addressId = addressResult.insertId;
    } else {
      addressId = existingAddresses[0].id;
    }

    // Create order
    const [orderResult] = await db.promise().query(
      'INSERT INTO Orders (user_id, address_id, total_amount, status, note) VALUES (?, ?, ?, ?, ?)',
      [userId, addressId, total, 'pending', address.note]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await db.promise().query(
        'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    // Create payment record
    await db.promise().query(
      'INSERT INTO Payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
      [orderId, total, paymentMethod, 'pending']
    );

    // Commit the transaction
    await db.promise().query('COMMIT');

    res.json({ success: true, orderId });
  } catch (error) {
    // If there's an error, rollback the transaction
    await db.promise().query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Error creating order' });
  }
});

// Add this new endpoint for fetching cart items
app.get('/api/cart', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    `SELECT c.id, p.title as name, p.thumbnail as image, c.quantity, p.price 
     FROM Cart c 
     JOIN Products p ON c.product_id = p.id 
     WHERE c.user_id = ?`, 
    [userId], 
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(results);
    }
  );
});

// Add this new endpoint for updating cart items
app.post('/api/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { cartItems } = req.body;

  try {
    // Start a transaction
    await db.promise().query('START TRANSACTION');

    // Delete existing cart items for the user
    await db.promise().query('DELETE FROM Cart WHERE user_id = ?', [userId]);

    // Insert new cart items
    for (const item of cartItems) {
      await db.promise().query(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, item.id, item.quantity]
      );
    }

    // Commit the transaction
    await db.promise().query('COMMIT');

    res.json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    // If there's an error, rollback the transaction
    await db.promise().query('ROLLBACK');
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, error: 'Error updating cart' });
  }
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

const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};