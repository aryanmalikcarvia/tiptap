import { useCallback, useState } from "react"
import {
  createComment,
  deleteComment,
  updateComment,
} from "@/api/commentsApi"
import { getApiErrorMessage } from "@/lib/apiError"
import type { CommentPayload } from "@/types/comment"

export function useCommentActions(taskId: string | number) {
  const [isPending, setIsPending] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const reset = useCallback(() => {
    setIsError(false)
    setError(null)
  }, [])

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsPending(true)
    setIsError(false)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setIsError(true)
      setError(new Error(getApiErrorMessage(err)))
      throw err
    } finally {
      setIsPending(false)
    }
  }, [])

  const create = useCallback(
    (payload: CommentPayload) => run(() => createComment(taskId, payload)),
    [run, taskId]
  )

  const update = useCallback(
    (commentId: number | string, payload: CommentPayload) =>
      run(() => updateComment(taskId, commentId, payload)),
    [run, taskId]
  )

  const remove = useCallback(
    (commentId: number | string) => run(() => deleteComment(taskId, commentId)),
    [run, taskId]
  )

  return { isPending, isError, error, reset, create, update, remove }
}
