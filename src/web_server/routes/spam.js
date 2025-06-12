const express = require('express');
const router = express.Router();
const { getSpam, markAsSpam, unmarkAsSpam } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getSpam);
router.post('/:id', authenticateToken, markAsSpam);
router.post('/:id/unspam', authenticateToken, unmarkAsSpam);

module.exports = router;
