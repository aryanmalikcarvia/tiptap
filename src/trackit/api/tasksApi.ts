// trackit frontend
import { apiClient } from "@/axios/axiosConfig"
import {
  getCachedTask,
  getCachedTasks,
  removeCachedTask,
  setCachedTask,
  setCachedTasks,
} from "@/trackit/api/tasksCache"

/** TipTap JSON (or any JSON object backend stores) */
export type TaskContent = Record<string, unknown> | unknown[] | string | null

export type Task = {
  id: number | string
  title: string
  content: TaskContent
}

export type TaskPayload = {
  title: string
  content: TaskContent
}

function isTaskLike(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && ("title" in row || "content" in row)
}

export function normalizeTasksResponse(payload: unknown): Task[] {
  if (Array.isArray(payload)) {
    return payload.filter(isTaskLike)
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of ["content", "data", "tasks", "items", "results"]) {
      const nested = obj[key]
      if (Array.isArray(nested)) {
        return nested.filter(isTaskLike)
      }
    }
  }

  return []
}

/** StrictMode / parallel calls ke liye same request dedupe */
let inflightList: Promise<Task[]> | null = null
const inflightTask = new Map<string, Promise<Task>>()

export async function getTasks(): Promise<Task[]> {
  if (inflightList) return inflightList

  const req = apiClient
    .get<unknown>("/tasks")
    .then(({ data }) => {
      const tasks = normalizeTasksResponse(data)
      setCachedTasks(tasks)
      return tasks
    })
    .finally(() => {
      inflightList = null
    })

  inflightList = req
  return req
}

export async function getTask(id: number | string): Promise<Task> {
  const key = String(id)
  const existing = inflightTask.get(key)
  if (existing) return existing

  const req = apiClient
    .get<Task>(`/tasks/${id}`)
    .then(({ data }) => {
      setCachedTask(data)
      return data
    })
    .finally(() => {
      inflightTask.delete(key)
    })

  inflightTask.set(key, req)
  return req
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks", payload)
  setCachedTask(data)
  return data
}

export async function updateTask(
  id: number | string,
  payload: TaskPayload
): Promise<Task> {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload)
  setCachedTask(data)
  return data
}

export async function deleteTask(id: number | string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
  removeCachedTask(id)
}

export { getCachedTask, getCachedTasks }
