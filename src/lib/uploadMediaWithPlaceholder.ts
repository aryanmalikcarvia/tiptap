import type { Editor } from "@tiptap/react"
import {
  getMediaKind,
  uploadAndResolveMedia,
  type MediaKind,
  type UploadedMediaItem,
} from "@/lib/mediaUpload"

function mediaNodeForItem(file: File, item: UploadedMediaItem) {
  const kind = getMediaKind(file)
  if (kind === "video") {
    return { type: "video", attrs: { src: item.url, cid: item.cid } }
  }
  if (kind === "pdf") {
    return {
      type: "pdf",
      attrs: { src: item.url, cid: item.cid, title: file.name },
    }
  }
  return {
    type: "image",
    attrs: { src: item.url, cid: item.cid, alt: file.name },
  }
}

function findPlaceholderPos(editor: Editor, id: string): number | null {
  let found: number | null = null
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "mediaPlaceholder" && node.attrs.id === id) {
      found = pos
      return false
    }
    return true
  })
  return found
}

function removePlaceholder(editor: Editor, id: string) {
  const pos = findPlaceholderPos(editor, id)
  if (pos == null) return
  const node = editor.state.doc.nodeAt(pos)
  if (!node) return
  editor
    .chain()
    .command(({ tr, dispatch }) => {
      if (dispatch) tr.delete(pos, pos + node.nodeSize)
      return true
    })
    .run()
}

function replacePlaceholder(
  editor: Editor,
  id: string,
  file: File,
  item: UploadedMediaItem
) {
  const pos = findPlaceholderPos(editor, id)
  if (pos == null) return
  const node = editor.state.doc.nodeAt(pos)
  if (!node) return

  editor
    .chain()
    .command(({ tr, dispatch }) => {
      if (!dispatch) return true
      tr.replaceWith(
        pos,
        pos + node.nodeSize,
        editor.schema.nodeFromJSON(mediaNodeForItem(file, item))
      )
      return true
    })
    .run()
}

async function uploadIntoPlaceholder(
  editor: Editor,
  file: File,
  id: string
): Promise<void> {
  try {
    const item = await uploadAndResolveMedia(file)
    if (editor.isDestroyed) return
    replacePlaceholder(editor, id, file, item)
  } catch (error) {
    if (!editor.isDestroyed) removePlaceholder(editor, id)
    throw error
  }
}

/**
 * Paste / drop: insert in-doc placeholders at upload point, then swap for media.
 */
export function uploadMediaFilesWithPlaceholders(
  editor: Editor,
  files: File[],
  atPos: number
): void {
  let pos = Math.max(0, Math.min(atPos, editor.state.doc.content.size))
  const jobs: { file: File; id: string }[] = []

  for (const file of files) {
    const kind: MediaKind = getMediaKind(file)
    const id = crypto.randomUUID()

    editor
      .chain()
      .insertContentAt(pos, {
        type: "mediaPlaceholder",
        attrs: { id, kind },
      })
      .run()

    const placed = findPlaceholderPos(editor, id)
    if (placed != null) {
      const node = editor.state.doc.nodeAt(placed)
      pos = placed + (node?.nodeSize ?? 1)
    }

    jobs.push({ file, id })
  }

  for (const { file, id } of jobs) {
    void uploadIntoPlaceholder(editor, file, id).catch((error) => {
      console.error("Upload failed:", error)
    })
  }
}
