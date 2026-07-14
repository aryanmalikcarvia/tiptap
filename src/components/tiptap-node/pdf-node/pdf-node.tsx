"use client"

import type { MouseEvent } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Trash2 } from "lucide-react"
import { deleteMedia, mediaIdFromCid } from "@/api/mediaApi"
import "@/components/tiptap-node/pdf-node/pdf-node.scss"

export const PdfNodeView = (props: NodeViewProps) => {
  const src = String(props.node.attrs.src ?? "")
  const title = String(props.node.attrs.title ?? "PDF document")

  const handleDelete = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (src.startsWith("http://") || src.startsWith("https://")) {
      const cid = src.split("/").pop() || title
      if (cid) {
        void deleteMedia(mediaIdFromCid(cid)).catch((error) => {
          console.warn("Delete media API failed:", error)
        })
      }
    }

    props.deleteNode()
  }

  const handleOpen = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.open(src, "_blank", "noopener,noreferrer")
  }

  if (!src) {
    return (
      <NodeViewWrapper className="tiptap-pdf-node is-empty">
        <p>Missing PDF source</p>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-pdf-node" data-drag-handle>
      <div className="tiptap-pdf-chip">
        <span className="tiptap-pdf-badge">PDF</span>
        <span className="tiptap-pdf-title" title={title}>
          {title}
        </span>
        <button
          type="button"
          className="tiptap-pdf-open"
          title="Open PDF"
          onClick={handleOpen}
        >
          Open
        </button>
        <button
          type="button"
          className="tiptap-pdf-delete"
          title="Delete"
          onClick={handleDelete}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </NodeViewWrapper>
  )
}

export default PdfNodeView
