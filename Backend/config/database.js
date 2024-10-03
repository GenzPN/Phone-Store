import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1029',
  database: process.env.DB_NAME || 'phone_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Kết nối cơ sở dữ liệu thành công!');
    connection.release();
  } catch (err) {
    console.error('Lỗi kết nối cơ sở dữ liệu:', err);
    console.error('Host:', process.env.DB_HOST);
    console.error('User:', process.env.DB_USER);
    console.error('Database:', process.env.DB_NAME);
  }
}

checkConnection();

export default pool;
