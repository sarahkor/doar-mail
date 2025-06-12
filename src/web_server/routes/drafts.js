const express = require('express');
const router = express.Router();
const { getDrafts } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getDrafts);

module.exports = router;
