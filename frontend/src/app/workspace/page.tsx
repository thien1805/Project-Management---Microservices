"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CheckCircle2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getNotifications,
  getProjects,
  getTasksByProjectId,
  NotificationRecord,
  Project,
  Task,
  updateTaskStatus,
} from "@/lib/api";
import { useAuth } from "@/providers/AuthContext";

type WorkspaceTab = "workspace" | "notifications";
type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type WorkspaceView = "projects" | "project-detail";

type NotificationEventUI = {
  label: string;
  badgeClassName: string;
  cardClassName: string;
};

const NOTIFICATION_EVENT_UI_MAP: Record<string, NotificationEventUI> = {
  PROJECT_CREATED: {
    label: "Project created",
    badgeClassName: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cardClassName: "border-emerald-200 bg-emerald-50/40",
  },
  PROJECT_DELETED: {
    label: "Project deleted",
    badgeClassName: "bg-rose-100 text-rose-700 border border-rose-200",
    cardClassName: "border-rose-200 bg-rose-50/40",
  },
  PROJECT_MEMBER_ADDED: {
    label: "Project member added",
    badgeClassName: "bg-sky-100 text-sky-700 border border-sky-200",
    cardClassName: "border-sky-200 bg-sky-50/40",
  },
  TASK_CREATED: {
    label: "Task created",
    badgeClassName: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    cardClassName: "border-indigo-200 bg-indigo-50/40",
  },
  TASK_UPDATED: {
    label: "Task updated",
    badgeClassName: "bg-amber-100 text-amber-700 border border-amber-200",
    cardClassName: "border-amber-200 bg-amber-50/40",
  },
  TASK_STATUS_CHANGED: {
    label: "Task status changed",
    badgeClassName: "bg-violet-100 text-violet-700 border border-violet-200",
    cardClassName: "border-violet-200 bg-violet-50/40",
  },
  TASK_DELETED: {
    label: "Task deleted",
    badgeClassName: "bg-red-100 text-red-700 border border-red-200",
    cardClassName: "border-red-200 bg-red-50/40",
  },
};

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const resolveNotificationEventUI = (eventType: string): NotificationEventUI => {
  const config = NOTIFICATION_EVENT_UI_MAP[eventType];
  if (config) {
    return config;
  }

  return {
    label: toTitleCase(eventType.replaceAll("_", " ")),
    badgeClassName: "bg-slate-100 text-slate-700 border border-slate-200",
    cardClassName: "border-slate-200 bg-white",
  };
};

