const express = require('express');
const router = express.Router();
const {
  getTrash,
  deleteFromTrash,
  emptyTrash,
  restoreFromTrash
} = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');

router.get('/', authenticateToken, getTrash);
router.delete('/empty', authenticateToken, emptyTrash);
router.delete('/:id', authenticateToken, deleteFromTrash);
router.post('/:id/restore', authenticateToken, restoreFromTrash);

module.exports = router;
