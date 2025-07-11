const jwt = require('jsonwebtoken');
const { findUserById } = require('../services/userService');
const jwtSecret = process.env.JWT_SECRET;

async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Missing token.' });
  }

  jwt.verify(token, jwtSecret, async (err, payload) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    // **this must be awaited**
    const user = await findUserById(payload.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
