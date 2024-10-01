import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

// Admin routes
import { adminProductRoutes } from './routes/admin/products.js';
import { adminUserRoutes } from './routes/admin/users.js';
import { adminOrderRoutes } from './routes/admin/orders.js';

// User routes
import { userProfileRoutes } from './routes/user/profile.js';
import { userAddressRoutes } from './routes/user/addresses.js';
import { userOrderRoutes } from './routes/user/orders.js';
import { userCartRoutes } from './routes/user/cart.js';

// Public routes
import { authRoutes } from './routes/auth.js';
import { publicProductRoutes } from './routes/products.js';

dotenv.config();

const app = express();

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
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

// User routes
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/addresses', userAddressRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/user/cart', userCartRoutes);

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