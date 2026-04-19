const express = require('express');
const controller = require('./controller');

const router = express.Router();

router.post('/', controller.createProject);
router.get('/', controller.getProjects);
router.get('/:id', controller.getProjectById);
router.delete('/:id', controller.deleteProject);
router.post('/:id/members', controller.addMemberToProject);
router.get('/:id/members', controller.getProjectMembers);

module.exports = router;