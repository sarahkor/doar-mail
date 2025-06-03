const express = require('express');
const router = express.Router();
const controller = require('../controllers/blacklistController');

router.route('/').post(controller.addToBlacklist);
router.delete('/:url', controller.removeFromBlacklist);

module.exports = router;
