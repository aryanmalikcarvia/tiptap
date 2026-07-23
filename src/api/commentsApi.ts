import { apiClient } from "@/axios/axiosConfig"
import { normalizeListResponse } from "@/lib/normalizeListResponse"
import type { CommentPayload, TaskComment } from "@/types/comment"

function isComment(value: unknown): value is TaskComment {
  if (!value || typeof value !== "object") return false
  const row = value as Record<string, unknown>
  return "id" in row && "content" in row
}

export async function fetchComments(
  taskId: number | string
): Promise<TaskComment[]> {
  const response = await apiClient.get<unknown>(`/tasks/${taskId}/comments`)
  return normalizeListResponse(response.data, isComment, [
    "content",
    "data",
    "comments",
    "items",
    "results",
  ])
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
