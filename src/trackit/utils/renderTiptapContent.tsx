// trackit frontend
import type { ReactNode } from "react"

type TiptapMark = {
  type?: string
}

type TiptapLikeNode = {
  type?: string
  text?: string
  marks?: TiptapMark[]
  attrs?: Record<string, unknown>
  content?: TiptapLikeNode[]
}

function applyMarks(text: string, marks: TiptapMark[] | undefined): ReactNode {
  let node: ReactNode = text
  if (!marks?.length) return node

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        node = <strong>{node}</strong>
        break
      case "italic":
        node = <em>{node}</em>
        break
      case "strike":
        node = <s>{node}</s>
        break
      case "underline":
        node = <u>{node}</u>
        break
      case "code":
        node = (
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em]">
            {node}
          </code>
        )
        break
      default:
        break
    }
  }

  return node
}

function renderBlock(nodes: TiptapLikeNode[] | undefined): ReactNode[] {
  if (!nodes) return []

  const out: ReactNode[] = []

  nodes.forEach((node, index) => {
    if (typeof node.text === "string" && node.text.length > 0) {
      out.push(
        <span key={`t-${index}`}>{applyMarks(node.text, node.marks)}</span>
      )
      return
    }

    if (node.type === "paragraph" || node.type === "heading") {
      const children = renderBlock(node.content)
      if (children.length > 0) {
        out.push(
          <p key={`p-${index}`} className="text-sm leading-relaxed text-slate-800">
            {children}
          </p>
        )
      }
      return
    }

    if (node.type === "blockquote") {
      const children = renderBlock(node.content)
      if (children.length > 0) {
        out.push(
          <blockquote
            key={`q-${index}`}
            className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-600"
          >
            {children}
          </blockquote>
        )
      }
      return
    }

    if (node.type === "hardBreak") {
      out.push(<br key={`br-${index}`} />)
      return
    }

    if (node.type === "image") {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : ""
      if (src) {
        out.push(
          <img
            key={`img-${index}`}
            src={src}
            alt=""
            className="my-2 max-h-48 max-w-full rounded-md"
          />
        )
      }
      return
    }

    if (Array.isArray(node.content)) {
      out.push(...renderBlock(node.content))
    }
  })

  return out
}

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

/** Read-only TipTap JSON → simple inline/block text (no editor box) */
export function renderTiptapContent(content: unknown): ReactNode {
  const root = parseContent(content)
  if (!root) return <span className="text-sm text-slate-400">—</span>

  const nodes = Array.isArray(root.content)
    ? renderBlock(root.content)
    : typeof root.text === "string"
      ? renderBlock([root])
      : []

  if (nodes.length === 0) {
    return <span className="text-sm text-slate-400">—</span>
  }

  return <div className="space-y-1">{nodes}</div>
}
