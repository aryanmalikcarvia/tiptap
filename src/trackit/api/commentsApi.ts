// trackit frontend
import { apiClient } from "@/axios/axiosConfig"
import {
  getCachedComments,
  removeCachedComment,
  setCachedComments,
  upsertCachedComment,
} from "@/trackit/api/commentsCache"
import { sortCommentsNewestFirst } from "@/trackit/utils/sortComments"

export type CommentContent =
  | Record<string, unknown>
  | unknown[]
  | string
  | null

export type TaskComment = {
  id: number | string
  taskId: number | string
  content: CommentContent
  createdBy?: number | string
  createdAt?: string
  updatedAt?: string
}

export type CommentPayload = {
  content: CommentContent
}

function isCommentLike(value: unknown): value is TaskComment {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && "content" in row
}

export function normalizeCommentsResponse(payload: unknown): TaskComment[] {
  if (Array.isArray(payload)) {
    return payload.filter(isCommentLike)
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of ["content", "data", "comments", "items", "results"]) {
      const nested = obj[key]
      if (Array.isArray(nested)) {
        return nested.filter(isCommentLike)
      }
    }
  }

  return []
}

export async function getComments(
  taskId: number | string
): Promise<TaskComment[]> {
  const { data } = await apiClient.get<unknown>(`/tasks/${taskId}/comments`)
  const comments = sortCommentsNewestFirst(normalizeCommentsResponse(data))
  setCachedComments(taskId, comments)
  return comments
}

export async function createComment(
  taskId: number | string,
  payload: CommentPayload
): Promise<TaskComment> {
  const { data } = await apiClient.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    payload
  )
  upsertCachedComment(taskId, data)
  const sorted = sortCommentsNewestFirst([
    ...(getCachedComments(taskId) ?? []),
  ])
  setCachedComments(taskId, sorted)
  return data
}

export async function updateComment(
  taskId: number | string,
  commentId: number | string,
  payload: CommentPayload
): Promise<TaskComment> {
  const { data } = await apiClient.put<TaskComment>(
    `/tasks/${taskId}/comments/${commentId}`,
    payload
  )
  upsertCachedComment(taskId, data)
  const sorted = sortCommentsNewestFirst(getCachedComments(taskId) ?? [])
  setCachedComments(taskId, sorted)
  return data
}

export async function deleteComment(
  taskId: number | string,
  commentId: number | string
): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
  removeCachedComment(taskId, commentId)
}

export { getCachedComments }
