import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'phone_store',
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
  }
}

checkConnection();

export default pool;
