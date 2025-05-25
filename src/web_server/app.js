const express = require('express');
const app = express();

// 🛠 Import both sets of routes
const blacklistRoutes = require('./routes/blacklistRoutes');
const userRoutes = require('./routes/userRoutes'); 

app.use(express.json());

// Mount the routes under logical endpoints
app.use('/api/blacklist', blacklistRoutes);
app.use('/api/users', userRoutes); 

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
