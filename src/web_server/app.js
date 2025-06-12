const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();

app.set('json spaces', 2);

// Middlewares
app.use(express.json());


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Handle invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON syntax' });
  }
  next();
});

// Routes
const blacklistRoute = require('./routes/blacklistRoutes');
const userRoute = require('./routes/userRoutes');
const mailRoute = require('./routes/mails');
const labelRoute = require('./routes/labels');
const inboxRoute = require('./routes/inbox');
const draftsRoute = require('./routes/drafts');
const sentRoute = require('./routes/sent');
const spamRoute = require('./routes/spam');
const trashRoute = require('./routes/trash');
const starredRoute = require('./routes/starred');
const { loginUser } = require('./controllers/userController');

app.use('/api/blacklist', blacklistRoute);
app.use('/api/users', userRoute);
app.use('/api/mails', mailRoute);
app.use('/api/labels', labelRoute);
app.post('/api/tokens', loginUser);
app.use('/api/inbox', inboxRoute);
app.use('/api/drafts', draftsRoute);
app.use('/api/sent', sentRoute);
app.use('/api/spam', spamRoute);
app.use('/api/trash', trashRoute);
app.use('/api/starred', starredRoute);


app.use(express.static(path.join(__dirname, '..', 'react-client', 'build')));


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'react-client', 'build', 'index.html'));
});


// Dev session & user
process.env.DISABLE_AUTH = 'true';
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
  gender: null,
  inbox: [],
  sent: [],
  drafts: [],
  labels: [],
};

addUser(devUser);
sessions.add('dev-user');

// Start server
app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
