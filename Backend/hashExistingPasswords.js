const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function hashExistingPasswords() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'phone_store',
    port: process.env.DB_PORT || 3306
  });

  try {
    const [rows] = await connection.execute('SELECT id, password FROM Users WHERE password_hashed = FALSE');
    for (const user of rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute('UPDATE Users SET password = ?, password_hashed = TRUE WHERE id = ?', [hashedPassword, user.id]);
      console.log(`Hashed password for user ID ${user.id}`);
    }
    console.log('All unhashed passwords have been hashed successfully.');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  } finally {
    await connection.end();
  }
}

// Chạy hàm nếu script được chạy trực tiếp
if (require.main === module) {
  hashExistingPasswords().then(() => process.exit());
}

module.exports = hashExistingPasswords;