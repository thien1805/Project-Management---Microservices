const express = require('express');
const projectRoutes = require('../modules/project/routes');
const taskRoutes = require('../modules/task/routes');
const taskController = require('../modules/task/controller');

const router = express.Router();

router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.get('/projects/:id/tasks', taskController.getTasksByProjectId);

module.exports = router;