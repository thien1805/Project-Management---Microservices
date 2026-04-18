const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/', controller.createTask);
router.get('/:id', controller.getTaskById);
router.put('/:id', controller.updateTask);
router.patch('/:id/status', controller.updateTaskStatus);

module.exports = router;