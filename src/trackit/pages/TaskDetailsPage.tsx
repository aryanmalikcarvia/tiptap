// trackit frontend
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { Content, Editor } from "@tiptap/react"
import { getCachedTask, getTask, updateTask } from "@/trackit/api/tasksApi"
import { getApiErrorMessage } from "@/api/mediaApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { isEditorContentEmpty } from "@/trackit/utils/isEditorEmpty"
import { toEditorContent } from "@/trackit/utils/toEditorContent"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"
import { TaskCommentsSection } from "@/trackit/components/TaskCommentsSection"

export function TaskDetailsPage() {
  const { taskId = "" } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const editorRef = useRef<Editor | null>(null)

  // Editing enable / disable: page khulte hi band; title/description pe click se on
  const [isEditing, setIsEditing] = useState(false)

  // Reload pe pehle cache se hydrate — "Loading…" sirf pehli baar
  const cached = getCachedTask(taskId)
  const [title, setTitle] = useState(() => cached?.title ?? "")
  const [savedTitle, setSavedTitle] = useState(() => cached?.title ?? "")
  const [savedContent, setSavedContent] = useState<Content | null>(() =>
    cached ? toEditorContent(cached.content) : null
  )
  const [loading, setLoading] = useState(() => cached == null)
  const [saving, setSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [taskId])

  useEffect(() => {
    let cancelled = false
    const fromCache = getCachedTask(taskId)

    if (fromCache) {
      setTitle(fromCache.title ?? "")
      setSavedTitle(fromCache.title ?? "")
      setSavedContent(toEditorContent(fromCache.content))
      setLoading(false)
    } else {
      setLoading(true)
      setSavedContent(null)
      setTitle("")
      setSavedTitle("")
    }

    setApiError(null)
    setIsEditing(false)

    ;(async () => {
      try {
        const task = await getTask(taskId)
        if (cancelled) return
        const nextTitle = task.title ?? ""
        setTitle(nextTitle)
        setSavedTitle(nextTitle)
        setSavedContent(toEditorContent(task.content))
      } catch (err) {
        if (!cancelled && getCachedTask(taskId) == null) {
          setApiError(getApiErrorMessage(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [taskId])

  // Silent refresh ke baad editor content sync (sirf read-only mode me)
  useEffect(() => {
    if (isEditing || !savedContent || !editorRef.current) return
    editorRef.current.commands.setContent(savedContent)
  }, [savedContent, isEditing])

  // Editing enable / disable: kisi bhi field pe click → editing on
  const enableEditing = () => {
    if (!isEditing && !loading) setIsEditing(true)
  }

  // Editing enable / disable: Cancel → changes discard, wapas read-only
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
      setSavedContent(content as Content)
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
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">
            {isEditing ? "Edit Task" : "Task Details"}
          </h1>

          {apiError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {loading || !savedContent ? (
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
                {/* Title sirf tab editable hai jab description se editing already on ho */}
                <Input
                  id="task-details-title"
                  className={
                    isEditing
                      ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
                      : "border-slate-200 bg-slate-50 text-slate-800"
                  }
                  placeholder="Enter task title"
                  value={title}
                  readOnly={!isEditing}
                  disabled={saving}
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
                {/* Editing enable / disable: description pe click → editing on */}
                <div
                  className={`overflow-hidden rounded-xl border border-slate-200 bg-white${
                    isEditing ? " cursor-text" : " cursor-pointer"
                  }`}
                  onClick={enableEditing}
                >
                  <SimpleEditor
                    key={String(taskId)}
                    embedded
                    editable={isEditing}
                    autoFocus={isEditing}
                    placeholder="Click to edit description…"
                    submitOnEnter={isEditing}
                    onEnterSubmit={() => {
                      void handleSave()
                    }}
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

        {!loading && savedContent && <TaskCommentsSection taskId={taskId} />}
      </div>
    </div>
  )
}
