const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  originalName: String,
  mimetype: String,
  size: Number,
  url: String
});

const mailSchema = new mongoose.Schema({
  from: String,
  fromName: String,
  to: String,
  toName: String,
  subject: String,
  bodyPreview: String,
  timestamp: Number,
  date: String,
  time: String,
  attachments: [attachmentSchema],
  labelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }]
});

module.exports = mongoose.model('Mail', mailSchema);