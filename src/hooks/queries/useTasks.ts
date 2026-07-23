import { useCallback, useEffect, useState } from "react"
import { fetchTasks as fetchTasksApi } from "@/api/tasksApi"
import { getApiErrorMessage } from "@/lib/apiError"
import { dedupeRequest } from "@/lib/requestDedupe"
import type { Task } from "@/types/task"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsPending(true)
    setIsError(false)
    setError(null)

    try {
      const data = await dedupeRequest("tasks:all", () => fetchTasksApi())
      setTasks(data)
      return data
    } catch (err) {
      setIsError(true)
      setError(new Error(getApiErrorMessage(err)))
      setTasks([])
      throw err
    } finally {
      setIsPending(false)
    }
  }, [])

  useEffect(() => {
    void refetch().catch(() => undefined)
  }, [refetch])

  return { tasks, setTasks, isPending, isError, error, refetch }
}
