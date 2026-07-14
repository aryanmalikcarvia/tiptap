import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react"
import { PdfNodeView } from "@/components/tiptap-node/pdf-node/pdf-node"

export const PdfNode = Node.create({
  name: "pdf",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: "PDF document",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pdf"]',
      },
      {
        tag: 'a[data-type="pdf"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "pdf" }, HTMLAttributes),
      [
        "a",
        {
          href: HTMLAttributes.src,
          "data-type": "pdf",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        HTMLAttributes.title || "PDF document",
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView)
  },

  addCommands() {
    return {
      setPdf:
        (options: { src: string; title?: string }) =>
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
    pdf: {
      setPdf: (options: { src: string; title?: string }) => ReturnType
    }
  }
}

export default PdfNode
