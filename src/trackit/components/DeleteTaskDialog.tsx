// trackit frontend
import { useTaskActions } from "@/hooks/queries/useTaskActions"
import type { Task } from "@/types/task"
import { getApiErrorMessage } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast"

type DeleteTaskDialogProps = {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (id: number | string) => void
}

export function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTaskDialogProps) {
  const { toast } = useToast()
  const { remove, isPending, error, reset } = useTaskActions()

  const handleDelete = async () => {
    if (!task) return
    reset()
    try {
      await remove(task.id)
      onDeleted(task.id)
      onOpenChange(false)
      toast("✅ Task deleted successfully")
    } catch (err) {
      // error already in hook; surface via getApiErrorMessage if needed
      void getApiErrorMessage(err)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-white">Delete this task?</DialogTitle>
          <DialogDescription>
            {task
              ? `“${task.title || `Task #${task.id}`}” will be removed. This cannot be undone.`
              : "This cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {error ? <p className="text-sm text-red-600">{error.message}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void handleDelete()}
          >
            {isPending ? "Deleting…" : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
