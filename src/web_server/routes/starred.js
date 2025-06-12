const express = require('express');
const router = express.Router();
const { getStarredMails, toggleStarred } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getStarredMails);
router.post('/:id', authenticateToken, toggleStarred);

module.exports = router;
