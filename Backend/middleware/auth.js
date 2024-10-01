import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader); // Kiểm tra header

  if (!authHeader) {
    console.log('No Authorization header');
    return res.sendStatus(401);
  }

  const token = authHeader.split(' ')[1];
  console.log('Extracted Token:', token); // Kiểm tra token đã trích xuất

  if (!token) {
    console.log('No token found in Authorization header');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
