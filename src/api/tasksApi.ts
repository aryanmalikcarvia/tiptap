import { apiClient } from "@/axios/axiosConfig"
import type { Task, TaskPayload } from "@/types/task"

function isTaskLike(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && ("title" in row || "content" in row)
}

function normalizeTasksResponse(payload: unknown): Task[] {
  if (Array.isArray(payload)) return payload.filter(isTaskLike)
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of ["content", "data", "tasks", "items", "results"]) {
      const nested = obj[key]
      if (Array.isArray(nested)) return nested.filter(isTaskLike)
    }
  }
  return []
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get<unknown>("/tasks")
  return normalizeTasksResponse(response.data)
}

export async function fetchTask(id: number | string): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${id}`)
  return response.data
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const response = await apiClient.post<Task>("/tasks", payload)
  return response.data
}

export async function updateTask(
  id: number | string,
  payload: TaskPayload
): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${id}`, payload)
  return response.data
}

export async function deleteTask(id: number | string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}
