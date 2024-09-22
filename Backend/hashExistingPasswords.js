const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function hashExistingPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'phone_store',
    port: 3306
  });

  try {
    const [rows] = await connection.execute('SELECT id, password FROM Users WHERE password_hashed = 0');
    for (const user of rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute('UPDATE Users SET password = ?, password_hashed = 1 WHERE id = ?', [hashedPassword, user.id]);
    }
    console.log('All unhashed passwords have been hashed successfully.');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  } finally {
    await connection.end();
  }
}

// Export the function so it can be used in other files
module.exports = hashExistingPasswords;