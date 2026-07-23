"use client"

import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Spinner } from "@/components/ui/spinner"
import type { MediaPlaceholderKind } from "@/components/tiptap-node/media-placeholder-node/media-placeholder-node-extension"
import "@/components/tiptap-node/media-placeholder-node/media-placeholder-node.scss"

function labelForKind(kind: MediaPlaceholderKind | string): string {
  if (kind === "image") return "Uploading image…"
  if (kind === "video") return "Uploading video…"
  if (kind === "pdf") return "Uploading PDF…"
  return "Uploading media…"
}

export function MediaPlaceholderView(props: NodeViewProps) {
  const kind = (props.node.attrs.kind as MediaPlaceholderKind) || "other"

  return (
    <NodeViewWrapper
      className="tiptap-media-placeholder"
      data-drag-handle
      contentEditable={false}
    >
      <div className="tiptap-media-placeholder-inner" role="status" aria-live="polite">
        <Spinner size="sm" />
        <span className="tiptap-media-placeholder-label">
          {labelForKind(kind)}
        </span>
      </div>
    </NodeViewWrapper>
  )
}
