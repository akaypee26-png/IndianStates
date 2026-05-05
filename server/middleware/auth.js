const jwt = require('jsonwebtoken');

// Middleware to protect routes – verifies JWT from Authorization header
module.exports = function (req, res, next) {
  // Expect token in format: 'Bearer <token>'
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Malformed token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    // decoded contains payload (e.g., { id: userId, iat: ..., exp: ... })
    req.user = decoded; // attach to request for downstream handlers
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
