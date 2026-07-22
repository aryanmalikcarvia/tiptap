import { useCallback, useEffect, useState } from "react"
import type { Content } from "@tiptap/react"
import { fetchTask as fetchTaskApi } from "@/api/tasksApi"
import { getApiErrorMessage } from "@/lib/apiError"
import type { Task } from "@/types/task"
import { toEditorContent } from "@/trackit/utils/toEditorContent"

export function useTask(taskId: string | number) {
  const [task, setTask] = useState<Task | null>(null)
  const [title, setTitle] = useState("")
  const [savedTitle, setSavedTitle] = useState("")
  const [savedContent, setSavedContent] = useState<Content | null>(null)
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsPending(true)
    setIsError(false)
    setError(null)

    try {
      const data = await fetchTaskApi(taskId)
      setTask(data)
      setTitle(data.title ?? "")
      setSavedTitle(data.title ?? "")
      setSavedContent(toEditorContent(data.content))
      return data
    } catch (err) {
      setIsError(true)
      setError(new Error(getApiErrorMessage(err)))
      setTask(null)
      setTitle("")
      setSavedTitle("")
      setSavedContent(null)
      throw err
    } finally {
      setIsPending(false)
    }
  }, [taskId])

  useEffect(() => {
    void refetch().catch(() => undefined)
  }, [refetch])

  return {
    task,
    title,
    setTitle,
    savedTitle,
    setSavedTitle,
    savedContent,
    setSavedContent,
    isPending,
    isError,
    error,
    setError,
    refetch,
  }
}
