const express = require('express');
const app = express();
app.set('json spaces', 2);

// Import routes
const blacklistRoute = require('./routes/blacklistRoutes');
const userRoute = require('./routes/userRoutes');
const mailRoute = require('./routes/mails');
const labelRoute = require('./routes/labels');

// Import login controller directly
const { loginUser } = require('./controllers/userController');

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON syntax' });
  }
  next();
});

// Route mounting
app.use('/api/blacklist', blacklistRoute);
app.use('/api/users', userRoute);
app.use('/api/mails', mailRoute);
app.use('/api/labels', labelRoute);
app.post('/api/tokens', loginUser);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});


app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
