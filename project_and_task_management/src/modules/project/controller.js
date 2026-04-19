const projectService = require('./service');
const { successResponse } = require('../../utils/response');

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    return successResponse(res, 201, 'Project created successfully', project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects();
    return successResponse(res, 200, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    return successResponse(res, 200, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const data = await projectService.deleteProject(Number(req.params.id), req.body || {});
    return successResponse(res, 200, 'Project deleted successfully', data);
  } catch (error) {
    next(error);
  }
};

const addMemberToProject = async (req, res, next) => {
  try {
    const member = await projectService.addMemberToProject(Number(req.params.id), req.body);
    return successResponse(res, 201, 'Member added successfully', member);
  } catch (error) {
    next(error);
  }
};

const getProjectMembers = async (req, res, next) => {
  try {
    const members = await projectService.getProjectMembers(Number(req.params.id));
    return successResponse(res, 200, 'Project members retrieved successfully', members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
};