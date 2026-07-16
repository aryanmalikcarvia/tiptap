// trackit frontend
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { Content, Editor } from "@tiptap/react"
import { createTask } from "@/trackit/api/tasksApi"
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

export function CreateTaskPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const editorRef = useRef<Editor | null>(null)
  const [title, setTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleCreate = async () => {
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

    setCreating(true)
    setApiError(null)
    try {
      await createTask({
        title: trimmed,
        content: editor.getJSON(),
      })
      toast("✅ Task created successfully")
      navigate(TRACKIT_ROUTES.home)
    } catch (err) {
      setApiError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(TRACKIT_ROUTES.home)}
          disabled={creating}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Go Back
        </Button>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800">
            Create Task
          </h1>

          {apiError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {apiError}
            </div>
          ) : null}

          <div className="mb-5 space-y-2">
            <label
              htmlFor="task-title"
              className="block text-sm font-semibold text-slate-800"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="task-title"
              className="border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-100"
              placeholder="Enter task title"
              value={title}
              disabled={creating}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError(null)
              }}
            />
            {titleError ? (
              <p className="text-sm text-red-500">{titleError}</p>
            ) : null}
          </div>

          <div className="mb-6 space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <SimpleEditor
                embedded
                initialContent={EMPTY_DOC}
                onEditorReady={(editor) => {
                  editorRef.current = editor
                }}
              />
            </div>
            {descriptionError ? (
              <p className="text-sm text-red-500">{descriptionError}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="border-slate-200 bg-white text-slate-800 hover:bg-gray-200"
              disabled={creating}
              onClick={() => navigate(TRACKIT_ROUTES.home)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={creating}
              onClick={() => void handleCreate()}
            >
              {creating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
