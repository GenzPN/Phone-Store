import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';  // Thêm morgan để log requests

// Admin routes
import { adminProductRoutes } from './routes/admin/products.js';
import { adminUserRoutes } from './routes/admin/users.js';
import { adminOrderRoutes } from './routes/admin/orders.js';
import { adminSettingsRoutes } from './routes/admin/settings.js';

// User routes
import { userProfileRoutes } from './routes/user/profile.js';
import { userAddressRoutes } from './routes/user/addresses.js';
import { userOrderRoutes } from './routes/user/orders.js';
import { userCartRoutes } from './routes/user/cart.js';

// Public routes
import { authRoutes } from './routes/auth.js';
import { publicProductRoutes } from './routes/products.js';

// Review routes
import { reviewRoutes } from './routes/reviews.js';

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

// Sử dụng morgan để log requests trong môi trường phát triển
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/products', publicProductRoutes);

// Admin routes
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
// User routes
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/addresses', userAddressRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/user/cart', userCartRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Use the admin order routes
app.use('/api/orders', adminOrderRoutes);

// Thêm middleware này sau tất cả các routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi server' });
});

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
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

// Start the server
startServer();

// Xử lý lỗi không được xử lý
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Đóng server một cách graceful
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Đóng server một cách graceful
  server.close(() => process.exit(1));
});