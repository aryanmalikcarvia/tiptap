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
