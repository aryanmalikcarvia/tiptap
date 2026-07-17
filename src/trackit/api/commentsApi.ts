// trackit frontend
import { apiClient } from "@/axios/axiosConfig"

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
  return normalizeCommentsResponse(data)
}

export async function createComment(
  taskId: number | string,
  payload: CommentPayload
): Promise<TaskComment> {
  const { data } = await apiClient.post<TaskComment>(
    `/tasks/${taskId}/comments`,
    payload
  )
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
  return data
}

export async function deleteComment(
  taskId: number | string,
  commentId: number | string
): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
}
