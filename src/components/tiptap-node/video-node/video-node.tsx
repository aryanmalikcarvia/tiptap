"use client"

import type { MouseEvent } from "react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import { Trash2 } from "lucide-react"
import { deleteMedia, mediaIdFromCid } from "@/api/mediaApi"
import "@/components/tiptap-node/video-node/video-node.scss"

export const VideoNodeView = (props: NodeViewProps) => {
  const src = String(props.node.attrs.src ?? "")

  const handleDelete = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (src.startsWith("http://") || src.startsWith("https://")) {
      const cid = src.split("/").pop() || ""
      if (cid) {
        void deleteMedia(mediaIdFromCid(cid)).catch((error) => {
          console.warn("Delete media API failed:", error)
        })
      }
    }

    props.deleteNode()
  }

  if (!src) {
    return (
      <NodeViewWrapper className="tiptap-video-node is-empty">
        <p>Missing video source</p>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="tiptap-video-node" data-drag-handle>
      <div className="tiptap-video-frame">
        <video src={src} controls playsInline className="tiptap-video-player" />
        <button
          type="button"
          className="tiptap-media-delete"
          title="Delete"
          onClick={handleDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </NodeViewWrapper>
  )
}

export default VideoNodeView
