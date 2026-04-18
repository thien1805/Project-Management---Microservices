const pool = require('../../config/db');
const ApiError = require('../../utils/apiError');
const projectRepository = require('./repository');
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