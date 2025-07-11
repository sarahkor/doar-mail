const mongoose = require('mongoose');

const mailUserViewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mailId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mail', required: true },

  folder: { type: String, enum: ['inbox', 'sent', 'draft', 'spam', 'trash'], required: true },
  status: { type: String, enum: ['draft', 'sent', 'spam'], required: true },
  read: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
  originalFolders: { type: [String], default: [] },
  deletedAt: { type: Number },
}, { timestamps: true });

mailUserViewSchema.index({ username: 1, mailId: 1, folder: 1 }, { unique: true });

module.exports = mongoose.model('MailUserView', mailUserViewSchema);