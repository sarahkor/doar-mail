const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret'; 

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header." });
  }

  const token = authHeader.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ error: "Token missing." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
