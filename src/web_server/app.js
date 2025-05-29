const express = require('express');
const app = express();

// Import routes
const blacklistRoutes = require('./routes/blacklistRoutes');
const userRoutes = require('./routes/userRoutes');

// Import login controller directly
const { loginUser } = require('./controllers/userController');

app.use(express.json());

// Route mounting
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/users', userRoutes);
app.post('/api/tokens', loginUser);

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
