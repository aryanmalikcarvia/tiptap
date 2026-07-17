// trackit frontend
import { useState } from "react"
import { deleteComment, type TaskComment } from "@/trackit/api/commentsApi"
import { getApiErrorMessage } from "@/api/mediaApi"
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!comment) return
    setLoading(true)
    setError(null)
    try {
      await deleteComment(taskId, comment.id)
      onDeleted(comment.id)
      onOpenChange(false)
      toast("✅ Comment deleted successfully")
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null)
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

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => void handleDelete()}
          >
            {loading ? "Deleting…" : "Yes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
