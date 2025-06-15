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

// Route to get current user's profile
router.get('/me', authenticateToken, (req, res) => {
    const user = req.user;
    console.log('👤 /me endpoint - user data:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        picture: user.picture,
        birthday: user.birthday,
        phone: user.phone,
        gender: user.gender
    });
    const { password, ...safeUser } = user;
    res.status(200).json({
        status: "success",
        user: safeUser
    });
});

router.get('/:id', authenticateToken, getUserById);

// Temporary route to update user birthday (for testing purposes)
router.patch('/me/birthday', authenticateToken, (req, res) => {
    const user = req.user;
    const { birthday } = req.body;

    if (!birthday) {
        return res.status(400).json({
            status: "error",
            message: "Birthday is required"
        });
    }

    // Validate birthday
    const birthDate = new Date(birthday);
    if (isNaN(birthDate) || birthDate > new Date()) {
        return res.status(400).json({
            status: "error",
            message: "Invalid birthday. Must be a past date."
        });
    }

    // Update the user's birthday
    user.birthday = birthday;

    console.log('🎂 Updated birthday for user:', user.username, 'to:', birthday);

    const { password, ...safeUser } = user;
    res.status(200).json({
        status: "success",
        message: "Birthday updated successfully",
        user: safeUser
    });
});

module.exports = router;
