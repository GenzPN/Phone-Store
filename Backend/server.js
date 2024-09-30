const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { authenticateUser, authenticateAdmin } = require('./middleware/auth');

const app = express();

// Admin routes
const adminProductRoutes = require('./routes/admin/products');
const adminUserRoutes = require('./routes/admin/users');
const adminOrderRoutes = require('./routes/admin/orders');
const adminSettingsRoutes = require('./routes/admin/settings');

// User routes
const userProfileRoutes = require('./routes/user/profile');
const userAddressRoutes = require('./routes/user/addresses');
const userOrderRoutes = require('./routes/user/orders');
const userCartRoutes = require('./routes/user/cart');

// Public routes
const authRoutes = require('./routes/auth');
const publicProductRoutes = require('./routes/products');

// Cấu hình CORS và middleware khác
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/products', publicProductRoutes);

// Admin routes
app.use('/api/admin/products', authenticateAdmin, adminProductRoutes);
app.use('/api/admin/users', authenticateAdmin, adminUserRoutes);
app.use('/api/admin/orders', authenticateAdmin, adminOrderRoutes);
app.use('/api/admin/settings', authenticateAdmin, adminSettingsRoutes);

// User routes
app.use('/api/user/profile', authenticateUser, userProfileRoutes);
app.use('/api/user/addresses', authenticateUser, userAddressRoutes);
app.use('/api/user/orders', authenticateUser, userOrderRoutes);
app.use('/api/user/cart', authenticateUser, userCartRoutes);

const PORT = process.env.PORT || 5000;

// Function to start the server
async function startServer() {
  try {
    async function hashExistingPasswords() {
      console.log("Hashing existing passwords...");
      // Add your password hashing logic here
    }

    await hashExistingPasswords();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});