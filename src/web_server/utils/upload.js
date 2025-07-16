const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname);
    // Fallback to .jpg if no extension
    if (!ext) ext = '.jpg';
    cb(null, uniqueSuffix + ext);
  }
});

// This ensures all uploaded files have a valid extension for compatibility with Android/Glide
module.exports = multer({ storage });