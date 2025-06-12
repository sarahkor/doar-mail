const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mails');
const authenticateToken = require('../utils/authMiddleware');
const upload = require('../utils/upload');

router.route('/')
  .get(authenticateToken, mailController.listMails)
  .post(authenticateToken, upload.any(), mailController.createMail);

router.get('/all', authenticateToken, mailController.getAllMails);
router.get('/search/:query', authenticateToken, mailController.searchMails);

router.route('/:id')
  .get(authenticateToken, mailController.getMailById)
  .patch(authenticateToken, mailController.updateMail)
  .delete(authenticateToken, mailController.deleteMail);

module.exports = router;