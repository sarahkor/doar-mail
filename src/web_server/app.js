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

// Enable CORS for React development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, id');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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


// Enable dev auth bypass
process.env.DISABLE_AUTH = 'true';

// Create dev user for testing
const { addUser } = require('./models/userModel');
const sessions = require('./models/sessions');
const devUser = {
  id: 'dev-user',
  firstName: 'Dev',
  lastName: 'User',
  username: 'dev@example.com',
  password: 'dev123',
  picture: null,
  phone: null,
  birthday: null,
  inbox: [],
  sent: [],
  drafts: [],
  labels: []
};
addUser(devUser);
sessions.add('dev-user'); // Add to active sessions

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
  console.log('Auth bypass enabled for development');
  console.log('Dev user created with ID: dev-user');
});
