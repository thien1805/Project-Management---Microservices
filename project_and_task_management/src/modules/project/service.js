const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');
const projectRepository = require('./repository');
const { sendNotification } = require('../../integrations/notificationClient');
const {
  validateCreateProject,
  validateAddMember,
} = require('./validation');

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

const getProjects = async () => {
  return await projectRepository.getProjects();
};

const getProjectById = async (id) => {
  const project = await projectRepository.getProjectSummaryById(id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

const addMemberToProject = async (projectId, payload) => {
  validateAddMember(payload);

  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

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

const getProjectMembers = async (projectId) => {
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return await projectRepository.getProjectMembers(projectId);
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  addMemberToProject,
  getProjectMembers,
};