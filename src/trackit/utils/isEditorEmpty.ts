// trackit frontend
import type { Editor } from "@tiptap/react"

export function isEditorContentEmpty(editor: Editor | null): boolean {
  if (!editor) return true
  if (editor.isEmpty) return true
  return editor.getText().trim().length === 0
}
