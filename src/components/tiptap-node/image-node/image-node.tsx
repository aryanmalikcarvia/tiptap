"use client"

import type { MouseEvent } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Trash2 } from "lucide-react"
import { deleteMedia } from "@/api/mediaApi"
import { mediaIdFromCid, mediaIdFromSrc } from "@/lib/mediaIds"
import "@/components/tiptap-node/image-node/image-node.scss"

export function ImageNodeView(props: NodeViewProps) {
  const src = String(props.node.attrs.src ?? "")
  const cid = String(props.node.attrs.cid ?? "")
  const alt = String(props.node.attrs.alt ?? "")
  const title = String(props.node.attrs.title ?? "")
  const editable = props.editor.isEditable

  const handleDelete = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const mediaId = (cid ? mediaIdFromCid(cid) : null) || mediaIdFromSrc(src)
    if (mediaId) {
      void deleteMedia(mediaId).catch((error) => {
        console.warn("Delete media API failed:", error)
      })
    }

    props.deleteNode()
  }

  if (!src) {
    return (
      <NodeViewWrapper className="tiptap-image-node is-empty">
        <p>Missing image source</p>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-image-node" data-drag-handle>
      <div className="tiptap-image-frame">
        <img src={src} alt={alt} title={title || alt} />
        {editable ? (
          <button
            type="button"
            className="tiptap-media-delete"
            title="Delete"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
    </NodeViewWrapper>
  )
}

export default ImageNodeView
