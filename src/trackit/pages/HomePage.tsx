// trackit frontend
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { getApiErrorMessage } from "@/api/mediaApi"
import { getTasks, type Task } from "@/trackit/api/tasksApi"
import { Button } from "@/components/ui/button"
import { TasksTable } from "@/trackit/components/TasksTable"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

export function HomePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  return (
    <div className="trackit-page">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b] sm:text-3xl">
              Tasks
            </h1>
            <p className="mt-1.5 text-sm text-[#64748b]">Manage your tasks.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-[#3b82f6] text-white hover:bg-[#2563eb]"
              onClick={() => navigate(TRACKIT_ROUTES.create)}
            >
              <Plus />
              Create Task
            </Button>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-[#fef2f2] px-4 py-3 text-sm text-[#ef4444]">
            {error}
          </div>
        ) : null}

        {loading && tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5eaf2] bg-white px-4 py-16 text-center text-sm text-[#64748b]">
            Loading tasks…
          </div>
        ) : (
          <TasksTable
            tasks={tasks}
            onEdit={(task) => navigate(TRACKIT_ROUTES.edit(task.id))}
            onView={(task) => navigate(TRACKIT_ROUTES.details(task.id))}
            onDeleted={(id) => {
              setTasks((prev) => prev.filter((t) => t.id !== id))
            }}
          />
        )}
      </div>
    </div>
  )
}
