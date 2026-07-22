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

    if (node.type === "codeBlock") {
  const code = (node.content ?? [])
    .map((n) => n.text ?? "")
    .join("")

  out.push(
    <pre
      key={`code-${index}`}
      className="my-3 overflow-x-auto rounded-lg bg-slate-100 p-4"
    >
      <code>{code}</code>
    </pre>
  )

  return
}
    if (node.type === "bulletList") {
  out.push(
    <ul
      key={`ul-${index}`}
      className="list-disc pl-6"
    >
      {renderBlock(node.content)}
    </ul>
  )
  return
}   

if (node.type === "orderedList") {
  out.push(
    <ol
      key={`ol-${index}`}
      className="list-decimal pl-6"
    >
      {renderBlock(node.content)}
    </ol>
  )
  return
}

if (node.type === "listItem") {
  out.push(
    <li key={`li-${index}`}>
      {renderBlock(node.content)}
    </li>
  )
  return
}

if (node.type === "taskItem") {
  out.push(
    <div
      key={`task-${index}`}
      className="flex items-start gap-2"
    >
      <input
        type="checkbox"
        checked={Boolean(node.attrs?.checked)}
        readOnly
      />
      <div>{renderBlock(node.content)}</div>
    </div>
  )
  return
}

if (node.type === "horizontalRule") {
  out.push(
    <hr
      key={`hr-${index}`}
      className="my-4 border-slate-300"
    />
  )
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

    if (node.type === "video") {
  const src =
    typeof node.attrs?.src === "string"
      ? node.attrs.src
      : ""

  out.push(
    <video
      key={`video-${index}`}
      controls
      src={src}
      className="my-2 max-w-full rounded-lg"
    />
  )

  return
}




if (node.type === "pdf") {
  const src =
    typeof node.attrs?.src === "string" ? node.attrs.src : ""

  const title =
    typeof node.attrs?.title === "string"
      ? node.attrs.title
      : "Document.pdf"

  out.push(
    <div
      key={`pdf-${index}`}
      className="my-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
    >
      <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
        PDF
      </span>

      <span className="max-w-[240px] truncate text-sm text-slate-700">
        {title}
      </span>

      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
      >
        Open
      </a>
    </div>
  )

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
