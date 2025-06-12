const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labels');
const authenticateToken = require('../utils/authMiddleware'); // ✅ add this

router.route('/')
  .get(authenticateToken, labelController.listLabels)
  .post(authenticateToken, labelController.createLabel);

router.route('/:id')
  .get(authenticateToken, labelController.getLabel)
  .patch(authenticateToken, labelController.editLabel)
  .delete(authenticateToken, labelController.deleteLabel);

router.post('/:id/mails', authenticateToken, labelController.addMailToLabel);
router.delete('/:labelId/:mailId', authenticateToken, labelController.removeFromLabel);

module.exports = router;