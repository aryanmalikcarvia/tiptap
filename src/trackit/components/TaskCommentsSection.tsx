// trackit frontend
import { useEffect, useRef, useState } from "react"
import type { Content, Editor } from "@tiptap/react"
import { Send, Trash2 } from "lucide-react"
import {
  createComment,
  getComments,
  updateComment,
  type TaskComment,
} from "@/trackit/api/commentsApi"
import { getApiErrorMessage } from "@/api/mediaApi"
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

  // Backend UTC timestamp me timezone suffix nahi bhej raha.
  // `Z` add karke UTC parse karo, phir user ko India time me dikhao.
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
  onUpdated: (comment: TaskComment) => void
  onRequestDelete: (comment: TaskComment) => void
}

function CommentItem({
  taskId,
  comment,
  onUpdated,
  onRequestDelete,
}: CommentItemProps) {
  const editorRef = useRef<Editor | null>(null)
  // Editing enable / disable: pehle read-only; content pe click se on
  const [isEditing, setIsEditing] = useState(false)
  const [savedContent, setSavedContent] = useState<Content>(() =>
    toEditorContent(comment.content)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSavedContent(toEditorContent(comment.content))
    setIsEditing(false)
    setError(null)
  }, [comment.id, comment.content])

  useEffect(() => {
    if (isEditing || !editorRef.current) return
    editorRef.current.commands.setContent(savedContent)
  }, [savedContent, isEditing])
  

  const enableEditing = () => {
    if (!isEditing && !saving) setIsEditing(true)
  }

  const handleCancel = () => {
    setError(null)
    if (editorRef.current) {
      editorRef.current.commands.setContent(savedContent)
    }
    setIsEditing(false)
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
      // Editing enable / disable: save ke baad wapas read-only
      setIsEditing(false)
      onUpdated(updated)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          {wasCommentEdited(comment) ? "Edited " : ""}
          {formatCommentTime(
            wasCommentEdited(comment) ? comment.updatedAt : comment.createdAt
          )}
        </p>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <p className="text-xs text-slate-400"></p>
          )}
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

      {/* Editing enable / disable: comment pe click → toolbar + typing */}
      <div
        className={`overflow-hidden rounded-xl border border-slate-200 bg-white${
          isEditing ? "" : " cursor-pointer"
        }`}
        onClick={enableEditing}
      >
        <SimpleEditor
          key={`comment-${comment.id}`}
          embedded
          compact
          editable={isEditing}
          initialContent={savedContent}
          onEditorReady={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* Editing enable / disable: Save/Cancel sirf editing me */}
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
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [composerError, setComposerError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskComment | null>(null)

  const loadComments = async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await getComments(taskId)
      setComments(data)
    } catch (err) {
      setListError(getApiErrorMessage(err))
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadComments()
  }, [taskId])

  const handleSend = async () => {
    const editor = composerRef.current
    if (isEditorContentEmpty(editor) || !editor) {
      setComposerError("Comment is required")
      return
    }

    setSending(true)
    setComposerError(null)
    try {
      const content = editor.getJSON()
      await createComment(taskId, { content })
      toast("✅ Comment posted")
      setComposerKey((k) => k + 1)
      composerRef.current = null
      await loadComments()
    } catch (err) {
      setComposerError(getApiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-800">
        Comments
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Write a comment below and click Send. Click any comment to edit it.
      </p>

      <div className="mb-6 space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          New comment
        </label>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <SimpleEditor
            key={`composer-${taskId}-${composerKey}`}
            embedded
            compact
            editable
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

        {listError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {listError}
          </div>
        )}

        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Loading comments…
          </p>
        ) : comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={String(comment.id)}
                taskId={taskId}
                comment={comment}
                onUpdated={(updated) => {
                  setComments((prev) =>
                    prev.map((c) =>
                      String(c.id) === String(updated.id) ? updated : c
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
