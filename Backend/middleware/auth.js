const jwt = require('jsonwebtoken');

function verifyToken(token, requireAdmin = false) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) reject(err);
      if (requireAdmin && !user.isAdmin) reject(new Error('Admin access required'));
      resolve(user);
    });
  });
}

function createAuthMiddleware(requireAdmin = false) {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    try {
      req.user = await verifyToken(token, requireAdmin);
      next();
    } catch (error) {
      return res.sendStatus(403);
    }
  };
}

module.exports = {
  authenticateUser: createAuthMiddleware(false),
  authenticateAdmin: createAuthMiddleware(true)
};
