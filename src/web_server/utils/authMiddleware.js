const jwt = require('jsonwebtoken');
require('dotenv').config();
const { findUserById } = require('../models/userModel');

const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Missing token. Please log in first.'
    });
  }

  jwt.verify(token, jwtSecret, (err, payload) => {
    if (err) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token.'
      });
    }

    const user = findUserById(payload.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User no longer exists.'
      });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
