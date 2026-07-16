// trackit frontend
// Home table preview: plain text only (no bold/italic), no media — full formatting stays on detail/edit pages

type TiptapLikeNode = {
  type?: string
  text?: string
  content?: TiptapLikeNode[]
}

const MEDIA_NODE_TYPES = new Set([
  "image",
  "video",
  "pdf",
  "imageUpload",
  "file",
])

function parseContent(content: unknown): TiptapLikeNode | null {
  if (content == null) return null

  if (typeof content === "string") {
    const trimmed = content.trim()
    if (!trimmed) return null
    try {
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return JSON.parse(trimmed) as TiptapLikeNode
      }
    } catch {
      return { type: "text", text: trimmed }
    }
    return { type: "text", text: trimmed }
  }

  if (typeof content === "object") return content as TiptapLikeNode
  return null
}

/** Walk TipTap JSON → plain text; skip media nodes; ignore marks (bold/italic/etc.) */
function collectPlainText(nodes: TiptapLikeNode[] | undefined, parts: string[]) {
  if (!nodes) return

  for (const node of nodes) {
    if (node.type && MEDIA_NODE_TYPES.has(node.type)) continue

    if (typeof node.text === "string" && node.text.length > 0) {
      parts.push(node.text)
      continue
    }

    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote" ||
      node.type === "listItem" ||
      node.type === "hardBreak"
    ) {
      if (parts.length > 0 && parts[parts.length - 1] !== " ") {
        parts.push(" ")
      }
    }

    if (node.type === "hardBreak") {
      parts.push(" ")
      continue
    }

    if (Array.isArray(node.content)) {
      collectPlainText(node.content, parts)
    }
  }
}

/**
 * Cut at the last complete word so "..." never starts mid-word.
 * e.g. "depend on writers..." → "depend on..." (not "depend o...")
 */
function truncateAtWordEnd(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  const slice = text.slice(0, maxLength + 1)
  const lastSpace = slice.lastIndexOf(" ")

  // Prefer cutting at a word boundary; fallback only if no space found
  const cut =
    lastSpace > Math.floor(maxLength * 0.4)
      ? slice.slice(0, lastSpace)
      : text.slice(0, maxLength)

  return `${cut.trimEnd()}...`
}

/**
 * Home preview helper: short plain-text snippet only.
 * Formatting + media show on inner pages, not on home.
 * ~2 lines at current column width (280px).
 */
export function previewFromTiptapContent(
  content: unknown,
  maxLength = 95
): string {
  const root = parseContent(content)
  if (!root) return "—"

  const parts: string[] = []
  if (Array.isArray(root.content)) {
    collectPlainText(root.content, parts)
  } else if (typeof root.text === "string") {
    parts.push(root.text)
  }

  const full = parts.join("").replace(/\s+/g, " ").trim()
  if (!full) return "—"

  return truncateAtWordEnd(full, maxLength)
}
