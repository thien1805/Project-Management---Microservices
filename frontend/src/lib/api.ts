const resolveServiceUrl = (
  envUrl: string | undefined,
  localDefault: string,
  dockerHostDefault: string
) => {
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location.port === "3003") {
    return dockerHostDefault;
  }

  return localDefault;
};

const getAuthServiceUrl = () =>
  resolveServiceUrl(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL, "http://localhost:3001", "http://localhost:3001");

const getTaskServiceUrl = () =>
  resolveServiceUrl(process.env.NEXT_PUBLIC_TASK_SERVICE_URL, "http://localhost:3000", "http://localhost:3010");

const getNotificationServiceUrl = () =>
  resolveServiceUrl(
    process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL,
    "http://localhost:3002",
    "http://localhost:3002"
  );

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

export type NotificationRecord = {
  id: number;
  event_type: string;
  title: string;
  message: string;
  recipient_ids: number[];
  metadata: Record<string, unknown>;
  source_service: string;
  source_reference: string | null;
  created_at: string;
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
  const response = await fetch(`${getAuthServiceUrl()}/api/auth/login`, {
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

export const registerWithEmail = async (payload: {
  full_name: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(`${getAuthServiceUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<AuthUser>;
  return body.data;
};

export const getProfile = async (token: string) => {
  const response = await fetch(`${getAuthServiceUrl()}/api/auth/profile`, {
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
  const response = await fetch(`${getTaskServiceUrl()}/api/projects`, {
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
  const response = await fetch(`${getTaskServiceUrl()}/api/projects`, {
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

export const deleteProject = async (projectId: number, actorId?: number) => {
  const response = await fetch(`${getTaskServiceUrl()}/api/projects/${projectId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor_id: actorId }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Project>;
  return body.data;
};

export const getTasksByProjectId = async (projectId: number) => {
  const response = await fetch(`${getTaskServiceUrl()}/api/projects/${projectId}/tasks`, {
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
  const response = await fetch(`${getTaskServiceUrl()}/api/tasks`, {
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

export const updateTaskStatus = async (
  taskId: number,
  payload: { status: Task["status"]; actor_id?: number }
) => {
  const response = await fetch(`${getTaskServiceUrl()}/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Task>;
  return body.data;
};

export const deleteTask = async (taskId: number, actorId?: number) => {
  const response = await fetch(`${getTaskServiceUrl()}/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor_id: actorId }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<Task>;
  return body.data;
};

export const getNotifications = async (params?: {
  recipient_id?: number;
  source_service?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.recipient_id) {
    queryParams.set("recipient_id", String(params.recipient_id));
  }
  if (params?.source_service) {
    queryParams.set("source_service", params.source_service);
  }
  if (params?.limit) {
    queryParams.set("limit", String(params.limit));
  }

  const query = queryParams.toString();
  const url = `${getNotificationServiceUrl()}/api/notifications${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as ApiResponse<NotificationRecord[]>;
  return body.data;
};
