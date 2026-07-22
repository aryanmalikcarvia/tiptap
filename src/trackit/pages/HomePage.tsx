// trackit frontend
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useTasks } from "@/hooks/queries/useTasks"
import { Button } from "@/components/ui/button"
import { TasksTable } from "@/trackit/components/TasksTable"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

export function HomePage() {
  const navigate = useNavigate()
  const { tasks, setTasks, isPending, error } = useTasks()

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
            {error.message}
          </div>
        ) : null}

        {isPending && tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5eaf2] bg-white px-4 py-16 text-center text-sm text-[#64748b]">
            Loading tasks…
          </div>
        ) : (
          <TasksTable
            tasks={tasks}
            onView={(task) => navigate(TRACKIT_ROUTES.detailsPath(task.id))}
            onDeleted={(id) => {
              setTasks((prev) => prev.filter((t) => t.id !== id))
            }}
          />
        )}
      </div>
    </div>
  )
}
