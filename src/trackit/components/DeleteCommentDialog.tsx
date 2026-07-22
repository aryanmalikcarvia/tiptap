// trackit frontend
import { useCommentActions } from "@/hooks/queries/useCommentActions"
import type { TaskComment } from "@/types/comment"
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

type DeleteCommentDialogProps = {
  taskId: string | number
  comment: TaskComment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (id: number | string) => void
}

export function DeleteCommentDialog({
  taskId,
  comment,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCommentDialogProps) {
  const { toast } = useToast()
  const { remove, isPending, error, reset } = useCommentActions(taskId)

  const handleDelete = async () => {
    if (!comment) return
    reset()
    try {
      await remove(comment.id)
      onDeleted(comment.id)
      onOpenChange(false)
      toast("✅ Comment deleted successfully")
    } catch {
      /* error in hook */
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
          <DialogTitle className="text-white">Delete this comment?</DialogTitle>
          <DialogDescription>
            This comment will be removed. This cannot be undone.
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
