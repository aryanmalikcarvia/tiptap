import { useCallback, useState } from "react"
import { createTask, deleteTask, updateTask } from "@/api/tasksApi"
import { getApiErrorMessage } from "@/lib/apiError"
import type { TaskPayload } from "@/types/task"

export function useTaskActions() {
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
    (payload: TaskPayload) => run(() => createTask(payload)),
    [run]
  )

  const update = useCallback(
    (id: number | string, payload: TaskPayload) =>
      run(() => updateTask(id, payload)),
    [run]
  )

  const remove = useCallback(
    (id: number | string) => run(() => deleteTask(id)),
    [run]
  )

  return { isPending, isError, error, reset, create, update, remove }
}
