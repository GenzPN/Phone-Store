const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const hashExistingPasswords = require('./hashExistingPasswords');
const cookieRoutes = require('./routes/cookie');
const settingsRoutes = require('./routes/settings');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Please set it in your .env file.');
  process.exit(1);
}

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1', 'http://0.0.0.0'], // Danh sách URL của frontend được phép truy cập
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin']
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
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;

// Function to start the server
async function startServer() {
  try {
    // Run the hash password function before starting the server
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