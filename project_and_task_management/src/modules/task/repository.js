const pool = require('../../config/db');

const createTask = async (data) => {
  const query = `
    INSERT INTO task.tasks
    (project_id, title, description, assignee_id, status, priority, due_date, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [
    data.project_id,
    data.title,
    data.description || null,
    data.assignee_id || null,
    data.status || 'todo',
    data.priority || 'medium',
    data.due_date || null,
    data.created_by,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getTaskById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM task.tasks
    WHERE id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
};

const updateTask = async (id, data) => {
  const query = `
    UPDATE task.tasks
    SET title = $1,
        description = $2,
        assignee_id = $3,
        status = $4,
        priority = $5,
        due_date = $6,
        updated_at = NOW()
    WHERE id = $7
    RETURNING *
  `;
  const values = [
    data.title,
    data.description || null,
    data.assignee_id || null,
    data.status,
    data.priority,
    data.due_date || null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const updateTaskStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE task.tasks
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [status, id]
  );
  return result.rows[0] || null;
};

const getTasksByProjectId = async (projectId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM task.tasks
    WHERE project_id = $1
    ORDER BY id DESC
    `,
    [projectId]
  );
  return result.rows;
};

const createActivityLog = async ({ task_id, actor_id, action_type, old_value, new_value }) => {
  await pool.query(
    `
    INSERT INTO task.task_activity_logs (task_id, actor_id, action_type, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [task_id, actor_id, action_type, old_value || null, new_value || null]
  );
};

module.exports = {
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  getTasksByProjectId,
  createActivityLog,
};