// trackit frontend
import type { Task } from "@/trackit/api/tasksApi"

const LIST_KEY = "trackit:tasks-list"
const taskKey = (id: string | number) => `trackit:task:${id}`

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / private mode — ignore
  }
}

export function getCachedTasks(): Task[] | null {
  return readJson<Task[]>(LIST_KEY)
}

export function setCachedTasks(tasks: Task[]) {
  writeJson(LIST_KEY, tasks)
  for (const task of tasks) {
    writeJson(taskKey(task.id), task)
  }
}

export function getCachedTask(id: string | number): Task | null {
  return readJson<Task>(taskKey(id))
}

export function setCachedTask(task: Task) {
  writeJson(taskKey(task.id), task)
  const list = getCachedTasks()
  if (!list) return
  const idx = list.findIndex((t) => String(t.id) === String(task.id))
  if (idx >= 0) {
    const next = [...list]
    next[idx] = task
    writeJson(LIST_KEY, next)
  } else {
    writeJson(LIST_KEY, [task, ...list])
  }
}

export function removeCachedTask(id: string | number) {
  try {
    sessionStorage.removeItem(taskKey(id))
  } catch {
    // ignore
  }
  const list = getCachedTasks()
  if (!list) return
  writeJson(
    LIST_KEY,
    list.filter((t) => String(t.id) !== String(id))
  )
}
