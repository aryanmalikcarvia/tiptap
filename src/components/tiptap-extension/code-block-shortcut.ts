// //  codeblock shortcut {manually created }


import { Extension } from "@tiptap/core"

export const CodeBlockShortcut = Extension.create({
  name: "codeBlockShortcut",

  addKeyboardShortcuts() {
    return {
      "`": ({ editor }) => {
        const { $from } = editor.state.selection

        const textBefore = $from.parent.textBetween(
          0,
          $from.parentOffset
        )

        const currentLine = textBefore.split("\n").pop() ?? ""

        if (editor.isActive("codeBlock")) {
    if (!currentLine.endsWith("``")) {
      return false
    }

    return editor
      .chain()
      .focus()
      .deleteRange({
        from: $from.pos - 2,
        to: $from.pos,
      })
      .exitCode()
      .run()
  }

  // NORMAL EDITOR ME
  if (currentLine !== "``") {
    return false
  }


        return editor
          .chain()
          .focus()
          .deleteRange({
            from: $from.start(),
            to: $from.pos,
          })
          .setCodeBlock()
          .run()
      },

      "Shift-Enter": ({ editor }) => {
        if (!editor.isActive("codeBlock")) {
          return false
        }

        return editor
          .chain()
          .focus()
          .insertContent("\n")
          .run()
      },

      Enter: ({ editor }) => {
        if (!editor.isActive("codeBlock")) {
          return false
        }

        const code =
          editor.state.selection.$from.parent.textContent

        console.log("CODE TO SEND:", code)

        // Future API call yahan hogi
        // await sendCode(code)

        return true
      },
    }
  },
})





// import { Extension } from "@tiptap/core"

// export const CodeBlockShortcut = Extension.create({
//   name: "codeBlockShortcut",

//   addKeyboardShortcuts() {
//     return {
//       "`": ({ editor }) => {
//         if (editor.isActive("codeBlock")) {
//           return false
//         }

//         const { $from } = editor.state.selection

//         const textBefore = $from.parent.textBetween(
//           0,
//           $from.parentOffset
//         )

//         if (textBefore !== "``") {
//           return false
//         }

//         return editor
//           .chain()
//           .focus()
//           .deleteRange({
//             from: $from.start(),
//             to: $from.pos,
//           })
//           .setCodeBlock()
//           .run()
//       },
//     }
//   },
// })

