const db = require('./config/database');
const bcrypt = require('bcrypt');

async function hashExistingPasswords() {
  try {
    const [users] = await db.promise().query('SELECT id, password FROM Users');
    for (const user of users) {
      if (!user.password.startsWith('$2b$')) { // Kiểm tra nếu mật khẩu chưa được mã hóa
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db.promise().query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      }
    }
  } catch (error) {
    console.error('Error hashing existing passwords:', error);
    throw error;
  }
}

module.exports = hashExistingPasswords;