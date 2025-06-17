const express = require('express');
const router = express.Router();
const { getStarredMails, toggleStarred, isMailStarred } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getStarredMails);
router.get('/:id', authenticateToken, isMailStarred);
router.post('/:id', authenticateToken, toggleStarred);

module.exports = router;
