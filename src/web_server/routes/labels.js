const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labels');

router.route('/')
  .get(labelController.listLabels)
  .post(labelController.createLabel);

router.route('/:id')
  .get(labelController.getLabel)
  .patch(labelController.editLabel)
  .delete(labelController.deleteLabel);
router.post('/:id/mails', labelController.addMailToLabel);

module.exports = router;