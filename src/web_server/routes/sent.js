const express = require('express');
const router = express.Router();
const { getSent } = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getSent);

module.exports = router;
