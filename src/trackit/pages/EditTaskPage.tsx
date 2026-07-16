// trackit frontend
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil } from "lucide-react"
import type { Content, Editor } from "@tiptap/react"
import { getTask, updateTask } from "@/trackit/api/tasksApi"
import { getApiErrorMessage } from "@/api/mediaApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { isEditorContentEmpty } from "@/trackit/utils/isEditorEmpty"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

const EMPTY_DOC: Content = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

function toEditorContent(content: unknown): Content {
  if (content == null) return EMPTY_DOC
  if (typeof content === "string") {
    try {
      return JSON.parse(content) as Content
    } catch {
      return {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: content }] },
        ],
      }
    }
  }
  if (typeof content === "object") return content as Content
  return EMPTY_DOC
}

export function EditTaskPage() {
  const { taskId = "" } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const editorRef = useRef<Editor | null>(null)

  // Editing enable / disable: pehle read-only content dikhe; Edit click par true
  const [isEditing, setIsEditing] = useState(false)

  const [title, setTitle] = useState("")
  const [savedTitle, setSavedTitle] = useState("")
  const [initialContent, setInitialContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setApiError(null)
      setIsEditing(false)
      try {
        const task = await getTask(taskId)
        if (cancelled) return
        const nextTitle = task.title ?? ""
        const nextContent = toEditorContent(task.content)
        setTitle(nextTitle)
        setSavedTitle(nextTitle)
        setInitialContent(nextContent)
      } catch (err) {
        if (!cancelled) setApiError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [taskId])

  // Editing enable / disable: Cancel → changes discard, wapas read-only
  const handleCancelEdit = () => {
    setTitle(savedTitle)
    setTitleError(null)
    setDescriptionError(null)
    setApiError(null)
    if (initialContent && editorRef.current) {
      editorRef.current.commands.setContent(initialContent)
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

    if (isEditorContentEmpty(editor)) {
      setDescriptionError("Description is required")
      hasError = true
    } else {
      setDescriptionError(null)
    }

    if (hasError || !editor) return

    setSaving(true)
    setApiError(null)
    try {
      const content = editor.getJSON()
      await updateTask(taskId, {
        title: trimmed,
        content,
      })
      setSavedTitle(trimmed)
      setInitialContent(content as Content)
      // Editing enable / disable: save ke baad wapas read-only
      setIsEditing(false)
      toast("✅ Task updated successfully")
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

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
          
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {isEditing ? "Edit Task" : "Task Details"}
            </h1>

            {/* Editing enable / disable: Edit → toolbar + typing; Cancel/Save → read-only */}
            {!loading && initialContent && isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="border-slate-200 bg-white text-slate-800 hover:bg-gray-200"
                  disabled={saving}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}

            {!loading && initialContent && !isEditing && (
              <Button
                type="button"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            )}
          </div>

          {apiError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          ) : null}

          {loading || !initialContent ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading task…
            </p>
          ) : (
            <>
              <div className="mb-5 space-y-2">
                <label
                  htmlFor="edit-task-title"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Title
                  {isEditing ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </label>
                <Input
                  id="edit-task-title"
                  className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100 disabled:bg-slate-50 disabled:opacity-100"
                  placeholder="Enter task title"
                  value={title}
                  disabled={!isEditing || saving}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (titleError) setTitleError(null)
                  }}
                />
                {titleError ? (
                  <p className="text-sm text-red-500">{titleError}</p>
                ) : null}
              </div>

              <div className="mb-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  Description
                  {isEditing ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </label>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* Editing enable / disable: editable={isEditing} → toolbar + typing sync */}
                  <SimpleEditor
                    key={String(taskId)}
                    embedded
                    editable={isEditing}
                    initialContent={initialContent}
                    onEditorReady={(editor) => {
                      editorRef.current = editor
                    }}
                  />
                </div>
                {descriptionError ? (
                  <p className="text-sm text-red-500">{descriptionError}</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
