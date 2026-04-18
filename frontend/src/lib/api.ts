const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001";
const TASK_SERVICE_URL = process.env.NEXT_PUBLIC_TASK_SERVICE_URL || "http://localhost:3000";

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  role: string;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  status: string;
};

export type Task = {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  assignee_id: number | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_by: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const parseError = async (response: Response) => {
  try {
    const body = await response.json();
    return body?.message || "Request failed";
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<{
    access_token: string;
    user: AuthUser;
  }>;

  return body.data;
};

export const getProfile = async (token: string) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<AuthUser>;
  return body.data;
};

export const getProjects = async () => {
  const response = await fetch(`${TASK_SERVICE_URL}/api/projects`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Project[]>;
  return body.data;
};

export const createProject = async (payload: {
  name: string;
  description?: string;
  owner_id: number;
}) => {
  const response = await fetch(`${TASK_SERVICE_URL}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Project>;
  return body.data;
};

export const getTasksByProjectId = async (projectId: number) => {
  const response = await fetch(`${TASK_SERVICE_URL}/api/projects/${projectId}/tasks`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Task[]>;
  return body.data;
};

export const createTask = async (payload: {
  project_id: number;
  title: string;
  description?: string;
  created_by: number;
  assignee_id?: number;
}) => {
  const response = await fetch(`${TASK_SERVICE_URL}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Task>;
  return body.data;
};
