"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import FileHandler from "@tiptap/extension-file-handler"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection, Placeholder } from "@tiptap/extensions"

import { CaretFocus } from "@/components/tiptap-extension/caret-focus-extension"
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
import { MediaImage } from "@/components/tiptap-node/image-node/image-node-extension"
import { VideoNode } from "@/components/tiptap-node/video-node/video-node-extension"
import { PdfNode } from "@/components/tiptap-node/pdf-node/pdf-node-extension"
import { MediaPlaceholderNode } from "@/components/tiptap-node/media-placeholder-node/media-placeholder-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/video-node/video-node.scss"
import "@/components/tiptap-node/pdf-node/pdf-node.scss"
import "@/components/tiptap-node/media-placeholder-node/media-placeholder-node.scss"
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
import {
  MAX_MEDIA_FILE_SIZE,
  uploadAndResolveMedia,
} from "@/lib/mediaUpload"
import { uploadMediaFilesWithPlaceholders } from "@/lib/uploadMediaWithPlaceholder"
import { resolveMediaInEditor } from "@/lib/resolveMediaInEditor"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import type { Content, Editor } from "@tiptap/react"
import { TextSelection } from "@tiptap/pm/state"

function placeCaretAtPos(editor: Editor, pos: number) {
  try {
    const max = editor.state.doc.content.size
    const safe = Math.max(0, Math.min(pos, max))
    const selection = TextSelection.near(editor.state.doc.resolve(safe))
    editor.view.dispatch(editor.state.tr.setSelection(selection))
    editor.view.dom.focus({ preventScroll: true })
    editor.view.dom.classList.add("ProseMirror-focused")
  } catch {
    editor.commands.focus(undefined, { scrollIntoView: false })
  }
}

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
  /** editable hone par cursor focus */
  autoFocus?: boolean
  /** Edit enable ke baad caret isi doc position pe (click jahan tha) */
  initialCaretPos?: number | null
  placeholder?: string
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
  autoFocus = false,
  initialCaretPos = null,
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
  const editableRef = useRef(editable)
  const caretAppliedRef = useRef(false)
  onReadyRef.current = onEditorReady
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
      handleDOMEvents: {
        click: (view) => {
          if (!editableRef.current) return false
          const ed = editorInstanceRef.current
          if (!ed || ed.isDestroyed) return false

          // Keep focus without scrolling page to selection
          requestAnimationFrame(() => {
            if (!view.dom.isConnected) return
            view.dom.focus({ preventScroll: true })
            view.dom.classList.add("ProseMirror-focused")
          })
          return false
        },
        focus: (view) => {
          view.dom.classList.add("ProseMirror-focused")
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
        trailingNode: {
          notAfter: [
            "paragraph",
            "heading",
            "blockquote",
            "codeBlock",
            "bulletList",
            "orderedList",
            "taskList",
            "horizontalRule",
          ],
        },
      }),
      CodeBlockShortcut,
      MentionExtension,
      HorizontalRule,

      
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      MediaImage.configure({
        allowBase64: true,
      }),
      VideoNode,
      PdfNode,
      MediaPlaceholderNode,
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
          uploadMediaFilesWithPlaceholders(
            editor,
            files,
            editor.state.selection.from
          )
        },
        onDrop: (editor, files, pos) => {
          uploadMediaFilesWithPlaceholders(editor, files, pos)
        },
      }),
      
      Typography,
      Superscript,
      Subscript,
      Selection,
      CaretFocus,
      Placeholder.configure({
        placeholder:
          placeholder ??
          (compact ? "Write here…" : embedded ? "" : "Write something…"),
        emptyNodeClass: "is-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
        includeChildren: true,
      }),
      ImageUploadNode.configure({
        accept: "image/*,video/*,application/pdf,.pdf,.mp4,.webm,.mov",
        maxSize: MAX_MEDIA_FILE_SIZE,
        limit: 3,
        // Local spinner in ImageUploadNode — no global overlay (avoids double loader)
        upload: async (file, onProgress, abortSignal) => {
          const item = await uploadAndResolveMedia(
            file,
            onProgress,
            abortSignal
          )
          return item.url
        },
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: initialContent !== undefined ? initialContent : EMPTY_DOC,
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
    if (!editor || initialContent === undefined) return

    // Read-only: parent content sync. Edit mode: content mat overwrite.
    if (!editable) {
      editor.commands.setContent(initialContent)
    }

    void resolveMediaInEditor(editor)
  }, [editor, initialContent, editable])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editor, editable])

  // Edit on → caret click position pe (warna autoFocus / start)
  useEffect(() => {
    if (!editor) return

    if (!editable) {
      caretAppliedRef.current = false
      return
    }

    if (caretAppliedRef.current) return
    caretAppliedRef.current = true

    const apply = () => {
      if (editor.isDestroyed || !editor.isEditable) return false
      if (typeof initialCaretPos === "number") {
        placeCaretAtPos(editor, initialCaretPos)
      } else if (autoFocus) {
        editor.commands.focus(undefined, { scrollIntoView: false })
      }
      return true
    }

    queueMicrotask(() => {
      if (apply()) return
      requestAnimationFrame(() => {
        apply()
      })
    })
  }, [editor, editable, initialCaretPos, autoFocus])

  useEffect(() => {
    if (!editor || !editable) return

    const dom = editor.view.dom
    const syncFocused = () => {
      dom.classList.toggle("ProseMirror-focused", editor.view.hasFocus())
    }

    dom.addEventListener("focus", syncFocused)
    dom.addEventListener("blur", syncFocused)
    // Do NOT sync on selectionUpdate — briefly clears focus class and reflows layout
    editor.on("focus", syncFocused)
    editor.on("blur", syncFocused)

    return () => {
      dom.removeEventListener("focus", syncFocused)
      dom.removeEventListener("blur", syncFocused)
      editor.off("focus", syncFocused)
      editor.off("blur", syncFocused)
    }
  }, [editor, editable])

  const rect = useCursorVisibility({
    editor: embedded ? null : editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div
      className={`simple-editor-wrapper relative${embedded ? " is-embedded" : ""}${compact ? " is-compact" : ""}${editable ? " is-editable" : ""}`}
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

        <div className="simple-editor-scroll relative">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </EditorContext.Provider>
    </div>
  )
}
