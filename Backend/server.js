const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const hashExistingPasswords = require('./hashExistingPasswords');
const cookieRoutes = require('./routes/cookie');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please set it in your .env file.');
  process.exit(1);
}

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi nếu frontend của bạn chạy ở port khác
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin'], // Thêm 'x-admin' vào danh sách các header được phép
  credentials: true // Thêm dòng này để cho phép gửi cookie
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cookie', cookieRoutes);

const PORT = process.env.PORT || 5000;

// Hàm để khởi động server
async function startServer() {
  try {
    // Chạy hàm hash password trước khi khởi động server
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

// Khởi động server
startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});