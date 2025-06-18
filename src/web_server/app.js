const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
require('dotenv').config();

const express = require('express');
const app = express();
const upload = require('./utils/upload');

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.set('json spaces', 2);

// Middlewares
app.use(express.json());

// CORS Middleware
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

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

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
const searchRoute = require('./routes/searchRoutes');
const { loginUser } = require('./controllers/userController');

// API Endpoints
app.use('/api/blacklist', blacklistRoute);
app.use('/api/users', userRoute);
app.use('/api/mails', mailRoute);
app.use('/api/inbox', inboxRoute);
app.use('/api/drafts', draftsRoute);
app.use('/api/sent', sentRoute);
app.use('/api/spam', spamRoute);
app.use('/api/trash', trashRoute);
app.use('/api/starred', starredRoute);
app.use('/api/labels', labelRoute);
app.use('/api/search', searchRoute);

// Special login endpoint
app.post('/api/tokens', loginUser);

// Serve React app
const clientBuildPath = path.resolve(__dirname, '../react-client/build');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});



// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
