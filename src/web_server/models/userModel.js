const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String },
  phone: { type: String, default: null },
  birthday: { type: String, default: null },
  gender: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema);
