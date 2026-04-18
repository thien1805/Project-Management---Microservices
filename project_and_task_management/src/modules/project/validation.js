const ApiError = require('../../utils/apiError');

const PROJECT_STATUSES = ['active', 'archived'];
const PROJECT_ROLES = ['owner', 'manager', 'developer', 'viewer'];

const validateCreateProject = (body) => {
  const { name, description, owner_id, status } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError(400, 'Project name is required');
  }

  if (name.trim().length > 150) {
    throw new ApiError(400, 'Project name must be at most 150 characters');
  }

  if (description && typeof description !== 'string') {
    throw new ApiError(400, 'Description must be a string');
  }

  if (!owner_id || !Number.isInteger(Number(owner_id))) {
    throw new ApiError(400, 'owner_id is required and must be a number');
  }

  if (status && !PROJECT_STATUSES.includes(status)) {
    throw new ApiError(400, 'Invalid project status');
  }
};

const validateAddMember = (body) => {
  const { user_id, role_in_project } = body;

  if (!user_id || !Number.isInteger(Number(user_id))) {
    throw new ApiError(400, 'user_id is required and must be a number');
  }

  if (role_in_project && !PROJECT_ROLES.includes(role_in_project)) {
    throw new ApiError(400, 'Invalid role_in_project');
  }
};

module.exports = {
  validateCreateProject,
  validateAddMember,
  PROJECT_STATUSES,
  PROJECT_ROLES,
};