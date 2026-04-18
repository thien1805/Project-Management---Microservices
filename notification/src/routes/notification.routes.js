const express = require('express');
const controller = require('../controllers/notification.controller');

const router = express.Router();

router.post('/', controller.createNotification);
router.get('/', controller.listNotifications);

module.exports = router;
