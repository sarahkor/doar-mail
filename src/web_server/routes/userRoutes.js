// Description: Routes for user-related operations such as registration, login, and fetching user details.
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure multer to save files in 'uploads/' directory
const upload = require('../utils/upload');

// Importing user controller functions and authentication middleware
const { registerUser, loginUser, getUserById } = require('../controllers/userController');
const { getUserByIdService } = require('../services/userService');
const authenticateToken = require('../utils/authMiddleware');

// Route definitions for user operations

router.post('/', upload.single('profilePicture'), registerUser);

router.post('/tokens', loginUser);

// Route to get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await getUserByIdService(req.user._id, req.user._id);
        res.status(200).json({
            status: "success",
            user: user
        });
    } catch (err) {
        res.status(err.status || 500).json({
            status: "error",
            message: err.message || "Failed to fetch user data."
        });
    }
});

router.get('/:id', authenticateToken, getUserById);

module.exports = router;