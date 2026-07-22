import { useCallback, useEffect, useState } from "react"
import { fetchComments as fetchCommentsApi } from "@/api/commentsApi"
import { getApiErrorMessage } from "@/lib/apiError"
import type { TaskComment } from "@/types/comment"
import { sortCommentsNewestFirst } from "@/trackit/utils/sortComments"

export function useComments(taskId: string | number) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsPending(true)
    setIsError(false)
    setError(null)

    try {
      const data = await fetchCommentsApi(taskId)
      setComments(sortCommentsNewestFirst(data))
      return data
    } catch (err) {
      setIsError(true)
      setError(new Error(getApiErrorMessage(err)))
      setComments([])
      throw err
    } finally {
      setIsPending(false)
    }
  }, [taskId])

  useEffect(() => {
    void refetch().catch(() => undefined)
  }, [refetch])

  return { comments, setComments, isPending, isError, error, refetch }
}
