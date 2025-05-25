// Import Express to use its routing features
const express = require('express');

// Create a new router object (mini Express app for user routes)
const router = express.Router();

// Import both controller functions at once
const { registerUser, loginUser, getUserById } = require('../controllers/userController');

// Route for user registration: POST /api/users
router.post('/', registerUser);

// Route for user login: POST /api/users/tokens
router.post('/tokens', loginUser);

// Route for getting user by ID: GET /api/users/:id
router.get('/:id', getUserById);

// Export the router so it can be used in app.js
module.exports = router;
