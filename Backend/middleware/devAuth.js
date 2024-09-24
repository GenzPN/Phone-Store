function devAuth(req, res, next) {
  // Simulate an authenticated user with admin role
  req.user = { role: 'admin' };
  next();
}

module.exports = devAuth;