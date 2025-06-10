// Description: Routes for user-related operations such as registration, login, and fetching user details.
const express = require('express');
const router = express.Router();

// Importing user controller functions and authentication middleware
const { registerUser, loginUser, getUserById } = require('../controllers/userController');
const authenticateToken = require('../utils/authMiddleware');


// Route definitions for user operations
router.post('/', registerUser);

router.post('/tokens', loginUser);

router.get('/:id', authenticateToken, getUserById);

module.exports = router;
