const ApiError = require('../../utils/apiError');
const taskRepo = require('./repository');
const projectRepo = require('../project/repository');
const { sendNotification } = require('../../integrations/notificationClient');

const VALID_STATUS = ['todo', 'in_progress', 'done'];
const VALID_PRIORITY = ['low', 'medium', 'high'];

const parsePositiveInt = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }
  return parsed;
};

const assertProjectOwner = async (projectId, requesterId) => {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (Number(project.owner_id) !== requesterId) {
    throw new ApiError(403, 'Access denied: project does not belong to this user');
  }

  return project;
};

const assertTaskOwner = async (task, requesterId) => {
  const project = await assertProjectOwner(Number(task.project_id), requesterId);
  return project;
};

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

  const creatorId = parsePositiveInt(created_by, 'created_by');
  const project = await assertProjectOwner(Number(project_id), creatorId);

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
    created_by: creatorId,
  });

  await taskRepo.createActivityLog({
    task_id: task.id,
    actor_id: creatorId,
    action_type: 'TASK_CREATED',
    old_value: null,
    new_value: JSON.stringify(task),
  });

  const recipients = [creatorId];
  if (task.assignee_id) {
    recipients.push(Number(task.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_CREATED',
    title: `Task created: ${task.title}`,
    message: `Task \"${task.title}\" was created in project \"${project.name}\"`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${task.id}`,
    metadata: {
      task_id: task.id,
      project_id: task.project_id,
      project_name: project.name,
      status: task.status,
      priority: task.priority,
    },
  });

  return task;
};

const getTaskById = async (id, requesterId) => {
  const parsedRequesterId = parsePositiveInt(requesterId, 'requester_id');
  const task = await taskRepo.getTaskById(id);
  if (!task) throw new ApiError(404, 'Task not found');

  await assertTaskOwner(task, parsedRequesterId);
  return task;
};

const updateTask = async (id, body) => {
  const actorId = parsePositiveInt(body.actor_id, 'actor_id');
  const oldTask = await taskRepo.getTaskById(id);
  if (!oldTask) throw new ApiError(404, 'Task not found');

  const project = await assertTaskOwner(oldTask, actorId);

  const projectName = project?.name || `#${oldTask.project_id}`;

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
    actor_id: actorId,
    action_type: 'TASK_UPDATED',
    old_value: JSON.stringify(oldTask),
    new_value: JSON.stringify(updatedTask),
  });

  const recipients = [actorId];
  if (updatedTask.assignee_id) {
    recipients.push(Number(updatedTask.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_UPDATED',
    title: `Task updated: ${updatedTask.title}`,
    message: `Task \"${updatedTask.title}\" was updated in project \"${projectName}\"`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${updatedTask.id}`,
    metadata: {
      task_id: updatedTask.id,
      project_id: updatedTask.project_id,
      project_name: projectName,
      old_status: oldTask.status,
      new_status: updatedTask.status,
    },
  });

  return updatedTask;
};

const updateTaskStatus = async (id, body) => {
  const { status, actor_id } = body;

  if (!status) throw new ApiError(400, 'status is required');
  const actorId = parsePositiveInt(actor_id, 'actor_id');
  if (!VALID_STATUS.includes(status)) {
    throw new ApiError(400, 'Invalid task status');
  }

  const oldTask = await taskRepo.getTaskById(id);
  if (!oldTask) throw new ApiError(404, 'Task not found');

  const project = await assertTaskOwner(oldTask, actorId);
  const projectName = project?.name || `#${oldTask.project_id}`;

  const updatedTask = await taskRepo.updateTaskStatus(id, status);

  await taskRepo.createActivityLog({
    task_id: id,
    actor_id: actorId,
    action_type: 'TASK_STATUS_CHANGED',
    old_value: oldTask.status,
    new_value: updatedTask.status,
  });

  const recipients = [actorId];
  if (oldTask.assignee_id) {
    recipients.push(Number(oldTask.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_STATUS_CHANGED',
    title: `Task status changed: ${updatedTask.title}`,
    message: `Task \"${updatedTask.title}\" in project \"${projectName}\" changed from ${oldTask.status} to ${updatedTask.status}`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${updatedTask.id}`,
    metadata: {
      task_id: updatedTask.id,
      project_id: updatedTask.project_id,
      project_name: projectName,
      old_status: oldTask.status,
      new_status: updatedTask.status,
    },
  });

  return updatedTask;
};

const getTasksByProjectId = async (projectId, requesterId) => {
  const parsedRequesterId = parsePositiveInt(requesterId, 'requester_id');
  await assertProjectOwner(projectId, parsedRequesterId);

  return await taskRepo.getTasksByProjectId(projectId);
};

const deleteTask = async (id, payload = {}) => {
  const actorId = parsePositiveInt(payload.actor_id, 'actor_id');
  const existingTask = await taskRepo.getTaskById(id);
  if (!existingTask) throw new ApiError(404, 'Task not found');

  const project = await assertTaskOwner(existingTask, actorId);
  const projectName = project?.name || `#${existingTask.project_id}`;

  await taskRepo.createActivityLog({
    task_id: id,
    actor_id: actorId,
    action_type: 'TASK_DELETED',
    old_value: JSON.stringify(existingTask),
    new_value: null,
  });

  const deletedTask = await taskRepo.deleteTask(id);

  const recipients = [Number(existingTask.created_by), actorId];
  if (existingTask.assignee_id) {
    recipients.push(Number(existingTask.assignee_id));
  }

  await sendNotification({
    event_type: 'TASK_DELETED',
    title: `Task deleted: ${existingTask.title}`,
    message: `Task \"${existingTask.title}\" was deleted from project \"${projectName}\"`,
    recipient_ids: [...new Set(recipients)],
    source_service: 'project_and_task_management',
    source_reference: `task:${existingTask.id}`,
    metadata: {
      task_id: existingTask.id,
      project_id: existingTask.project_id,
      project_name: projectName,
      actor_id: actorId,
      status: 'deleted',
    },
  });

  return deletedTask;
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByProjectId,
};