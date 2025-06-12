const express = require('express');
const router = express.Router();
const { getInbox } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getInbox);

module.exports = router;
