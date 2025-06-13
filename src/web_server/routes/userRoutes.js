// Description: Routes for user-related operations such as registration, login, and fetching user details.
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to save files in 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// Importing user controller functions and authentication middleware
const { registerUser, loginUser, getUserById } = require('../controllers/userController');
const authenticateToken = require('../utils/authMiddleware');

// Route definitions for user operations

router.post('/', upload.single('profilePicture'), registerUser);

router.post('/tokens', loginUser);

router.get('/:id', authenticateToken, getUserById);

module.exports = router;
