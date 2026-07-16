// trackit frontend
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getApiErrorMessage } from "@/api/mediaApi"
import { getTask, type Task } from "@/trackit/api/tasksApi"
import { Button } from "@/components/ui/button"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

export function CardDetailsPage() {
  const { taskId = "" } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getTask(taskId)
        if (!cancelled) setTask(data)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [taskId])

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <Button
        variant="outline"
        onClick={() => navigate(TRACKIT_ROUTES.home)}
      >
        ← Back
      </Button>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading task…</p>
      ) : (
        <>
          <h1 className="mt-6 text-3xl font-bold">{task?.title}</h1>
          <p className="mt-4 text-slate-500">This is Task Details Page.</p>
        </>
      )}
    </div>
  )
}
