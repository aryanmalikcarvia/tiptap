import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react"
import { VideoNodeView } from "@/components/tiptap-node/video-node/video-node"

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },
 
  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
      {
        tag: "video[src]",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "video" }, HTMLAttributes),
      ["video", { src: HTMLAttributes.src, controls: "true" }],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView)
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    }
  },
})

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType
    }
  }
}

export default VideoNode