export default function WorkspacePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("workspace");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("projects");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(true);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const notify = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const isTaskNotFoundError = (message: string) => /task not found/i.test(message);

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setSelectedProjectId(null);
      setWorkspaceView("projects");
      return;
    }

    setLoadingProjects(true);
    setError("");
    try {
      const data = await getProjects(user.id);
      setProjects(data);

      if (data.length === 0) {
        setSelectedProjectId(null);
        setWorkspaceView("projects");
      } else if (selectedProjectId && !data.some((item) => item.id === selectedProjectId)) {
        setSelectedProjectId(null);
        setWorkspaceView("projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      notify("Failed to load projects", "error");
    } finally {
      setLoadingProjects(false);
    }
  }, [notify, selectedProjectId, user]);

  const loadTasks = useCallback(
    async (projectId: number) => {
      if (!user) {
        setTasks([]);
        return;
      }

      setLoadingTasks(true);
      setError("");
      try {
        const data = await getTasksByProjectId(projectId, user.id);
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
        setTasks([]);
        notify("Failed to load tasks", "error");
      } finally {
        setLoadingTasks(false);
      }
    },
    [notify, user]
  );

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoadingNotifications(true);
    try {
      const data = await getNotifications({
        recipient_id: user.id,
        limit: 50,
      });
      setNotifications(data);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to load notifications", "error");
    } finally {
      setLoadingNotifications(false);
    }
  }, [notify, user]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    loadProjects();
    loadNotifications();
  }, [isLoading, user, router, loadProjects, loadNotifications]);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }

    loadTasks(selectedProjectId);
  }, [selectedProjectId, loadTasks]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!projectName.trim()) {
      notify("Please enter a project name", "info");
      return;
    }

    setError("");
    try {
      const created = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        owner_id: user.id,
      });

      setProjectName("");
      setProjectDescription("");
      setIsProjectFormOpen(false);
      await loadProjects();
      await loadNotifications();
      notify("Project created successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project";
      setError(message);
      notify(message, "error");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!user) return;

    setError("");
    try {
      await deleteProject(projectId, user.id);
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setWorkspaceView("projects");
      }
      await loadProjects();
      await loadNotifications();
      notify("Project deleted successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
      notify(message, "error");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedProjectId) {
      notify("Please open a project before adding tasks", "info");
      return;
    }
    if (!taskTitle.trim()) {
      notify("Please enter a task title", "info");
      return;
    }

    setError("");
    try {
      await createTask({
        project_id: selectedProjectId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        created_by: user.id,
      });

      setTaskTitle("");
      setTaskDescription("");
      await loadTasks(selectedProjectId);
      await loadNotifications();
      notify("Task created successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      setError(message);
      notify(message, "error");
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    if (!user) return;

    const nextStatus: Task["status"] = task.status === "done" ? "todo" : "done";

    setError("");
    try {
      await updateTaskStatus(task.id, {
        status: nextStatus,
        actor_id: user.id,
      });

      if (selectedProjectId) {
        await loadTasks(selectedProjectId);
      }
      await loadNotifications();
      notify("Task status updated successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update task status";
      if (isTaskNotFoundError(message)) {
        if (selectedProjectId) {
          await loadTasks(selectedProjectId);
        }
        setError("");
        notify("Task no longer exists. Task list refreshed.", "info");
        return;
      }
      setError(message);
      notify(message, "error");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!user) return;

    setError("");
    try {
      await deleteTask(taskId, user.id);
      if (selectedProjectId) {
        await loadTasks(selectedProjectId);
      }
      await loadNotifications();
      notify("Task deleted successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      if (isTaskNotFoundError(message)) {
        if (selectedProjectId) {
          await loadTasks(selectedProjectId);
        }
        setError("");
        notify("Task no longer exists. Task list refreshed.", "info");
        return;
      }
      setError(message);
      notify(message, "error");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading session...</div>;
  }

  if (!user) {
    return null;
  }

  const handleOpenProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setWorkspaceView("project-detail");
    setIsTaskFormOpen(true);
    notify("Opened project details", "info");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Workspace</h1>
            <p className="text-slate-600 text-sm">
              Welcome, {user.full_name} ({user.email})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`px-3 py-2 rounded-xl text-sm ${
                activeTab === "workspace" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Projects & Tasks
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-2 ${
                activeTab === "notifications" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="px-4 py-2 rounded-xl bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>
        ) : null}

        {activeTab === "workspace" ? (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {workspaceView === "projects" ? "Project List" : `Project Details: ${selectedProject?.name || ""}`}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {workspaceView === "projects"
                      ? "Choose a project to manage its tasks."
                      : "You are inside a project. Add tasks and update their status here."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {workspaceView === "project-detail" ? (
                    <button
                      onClick={() => {
                        setWorkspaceView("projects");
                        setSelectedProjectId(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to list
                    </button>
                  ) : null}

                  <button
                    onClick={() => setIsProjectFormOpen((prev) => !prev)}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add project
                  </button>

                  {workspaceView === "project-detail" ? (
                    <button
                      onClick={() => setIsTaskFormOpen((prev) => !prev)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm"
                    >
                      {isTaskFormOpen ? "Hide task form" : "Add task"}
                    </button>
                  ) : null}
                </div>
              </div>

              {isProjectFormOpen ? (
                <form onSubmit={handleCreateProject} className="space-y-3 mt-4 border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                  />
                  <textarea
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Project description"
                  />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">Save project</button>
                    <button
                      type="button"
                      onClick={() => setIsProjectFormOpen(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </section>

            {workspaceView === "projects" ? (
              <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
                {loadingProjects ? <p>Loading projects...</p> : null}
                {!loadingProjects && projects.length === 0 ? <p>No projects found.</p> : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition">
                      <div className="flex items-start justify-between gap-3">
                        <button onClick={() => handleOpenProject(project.id)} className="text-left flex-1">
                          <p className="font-semibold text-slate-900">{project.name}</p>
                          <p className="text-sm text-slate-600 mt-1">{project.description || "No description"}</p>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleOpenProject(project.id)}
                        className="mt-4 text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white"
                      >
                        Open project
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
                {!selectedProject ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="font-medium text-slate-700">This project does not exist or has been deleted</p>
                    <button
                      onClick={() => {
                        setWorkspaceView("projects");
                        setSelectedProjectId(null);
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white"
                    >
                      Go to project list
                    </button>
                  </div>
                ) : (
                  <>
                    {isTaskFormOpen ? (
                      <form onSubmit={handleCreateTask} className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <input
                          className="w-full border border-slate-300 rounded-xl px-3 py-2"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="Task title"
                        />
                        <textarea
                          className="w-full border border-slate-300 rounded-xl px-3 py-2"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          placeholder="Task description"
                        />
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl">Add task</button>
                      </form>
                    ) : null}

                    <div className="space-y-2 max-h-[26rem] overflow-auto pr-1">
                      {loadingTasks ? <p>Loading tasks...</p> : null}
                      {!loadingTasks && tasks.length === 0 ? <p>No tasks found in this project.</p> : null}
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border ${
                            task.status === "done"
                              ? "border-emerald-200 bg-emerald-50/40"
                              : task.status === "in_progress"
                                ? "border-amber-200 bg-amber-50/40"
                                : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p
                                className={`font-semibold ${
                                  task.status === "done" ? "line-through text-slate-500" : "text-slate-900"
                                }`}
                              >
                                {task.title}
                              </p>
                              <p
                                className={`text-sm mt-1 ${
                                  task.status === "done" ? "line-through text-slate-400" : "text-slate-600"
                                }`}
                              >
                                {task.description || "No description"}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full h-fit border ${
                                task.status === "done"
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : task.status === "in_progress"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-sky-100 text-sky-700 border-sky-200"
                              }`}
                            >
                              {task.status === "done"
                                ? "Done"
                                : task.status === "in_progress"
                                  ? "In progress"
                                  : "To do"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleToggleTaskStatus(task)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm flex items-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {task.status === "done" ? "Mark as to do" : "Mark as done"}
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}
          </div>
        ) : (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <button
                onClick={loadNotifications}
                className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-[28rem] overflow-auto">
              {loadingNotifications ? <p>Loading notifications...</p> : null}
              {!loadingNotifications && notifications.length === 0 ? <p>No notifications yet.</p> : null}
              {notifications.map((item) => {
                const eventUI = resolveNotificationEventUI(item.event_type);

                return (
                  <div key={item.id} className={`p-3 rounded-xl border ${eventUI.cardClassName}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${eventUI.badgeClassName}`}>
                        {eventUI.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="fixed right-4 top-4 z-50 space-y-3 w-[320px] max-w-[calc(100vw-2rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-3 shadow-lg border animate-slide-in ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : toast.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-slate-100 border-slate-200 text-slate-700"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
