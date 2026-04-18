CREATE SCHEMA IF NOT EXISTS task;

CREATE TABLE IF NOT EXISTS task.projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task.project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_project VARCHAR(20) NOT NULL DEFAULT 'developer',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id) REFERENCES task.projects(id) ON DELETE CASCADE,
    CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS task.tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assignee_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    due_date DATE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES task.projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task.task_comments (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_task_comments_task
        FOREIGN KEY (task_id) REFERENCES task.tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task.task_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    actor_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_task_activity_logs_task
        FOREIGN KEY (task_id) REFERENCES task.tasks(id) ON DELETE CASCADE
);