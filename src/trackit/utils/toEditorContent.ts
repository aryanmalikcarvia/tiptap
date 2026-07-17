// trackit frontend
import type { Content } from "@tiptap/react"

const EMPTY_DOC: Content = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

/** Backend content (JSON object / stringified JSON / plain text) → TipTap Content */
export function toEditorContent(content: unknown): Content {
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
