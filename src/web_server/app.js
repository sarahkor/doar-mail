const express = require('express');
const app = express();

const blacklistRoutes = require('./api/routes/blacklistRoutes');

app.use(express.json());
app.use('/api/blacklist', blacklistRoutes);

// check if it is correct??
app.listen(8080)