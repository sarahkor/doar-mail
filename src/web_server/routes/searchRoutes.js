const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, searchController.searchMails);

module.exports = router; 