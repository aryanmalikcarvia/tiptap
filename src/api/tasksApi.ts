import { apiClient } from "@/axios/axiosConfig"
import { normalizeListResponse } from "@/lib/normalizeListResponse"
import type { Task, TaskPayload } from "@/types/task"

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && ("title" in row || "content" in row)
}

export async function fetchTasks(): Promise<Task[]> {
  const response = await apiClient.get<unknown>("/tasks")
  return normalizeListResponse(response.data, isTask, [
    "content",
    "data",
    "tasks",
    "items",
    "results",
  ])
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
