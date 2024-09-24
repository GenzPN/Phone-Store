const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Bỏ qua xác thực cho các yêu cầu từ admin
  if (req.headers['x-admin'] === 'true') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('Token is null');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
