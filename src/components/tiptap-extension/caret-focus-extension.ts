import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

/**
 * Marks the active textblock with `has-focus` for caret styling.
 * Uses view.hasFocus() so embedded editors keep the class while typing.
 */
export const CaretFocus = Extension.create({
  name: "caretFocus",

  addOptions() {
    return {
      className: "has-focus",
    }
  },

  addProseMirrorPlugins() {
    const { className } = this.options

    return [
      new Plugin({
        key: new PluginKey("caretFocus"),
        props: {
          decorations: (state) => {
            const { editor } = this

            if (!editor.isEditable) {
              return DecorationSet.empty
            }

            const hasFocus = editor.view.hasFocus() || editor.isFocused
            if (!hasFocus) {
              return DecorationSet.empty
            }

            const { anchor } = state.selection
            const $pos = state.doc.resolve(anchor)

            for (let depth = $pos.depth; depth > 0; depth -= 1) {
              const node = $pos.node(depth)
              if (!node.isTextblock) {
                continue
              }

              const pos = $pos.before(depth)
              return DecorationSet.create(state.doc, [
                Decoration.node(pos, pos + node.nodeSize, { class: className }),
              ])
            }

            return DecorationSet.empty
          },
        },
      }),
    ]
  },
})
