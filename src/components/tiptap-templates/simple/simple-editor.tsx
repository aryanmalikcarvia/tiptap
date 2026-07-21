"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import FileHandler from "@tiptap/extension-file-handler"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection, Placeholder } from "@tiptap/extensions"


import { CodeBlockShortcut } from "@/components/tiptap-extension/code-block-shortcut"
import { MentionExtension } from "@/components/tiptap-extension/mention-extension"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { VideoNode } from "@/components/tiptap-node/video-node/video-node-extension"
import { PdfNode } from "@/components/tiptap-node/pdf-node/pdf-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/video-node/video-node.scss"
import "@/components/tiptap-node/pdf-node/pdf-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Lib ---
import { handleMediaImageUpload, MAX_MEDIA_FILE_SIZE } from "@/lib/mediaUpload"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import { content as defaultContent } from "@/components/tiptap-templates/simple/data/content"
import type { Content, Editor } from "@tiptap/react"

const EMPTY_DOC: Content = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

export type SimpleEditorProps = {
  initialContent?: Content
  onEditorReady?: (editor: Editor) => void
  embedded?: boolean
  editable?: boolean
  compact?: boolean
  /** Enter → submit; Shift+Enter → new line */
  submitOnEnter?: boolean
  onEnterSubmit?: () => void
  /** editable hone par cursor focus */
  autoFocus?: boolean
  placeholder?: string
}

const insertUploadedFile = (
  editor: Editor,
  file: File,
  src: string,
  pos: number
) => {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

  let node: { type: string; attrs: Record<string, unknown> }

  if (file.type.startsWith("video/")) {
    node = { type: "video", attrs: { src } }
  } else if (isPdf) {
    node = { type: "pdf", attrs: { src, title: file.name } }
  } else {
    node = { type: "image", attrs: { src } }
  }

  editor.chain().focus().insertContentAt(pos, node).run()
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({
  initialContent,
  onEditorReady,
  embedded = false,
  editable = true,
  compact = false,
  submitOnEnter = false,
  onEnterSubmit,
  autoFocus = false,
  placeholder,
}: SimpleEditorProps = {}) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onEditorReady)
  const editorInstanceRef = useRef<Editor | null>(null)
  const submitOnEnterRef = useRef(submitOnEnter)
  const onEnterSubmitRef = useRef(onEnterSubmit)
  const editableRef = useRef(editable)
  onReadyRef.current = onEditorReady
  submitOnEnterRef.current = submitOnEnter
  onEnterSubmitRef.current = onEnterSubmit
  editableRef.current = editable

  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = "light"
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleKeyDown: (_view, event) => {
        if (!submitOnEnterRef.current) return false
        const ed = editorInstanceRef.current
        if (!ed) return false

        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault()
          ed.chain().focus().setHardBreak().run()
          return true
        }

        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault()
          onEnterSubmitRef.current?.()
          return true
        }

        return false
      },
      handleDOMEvents: {
        click: (view) => {
          if (!editableRef.current) return false
          const ed = editorInstanceRef.current
          if (!ed || ed.isDestroyed) return false

          requestAnimationFrame(() => {
            if (!view.dom.isConnected) return
            if (ed.isEmpty) {
              ed.commands.focus("start")
            } else if (!view.hasFocus()) {
              view.focus()
            }
            view.dom.classList.add("ProseMirror-focused")
          })
          return false
        },
        focus: (view) => {
          view.dom.classList.add("ProseMirror-focused")
          const ed = editorInstanceRef.current
          if (ed && !ed.isDestroyed && ed.isEmpty) {
            requestAnimationFrame(() => ed.commands.focus("start"))
          }
          return false
        },
        blur: (view) => {
          view.dom.classList.remove("ProseMirror-focused")
          return false
        },
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      CodeBlockShortcut,
      MentionExtension,
      HorizontalRule,

      
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image.configure({
        allowBase64: true,
      }),
      VideoNode,
      PdfNode,
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp",
          "image/jpg",
          "video/mp4",
          "video/webm",
          "video/quicktime",
          "application/pdf",
        ],
        onPaste: (editor, files) => {
          // upload async hai — pehle cursor position save
          const cursorPos = editor.state.selection.from
          files.forEach((file, index) => {
            void handleMediaImageUpload(file).then((src) => {
              insertUploadedFile(editor, file, src, cursorPos + index)
            })
          })
        },
        onDrop: (editor, files, pos) => {
          files.forEach((file, index) => {
            void handleMediaImageUpload(file).then((src) => {
              insertUploadedFile(editor, file, src, pos + index)
            })
          })
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      Placeholder.configure({
        placeholder: placeholder ?? (compact ? "Write here…" : "Write something…"),
        emptyNodeClass: "is-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      ImageUploadNode.configure({
        accept: "image/*,video/*,application/pdf,.pdf,.mp4,.webm,.mov",
        maxSize: MAX_MEDIA_FILE_SIZE,
        limit: 3,
        upload: handleMediaImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content:
      initialContent !== undefined
        ? initialContent
        : defaultContent || EMPTY_DOC,
    onCreate: ({ editor: ed }) => {
      editorInstanceRef.current = ed
      onReadyRef.current?.(ed)
    },
  })

  useEffect(() => {
    if (!editor) return
    editorInstanceRef.current = editor
    onReadyRef.current?.(editor)
  }, [editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  useEffect(() => {
    if (editor && editable && autoFocus) {
      queueMicrotask(() => editor.commands.focus("start"))
    }
  }, [editor, editable, autoFocus])

  useEffect(() => {
    if (!editor || !editable) return

    const dom = editor.view.dom
    const syncEmptyCaret = () => {
      dom.classList.add("ProseMirror-focused")
      if (editor.isEmpty) {
        editor.commands.focus("start")
      }
    }

    dom.addEventListener("focus", syncEmptyCaret)
    return () => dom.removeEventListener("focus", syncEmptyCaret)
  }, [editor, editable])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div
      className={`simple-editor-wrapper${embedded ? " is-embedded" : ""}${compact ? " is-compact" : ""}${editable ? " is-editable" : ""}`}
    >
      <EditorContext.Provider value={{ editor }}>
        {/* Editing enable / disable: toolbar sirf editable=true par dikhe */}
        {editable && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
