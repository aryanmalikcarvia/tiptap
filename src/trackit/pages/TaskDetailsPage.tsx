// trackit frontend
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { Content, Editor } from "@tiptap/react"
import { useTask } from "@/hooks/queries/useTask"
import { useTaskActions } from "@/hooks/queries/useTaskActions"
import { getApiErrorMessage } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { isEditorContentEmpty } from "@/trackit/utils/isEditorEmpty"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"
import { TaskCommentsSection } from "@/trackit/components/TaskCommentsSection"

export function TaskDetailsPage() {
  const { taskId = "" } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const editorRef = useRef<Editor | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const pendingTitleFocusRef = useRef(false)
  const [editCaretPos, setEditCaretPos] = useState<number | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    title,
    setTitle,
    savedTitle,
    setSavedTitle,
    savedContent,
    setSavedContent,
    isPending,
    error: loadError,
    setError,
  } = useTask(taskId)

  const { update, isPending: saving } = useTaskActions()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [taskId])

  useEffect(() => {
    setApiError(null)
    setError(null)
    setIsEditing(false)
  }, [taskId, setError])

  const enableEditing = () => {
    if (!isEditing && !isPending) {
      setEditCaretPos(null)
      setIsEditing(true)
    }
  }

  const enableEditingAtClick = (e: MouseEvent) => {
    if (isEditing || isPending) return

    // Toolbar se pehle hi doc pos nikal lo — coords baad me shift ho jati hain
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
    setIsEditing(true)
  }

  const enableEditingWithTitleFocus = () => {
    if (isPending) return
    if (!isEditing) {
      pendingTitleFocusRef.current = true
      setEditCaretPos(null)
      setIsEditing(true)
    }
  }

  useEffect(() => {
    if (isEditing && pendingTitleFocusRef.current) {
      pendingTitleFocusRef.current = false
      titleInputRef.current?.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) setEditCaretPos(null)
  }, [isEditing])

  const handleCancel = () => {
    setTitle(savedTitle)
    setTitleError(null)
    setDescriptionError(null)
    setApiError(null)
    if (savedContent && editorRef.current) {
      editorRef.current.commands.setContent(savedContent)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmed = title.trim()
    const editor = editorRef.current

    let hasError = false
    if (!trimmed) {
      setTitleError("Title is required")
      hasError = true
    } else {
      setTitleError(null)
    }

    if (isEditorContentEmpty(editor) || !editor) {
      setDescriptionError("Description is required")
      hasError = true
    } else {
      setDescriptionError(null)
    }

    if (hasError || !editor) return

    setApiError(null)
    try {
      const content = editor.getJSON()
      await update(taskId, {
        title: trimmed,
        content,
      })
      setSavedTitle(trimmed)
      setSavedContent(content as Content)
      setIsEditing(false)
      toast("✅ Task updated successfully")
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    }
  }

  const displayError = apiError || loadError?.message

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(TRACKIT_ROUTES.home)}
          disabled={saving}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Go Back
        </Button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">
            {isEditing ? "Edit Task" : "Task Details"}
          </h1>

          {displayError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {displayError}
            </div>
          )}

          {isPending || !savedContent ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading task…
            </p>
          ) : (
            <>
              <div className="mb-5 space-y-2">
                <label
                  htmlFor="task-details-title"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Title{isEditing && <span className="text-red-500"> *</span>}
                </label>
                <Input
                  ref={titleInputRef}
                  id="task-details-title"
                  className={
                    isEditing
                      ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                      : "cursor-pointer border-slate-200 bg-slate-50 text-slate-800"
                  }
                  placeholder="Enter task title"
                  value={title}
                  readOnly={!isEditing}
                  disabled={saving}
                  onMouseDown={(e) => {
                    if (!isEditing && !isPending) {
                      e.preventDefault()
                      enableEditingWithTitleFocus()
                    }
                  }}
                  onFocus={() => enableEditing()}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (titleError) setTitleError(null)
                  }}
                />
                {titleError && (
                  <p className="text-sm text-red-500">{titleError}</p>
                )}
              </div>

              <div className="mb-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Description
                  {isEditing && <span className="text-red-500"> *</span>}
                </label>
                <div
                  className={`overflow-hidden rounded-xl border border-slate-200 bg-white${
                    isEditing ? " cursor-text" : " cursor-pointer"
                  }`}
                  onClick={enableEditingAtClick}
                >
                  <SimpleEditor
                    key={String(taskId)}
                    embedded
                    editable={isEditing}
                    autoFocus={false}
                    initialCaretPos={editCaretPos}
                    initialContent={savedContent}
                    onEditorReady={(editor) => {
                      editorRef.current = editor
                    }}
                  />
                </div>
                {descriptionError && (
                  <p className="text-sm text-red-500">{descriptionError}</p>
                )}
              </div>

              {isEditing && (
                <div className="mt-6 flex items-center gap-3">
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
            </>
          )}
        </div>

        {!isPending && savedContent && (
          <TaskCommentsSection taskId={taskId} />
        )}
      </div>
    </div>
  )
}
