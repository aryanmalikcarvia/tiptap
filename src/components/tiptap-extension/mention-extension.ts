import Mention from "@tiptap/extension-mention"
import { ReactRenderer } from "@tiptap/react"
import tippy, { type Instance } from "tippy.js"

import {
  MentionList,
  type MentionListRef,
  type MentionUser,
} from "./mention-list"



const users: MentionUser[] = [
  {
    id: "1",
    label: "Shashwat",
  },
  {
    id: "2",
    label: "Abhay",
  },
  {
    id: "3",
    label: "Abhishek",
  },
  {
    id: "4",
    label: "Puneet ",
  },
  {
    id: "5",
    label: "Aryan ",
  },
  {
    id: "6",
    label: "Aarambh ",
  },
  {
    id: "7",
    label: "Lakshay ",
  },
  
]

export const MentionExtension = Mention.configure({
  HTMLAttributes: {
    class: "mention",
  },

  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`
  },

  suggestion: {
    char: "@",

    items: ({ query }) => {
      return users
        .filter((user) =>
          user.label.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 7)
    },

    render: () => {
      let component: ReactRenderer<MentionListRef>
      let popup: Instance[]

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          })
        },

        onUpdate(props) {
          component.updateProps(props)

          if (!props.clientRect) {
            return
          }

          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          })
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            popup[0]?.hide()

            return true
          }

          return (
  component.ref?.onKeyDown({
    event: props.event,
  }) ?? false
)
        },

        onExit() {
          popup[0]?.destroy()
          component.destroy()
        },
      }
    },
  },
})