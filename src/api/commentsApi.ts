import { apiClient } from "@/axios/axiosConfig"
import type { CommentPayload, TaskComment } from "@/types/comment"
import { sortCommentsNewestFirst } from "@/trackit/utils/sortComments"

function isCommentLike(value: unknown): value is TaskComment {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && "content" in row
}

function normalizeCommentsResponse(payload: unknown): TaskComment[] {
  if (Array.isArray(payload)) return payload.filter(isCommentLike)
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of ["content", "data", "comments", "items", "results"]) {
      const nested = obj[key]
      if (Array.isArray(nested)) return nested.filter(isCommentLike)
    }
  }
  return []
}

export async function fetchComments(
  taskId: number | string
): Promise<TaskComment[]> {
  const response = await apiClient.get<unknown>(`/tasks/${taskId}/comments`)
  return sortCommentsNewestFirst(normalizeCommentsResponse(response.data))
}

export async function createComment(
  taskId: number | string,
  payload: CommentPayload
): Promise<TaskComment> {
  const response = await apiClient.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    payload
  )
  return response.data
}

export async function updateComment(
  taskId: number | string,
  commentId: number | string,
  payload: CommentPayload
): Promise<TaskComment> {
  const response = await apiClient.put<TaskComment>(
    `/tasks/${taskId}/comments/${commentId}`,
    payload
  )
  return response.data
}

export async function deleteComment(
  taskId: number | string,
  commentId: number | string
): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
}
