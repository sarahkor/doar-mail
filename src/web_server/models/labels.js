const mongoose = require('mongoose');
const ALLOWED_COLORS = ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink',
  "#f28b82", "#fbbc04", "#fff475", "#ccff90", "#a7ffeb", "#cbf0f8", "#aecbfa", "#d7aefb", "#fdcfe8", "#e6c9a8", "#e8eaed"];

const ALLOWED_FIELDS = ['name', 'color', 'parentId'];
const REQUIRED_FIELDS = ['name'];

const labelSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  name: { type: String, required: true },
  color: { type: String, enum: ALLOWED_COLORS, default: 'gray' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Label', default: null },
  mailIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mail' }]
}, { timestamps: true });

// ensure each user can’t have two labels with the same name
labelSchema.index({ username: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);
module.exports.ALLOWED_COLORS = ALLOWED_COLORS;
module.exports.ALLOWED_FIELDS = ALLOWED_FIELDS;
module.exports.REQUIRED_FIELDS = REQUIRED_FIELDS;
