const service = require('./service');
const { successResponse } = require('../../utils/response');

const createTask = async (req, res, next) => {
  try {
    const data = await service.createTask(req.body);
    return successResponse(res, 201, 'Task created successfully', data);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const data = await service.getTaskById(Number(req.params.id));
    return successResponse(res, 200, 'Task retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const data = await service.updateTask(Number(req.params.id), req.body);
    return successResponse(res, 200, 'Task updated successfully', data);
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const data = await service.updateTaskStatus(Number(req.params.id), req.body);
    return successResponse(res, 200, 'Task status updated successfully', data);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const data = await service.deleteTask(Number(req.params.id), req.body || {});
    return successResponse(res, 200, 'Task deleted successfully', data);
  } catch (error) {
    next(error);
  }
};

const getTasksByProjectId = async (req, res, next) => {
  try {
    const data = await service.getTasksByProjectId(Number(req.params.id));
    return successResponse(res, 200, 'Project tasks retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByProjectId,
};