import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react"
import { MediaPlaceholderView } from "@/components/tiptap-node/media-placeholder-node/media-placeholder-node"

export type MediaPlaceholderKind = "image" | "video" | "pdf" | "other"

export const MediaPlaceholderNode = Node.create({
  name: "mediaPlaceholder",
  group: "block",
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      kind: {
        default: "other" as MediaPlaceholderKind,
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="media-placeholder"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "media-placeholder" }, HTMLAttributes),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaPlaceholderView)
  },
})

export default MediaPlaceholderNode
