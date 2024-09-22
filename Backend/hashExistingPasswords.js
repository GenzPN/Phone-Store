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
    const [rows] = await connection.execute('SELECT id, password FROM Users');
    for (const user of rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
    }
    console.log('All passwords have been hashed successfully.');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  } finally {
    await connection.end();
  }
}

hashExistingPasswords();