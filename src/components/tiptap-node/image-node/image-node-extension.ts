import { Image } from "@tiptap/extension-image"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageNodeView } from "@/components/tiptap-node/image-node/image-node"

/** Image with cid attr + delete → DELETE /users/projects/medias/{id} */
export const MediaImage = Image.extend({
  name: "image",
  inline: false,
  group: "block",
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      cid: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cid"),
        renderHTML: (attributes) => {
          if (!attributes.cid) return {}
          return { "data-cid": attributes.cid }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },
})

export default MediaImage
