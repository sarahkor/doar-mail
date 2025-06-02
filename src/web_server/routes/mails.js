const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mails');

router.route('/')
  .get(mailController.listMails)
  .post(mailController.createMail);

router.route('/:id')
  .get(mailController.getMailById)
  .patch(mailController.updateMail)
  .delete(mailController.deleteMail);

router.get('/search/:query', mailController.searchMails);

module.exports = router;