const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');
const projectRepository = require('./repository');
const { sendNotification } = require('../../integrations/notificationClient');
const {
  validateCreateProject,
  validateAddMember,
} = require('./validation');

const parsePositiveInt = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }
  return parsed;
};

const assertProjectOwner = async (projectId, requesterId) => {
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (Number(project.owner_id) !== requesterId) {
    throw new ApiError(403, 'Access denied: project does not belong to this user');
  }

  return project;
};

const createProject = async (payload) => {
  validateCreateProject(payload);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const project = await projectRepository.createProject(client, payload);

    await projectRepository.addProjectMember(client, {
      project_id: project.id,
      user_id: payload.owner_id,
      role_in_project: 'owner',
    });

    await client.query('COMMIT');

    await sendNotification({
      event_type: 'PROJECT_CREATED',
      title: `Project created: ${project.name}`,
      message: `Project \"${project.name}\" was created by user ${payload.owner_id}`,
      recipient_ids: [Number(payload.owner_id)],
      source_service: 'project_and_task_management',
      source_reference: `project:${project.id}`,
      metadata: {
        project_id: project.id,
        owner_id: Number(payload.owner_id),
        status: project.status,
      },
    });

    return project;
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      throw new ApiError(409, 'Duplicate data');
    }

    throw error;
  } finally {
    client.release();
  }
};

const getProjects = async (ownerId) => {
  if (ownerId === undefined) {
    throw new ApiError(400, 'owner_id is required');
  }

  const parsedOwnerId = parsePositiveInt(ownerId, 'owner_id');

  return await projectRepository.getProjects(parsedOwnerId);
};

const getProjectById = async (id, requesterId) => {
  const parsedRequesterId = parsePositiveInt(requesterId, 'requester_id');
  const project = await projectRepository.getProjectSummaryByIdForOwner(id, parsedRequesterId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

const deleteProject = async (id, payload = {}) => {
  const actorId = parsePositiveInt(payload.actor_id, 'actor_id');
  const project = await assertProjectOwner(id, actorId);

  const deletedProject = await projectRepository.deleteProject(id);

  await sendNotification({
    event_type: 'PROJECT_DELETED',
    title: `Project deleted: ${project.name}`,
    message: `Project \"${project.name}\" was deleted`,
    recipient_ids: [...new Set([Number(project.owner_id), actorId])],
    source_service: 'project_and_task_management',
    source_reference: `project:${project.id}`,
    metadata: {
      project_id: project.id,
      actor_id: actorId,
      status: 'deleted',
    },
  });

  return deletedProject;
};

const addMemberToProject = async (projectId, payload) => {
  validateAddMember(payload);

  const requesterId = parsePositiveInt(payload.requester_id, 'requester_id');

  const project = await assertProjectOwner(projectId, requesterId);


  const exists = await projectRepository.checkMemberExists(projectId, Number(payload.user_id));
  if (exists) {
    throw new ApiError(409, 'User is already a member of this project');
  }

  const client = await pool.connect();

  try {
    const member = await projectRepository.addProjectMember(client, {
      project_id: Number(projectId),
      user_id: Number(payload.user_id),
      role_in_project: payload.role_in_project || 'developer',
    });

    await sendNotification({
      event_type: 'PROJECT_MEMBER_ADDED',
      title: `Member added to project ${project.name}`,
      message: `User ${member.user_id} joined project \"${project.name}\" as ${member.role_in_project}`,
      recipient_ids: [Number(member.user_id), Number(project.owner_id)],
      source_service: 'project_and_task_management',
      source_reference: `project:${project.id}`,
      metadata: {
        project_id: Number(project.id),
        member_id: Number(member.user_id),
        role_in_project: member.role_in_project,
      },
    });

    return member;
  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(409, 'User is already a member of this project');
    }
    throw error;
  } finally {
    client.release();
  }
};

const getProjectMembers = async (projectId, requesterId) => {
  const parsedRequesterId = parsePositiveInt(requesterId, 'requester_id');
  await assertProjectOwner(projectId, parsedRequesterId);

  return await projectRepository.getProjectMembers(projectId);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
};