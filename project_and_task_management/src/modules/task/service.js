const ApiError = require('../../utils/apiError');
const taskRepo = require('./repository');
const projectRepo = require('../project/repository');
const { sendNotification } = require('../../integrations/notificationClient');

const VALID_STATUS = ['todo', 'in_progress', 'done'];
const VALID_PRIORITY = ['low', 'medium', 'high'];

const createTask = async (body) => {
  const {
    project_id,
    title,
    description,
    assignee_id,
    status,
    priority,
    due_date,
    created_by,
  } = body;

  if (!project_id) throw new ApiError(400, 'project_id is required');
  if (!title) throw new ApiError(400, 'title is required');
  if (!created_by) throw new ApiError(400, 'created_by is required');

  const project = await projectRepo.getProjectById(Number(project_id));
  if (!project) throw new ApiError(404, 'Project not found');

  if (status && !VALID_STATUS.includes(status)) {
    throw new ApiError(400, 'Invalid task status');
  }

  if (priority && !VALID_PRIORITY.includes(priority)) {
    throw new ApiError(400, 'Invalid task priority');
  }

  const task = await taskRepo.createTask({
    project_id: Number(project_id),
    title,
    description,
    assignee_id: assignee_id ? Number(assignee_id) : null,
    status,
    priority,
    due_date,
    created_by: Number(created_by),
  });

  await taskRepo.createActivityLog({
    task_id: task.id,
    actor_id: Number(created_by),
    action_type: 'TASK_CREATED',
    old_value: null,
    new_value: JSON.stringify(task),
  });

  const recipients = [Number(created_by)];
  if (task.assignee_id) {
    recipients.push(Number(task.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_CREATED',
    title: `Task created: ${task.title}`,
    message: `Task \"${task.title}\" was created in project ${task.project_id}`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${task.id}`,
    metadata: {
      task_id: task.id,
      project_id: task.project_id,
      status: task.status,
      priority: task.priority,
    },
  });

  return task;
};

const getTaskById = async (id) => {
  const task = await taskRepo.getTaskById(id);
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
};

const updateTask = async (id, body) => {
  const oldTask = await taskRepo.getTaskById(id);
  if (!oldTask) throw new ApiError(404, 'Task not found');

  const status = body.status || oldTask.status;
  const priority = body.priority || oldTask.priority;

  if (!VALID_STATUS.includes(status)) {
    throw new ApiError(400, 'Invalid task status');
  }

  if (!VALID_PRIORITY.includes(priority)) {
    throw new ApiError(400, 'Invalid task priority');
  }

  const updatedTask = await taskRepo.updateTask(id, {
    title: body.title || oldTask.title,
    description: body.description ?? oldTask.description,
    assignee_id: body.assignee_id ?? oldTask.assignee_id,
    status,
    priority,
    due_date: body.due_date ?? oldTask.due_date,
  });

  await taskRepo.createActivityLog({
    task_id: id,
    actor_id: Number(body.actor_id || oldTask.created_by),
    action_type: 'TASK_UPDATED',
    old_value: JSON.stringify(oldTask),
    new_value: JSON.stringify(updatedTask),
  });

  const recipients = [Number(body.actor_id || oldTask.created_by)];
  if (updatedTask.assignee_id) {
    recipients.push(Number(updatedTask.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_UPDATED',
    title: `Task updated: ${updatedTask.title}`,
    message: `Task \"${updatedTask.title}\" was updated`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${updatedTask.id}`,
    metadata: {
      task_id: updatedTask.id,
      project_id: updatedTask.project_id,
      old_status: oldTask.status,
      new_status: updatedTask.status,
    },
  });

  return updatedTask;
};

const updateTaskStatus = async (id, body) => {
  const { status, actor_id } = body;

  if (!status) throw new ApiError(400, 'status is required');
  if (!VALID_STATUS.includes(status)) {
    throw new ApiError(400, 'Invalid task status');
  }

  const oldTask = await taskRepo.getTaskById(id);
  if (!oldTask) throw new ApiError(404, 'Task not found');

  const updatedTask = await taskRepo.updateTaskStatus(id, status);

  await taskRepo.createActivityLog({
    task_id: id,
    actor_id: Number(actor_id || oldTask.created_by),
    action_type: 'TASK_STATUS_CHANGED',
    old_value: oldTask.status,
    new_value: updatedTask.status,
  });

  const recipients = [Number(actor_id || oldTask.created_by)];
  if (oldTask.assignee_id) {
    recipients.push(Number(oldTask.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_STATUS_CHANGED',
    title: `Task status changed: ${updatedTask.title}`,
    message: `Task \"${updatedTask.title}\" changed from ${oldTask.status} to ${updatedTask.status}`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${updatedTask.id}`,
    metadata: {
      task_id: updatedTask.id,
      project_id: updatedTask.project_id,
      old_status: oldTask.status,
      new_status: updatedTask.status,
    },
  });

  return updatedTask;
};

const getTasksByProjectId = async (projectId) => {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  return await taskRepo.getTasksByProjectId(projectId);
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  getTasksByProjectId,
};