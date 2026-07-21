// trackit frontend
import type { TaskComment } from "@/trackit/api/commentsApi"

const listKey = (taskId: string | number) => `trackit:comments:${taskId}`

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
    // ignore
  }
}

export function getCachedComments(taskId: string | number): TaskComment[] | null {
  return readJson<TaskComment[]>(listKey(taskId))
}

export function setCachedComments(taskId: string | number, comments: TaskComment[]) {
  writeJson(listKey(taskId), comments)
}

export function upsertCachedComment(taskId: string | number, comment: TaskComment) {
  const list = getCachedComments(taskId) ?? []
  const idx = list.findIndex((c) => String(c.id) === String(comment.id))
  if (idx >= 0) {
    const next = [...list]
    next[idx] = comment
    writeJson(listKey(taskId), next)
    return
  }
  writeJson(listKey(taskId), [comment, ...list])
}

export function removeCachedComment(taskId: string | number, commentId: string | number) {
  const list = getCachedComments(taskId)
  if (!list) return
  writeJson(
    listKey(taskId),
    list.filter((c) => String(c.id) !== String(commentId))
  )
}
