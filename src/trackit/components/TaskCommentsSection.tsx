// trackit frontend
import { useEffect, useRef, useState, type MouseEvent } from "react"
import type { Content, Editor } from "@tiptap/react"
import { Send, Trash2 } from "lucide-react"
import { sortCommentsNewestFirst } from "@/trackit/utils/sortComments"
import { updateComment } from "@/api/commentsApi"
import type { TaskComment } from "@/types/comment"
import { useComments } from "@/hooks/queries/useComments"
import { useCommentActions } from "@/hooks/queries/useCommentActions"
import { getApiErrorMessage } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { isEditorContentEmpty } from "@/trackit/utils/isEditorEmpty"
import { toEditorContent } from "@/trackit/utils/toEditorContent"
import { DeleteCommentDialog } from "@/trackit/components/DeleteCommentDialog"

const EMPTY_DOC: Content = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

function formatCommentTime(value?: string) {
  if (!value) return ""


  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
  const date = new Date(hasTimezone ? value : `${value}Z`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  })
}

function wasCommentEdited(comment: TaskComment) {
  return Boolean(
    comment.createdAt &&
      comment.updatedAt &&
      comment.createdAt !== comment.updatedAt
  )
}

type CommentItemProps = {
  taskId: string | number
  comment: TaskComment
  isEditing: boolean
  onStartEditing: (commentId: number | string) => void
  onStopEditing: () => void
  onUpdated: (comment: TaskComment) => void
  onRequestDelete: (comment: TaskComment) => void
}

function CommentItem({
  taskId,
  comment,
  isEditing,
  onStartEditing,
  onStopEditing,
  onUpdated,
  onRequestDelete,
}: CommentItemProps) {
  const editorRef = useRef<Editor | null>(null)
  const [savedContent, setSavedContent] = useState<Content>(() =>
    toEditorContent(comment.content)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editCaretPos, setEditCaretPos] = useState<number | null>(null)

  useEffect(() => {
    setSavedContent(toEditorContent(comment.content))
    setError(null)
  }, [comment.id, comment.content])

  useEffect(() => {
    if (!isEditing) setEditCaretPos(null)
  }, [isEditing])

  const enableEditingAtClick = (e: MouseEvent) => {
    if (isEditing || saving) return

    let pos: number | null = null
    const editor = editorRef.current
    if (editor && !editor.isDestroyed) {
      try {
        const hit = editor.view.posAtCoords({
          left: e.clientX,
          top: e.clientY,
        })
        pos = hit?.pos ?? null
      } catch {
        pos = null
      }
    }

    setEditCaretPos(pos)
    onStartEditing(comment.id)
  }

  const handleCancel = () => {
    setError(null)
    if (editorRef.current) {
      editorRef.current.commands.setContent(savedContent)
    }
    onStopEditing()
  }

  const handleSave = async () => {
    const editor = editorRef.current
    if (isEditorContentEmpty(editor) || !editor) {
      setError("Comment cannot be empty")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const content = editor.getJSON()
      const updated = await updateComment(taskId, comment.id, { content })
      setSavedContent(content as Content)
      onStopEditing()
      onUpdated(updated)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={
        isEditing
          ? "my-3 rounded-xl border border-slate-200 bg-white p-4"
          : "py-3"
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {wasCommentEdited(comment) ? "Edited " : ""}
          {formatCommentTime(
            wasCommentEdited(comment) ? comment.updatedAt : comment.createdAt
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-7 border-red-200 bg-white px-2 text-red-500 hover:bg-red-50"
            disabled={saving}
            onClick={(e) => {
              e.stopPropagation()
              onRequestDelete(comment)
            }}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div
        role={isEditing ? undefined : "button"}
        tabIndex={isEditing ? undefined : 0}
        className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left${
          isEditing
            ? ""
            : " cursor-text transition-colors hover:border-slate-300"
        }`}
        onClick={isEditing ? undefined : enableEditingAtClick}
        onKeyDown={
          isEditing
            ? undefined
            : (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setEditCaretPos(null)
                  onStartEditing(comment.id)
                }
              }
        }
      >
        <SimpleEditor
          key={`comment-${comment.id}`}
          embedded
          compact
          editable={isEditing}
          autoFocus={false}
          initialCaretPos={editCaretPos}
          placeholder="Edit comment…"
          initialContent={savedContent}
          onEditorReady={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {isEditing && (
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="border-slate-200 bg-white text-slate-800 hover:bg-gray-200"
            disabled={saving}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={saving}
            onClick={() => {
              void handleSave()
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  )
}

type TaskCommentsSectionProps = {
  taskId: string | number
}

export function TaskCommentsSection({ taskId }: TaskCommentsSectionProps) {
  const { toast } = useToast()
  const composerRef = useRef<Editor | null>(null)
  const [composerKey, setComposerKey] = useState(0)
  const [editingCommentId, setEditingCommentId] = useState<
    number | string | null
  >(null)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskComment | null>(null)

  const {
    comments,
    setComments,
    isPending: loading,
    error: listError,
    refetch,
  } = useComments(taskId)

  const { create, isPending: sending } = useCommentActions(taskId)

  useEffect(() => {
    setEditingCommentId(null)
  }, [taskId])

  const handleSend = async () => {
    const editor = composerRef.current
    if (isEditorContentEmpty(editor) || !editor) {
      setComposerError("Comment is required")
      return
    }

    setComposerError(null)
    try {
      const content = editor.getJSON()
      await create({ content })
      toast("✅ Comment posted")
      setComposerKey((k) => k + 1)
      composerRef.current = null
      await refetch()
    } catch (err) {
      setComposerError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-800">
        Comments
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Write a comment below and click Send. Press Enter for a new line. Click
        any comment to edit it.
      </p>

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          New comment
        </label>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white cursor-text">
          <SimpleEditor
            key={`composer-${taskId}-${composerKey}`}
            embedded
            compact
            editable
            placeholder="Write a comment…"
            initialContent={EMPTY_DOC}
            onEditorReady={(editor) => {
              composerRef.current = editor
            }}
          />
        </div>
        {composerError && (
          <p className="text-sm text-red-500">{composerError}</p>
        )}
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            className="bg-blue-500 text-white hover:bg-blue-600"
            disabled={sending}
            onClick={() => {
              void handleSend()
            }}
          >
            <Send className="size-4" />
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          All comments
        </h3>

        {listError && comments.length === 0 && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {listError.message}
          </div>
        )}

        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Loading comments…
          </p>
        ) : comments.length === 0 && !listError ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((comment) => (
              <CommentItem
                key={String(comment.id)}
                taskId={taskId}
                comment={comment}
                isEditing={String(editingCommentId) === String(comment.id)}
                onStartEditing={setEditingCommentId}
                onStopEditing={() => setEditingCommentId(null)}
                onUpdated={(updated) => {
                  setComments((prev) =>
                    sortCommentsNewestFirst(
                      prev.map((c) =>
                        String(c.id) === String(updated.id) ? updated : c
                      )
                    )
                  )
                }}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteCommentDialog
        taskId={taskId}
        comment={deleteTarget}
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onDeleted={(id) => {
          setComments((prev) => prev.filter((c) => String(c.id) !== String(id)))
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}
