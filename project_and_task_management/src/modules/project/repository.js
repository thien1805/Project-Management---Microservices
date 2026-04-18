const pool = require('../../config/db');

const createProject = async (client, { name, description, owner_id, status = 'active' }) => {
  const query = `
    INSERT INTO task.projects (name, description, owner_id, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [name, description || null, owner_id, status];
  const result = await client.query(query, values);
  return result.rows[0];
};

const addProjectMember = async (client, { project_id, user_id, role_in_project = 'developer' }) => {
  const query = `
    INSERT INTO task.project_members (project_id, user_id, role_in_project)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [project_id, user_id, role_in_project];
  const result = await client.query(query, values);
  return result.rows[0];
};

const getProjects = async () => {
  const query = `
    SELECT *
    FROM task.projects
    ORDER BY id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getProjectById = async (id) => {
  const query = `
    SELECT *
    FROM task.projects
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

const getProjectMembers = async (projectId) => {
  const query = `
    SELECT *
    FROM task.project_members
    WHERE project_id = $1
    ORDER BY id ASC
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows;
};

const checkMemberExists = async (projectId, userId) => {
  const query = `
    SELECT id
    FROM task.project_members
    WHERE project_id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [projectId, userId]);
  return result.rows.length > 0;
};

const getProjectSummaryById = async (projectId) => {
  const query = `
    SELECT
      p.*,
      COUNT(DISTINCT pm.id)::int AS member_count,
      COUNT(DISTINCT t.id)::int AS task_count
    FROM task.projects p
    LEFT JOIN task.project_members pm ON pm.project_id = p.id
    LEFT JOIN task.tasks t ON t.project_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `;
  const result = await pool.query(query, [projectId]);
  return result.rows[0] || null;
};

module.exports = {
  createProject,
  addProjectMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  checkMemberExists,
  getProjectSummaryById,
};