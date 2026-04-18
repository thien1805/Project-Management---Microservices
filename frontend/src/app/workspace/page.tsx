"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  createTask,
  getProjects,
  getTasksByProjectId,
  Project,
  Task,
} from "@/lib/api";
import { useAuth } from "@/providers/AuthContext";

export default function WorkspacePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError("");
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load projects");
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProjectId]);

  const loadTasks = useCallback(async (projectId: number) => {
    setLoadingTasks(true);
    setError("");
    try {
      const data = await getTasksByProjectId(projectId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot load tasks");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadProjects();
  }, [isLoading, user, router, loadProjects]);

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
    if (!projectName.trim()) return;

    setError("");
    try {
      const created = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        owner_id: user.id,
      });
      setProjectName("");
      setProjectDescription("");
      await loadProjects();
      setSelectedProjectId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot create project");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProjectId || !taskTitle.trim()) return;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cannot create task");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading session...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Workspace</h1>
            <p className="text-slate-600 text-sm">
              Xin chao {user.full_name} ({user.email})
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white"
          >
            Logout
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <form onSubmit={handleCreateProject} className="space-y-3">
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                Create project
              </button>
            </form>

            <div className="space-y-2 max-h-72 overflow-auto">
              {loadingProjects ? <p>Loading projects...</p> : null}
              {!loadingProjects && projects.length === 0 ? <p>No projects found.</p> : null}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full text-left p-3 rounded-xl border ${
                    selectedProjectId === project.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-semibold">{project.name}</p>
                  <p className="text-sm text-slate-600">{project.description || "No description"}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Tasks {selectedProject ? `- ${selectedProject.name}` : ""}</h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                disabled={!selectedProjectId}
              />
              <textarea
                className="w-full border border-slate-300 rounded-xl px-3 py-2"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task description"
                disabled={!selectedProjectId}
              />
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl disabled:bg-slate-300"
                disabled={!selectedProjectId}
              >
                Create task
              </button>
            </form>

            <div className="space-y-2 max-h-72 overflow-auto">
              {loadingTasks ? <p>Loading tasks...</p> : null}
              {!loadingTasks && tasks.length === 0 ? <p>No tasks in this project.</p> : null}
              {tasks.map((task) => (
                <div key={task.id} className="p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold">{task.title}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{task.status}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{task.description || "No description"}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
