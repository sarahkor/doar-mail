const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Missing MONGODB_URI in .env');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log(' MongoDB connected', mongoose.connection.name))
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = mongoose;
