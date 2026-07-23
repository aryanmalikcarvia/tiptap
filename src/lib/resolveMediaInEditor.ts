import type { Editor } from "@tiptap/react"
import { getMedia } from "@/api/mediaApi"
import {
  mediaIdFromCid,
  mediaIdFromSrc,
  resolveMediaUrl,
} from "@/lib/mediaIds"
import { dedupeRequest } from "@/lib/requestDedupe"

const MEDIA_NODE_TYPES = new Set(["image", "video", "pdf"])

/** Skip repeat resolve for the same editor + media set. */
const resolvedFingerprints = new WeakMap<Editor, string>()
const resolveInflight = new WeakMap<Editor, Promise<void>>()

function mediaFingerprint(editor: Editor): string {
  const ids: string[] = []
  editor.state.doc.descendants((node) => {
    if (!MEDIA_NODE_TYPES.has(node.type.name)) return true
    const src = String(node.attrs.src ?? "")
    const cid = String(node.attrs.cid ?? "")
    const mediaId =
      (cid ? mediaIdFromCid(cid) : null) || mediaIdFromSrc(src)
    if (mediaId) ids.push(mediaId)
    return true
  })
  return ids.sort().join("|")
}

/**
 * On task/comment open: GET media-by-id for each media node and refresh src.
 * On failure, keep the saved src.
 */
export async function resolveMediaInEditor(editor: Editor): Promise<void> {
  if (!editor || editor.isDestroyed) return

  const fingerprint = mediaFingerprint(editor)
  if (!fingerprint) return
  if (resolvedFingerprints.get(editor) === fingerprint) return

  const pending = resolveInflight.get(editor)
  if (pending) return pending

  const run = (async () => {
    const targets: { pos: number; mediaId: string; fallbackUrl: string }[] =
      []

    editor.state.doc.descendants((node, pos) => {
      if (!MEDIA_NODE_TYPES.has(node.type.name)) return true

      const src = String(node.attrs.src ?? "")
      const cid = String(node.attrs.cid ?? "")
      const mediaId =
        (cid ? mediaIdFromCid(cid) : null) || mediaIdFromSrc(src)

      if (!mediaId) return true

      targets.push({ pos, mediaId, fallbackUrl: src })
      return true
    })

    if (targets.length === 0) return

    const uniqueIds = [...new Set(targets.map((t) => t.mediaId))]
    const resolved = new Map<string, { url: string; cid: string }>()

    await Promise.all(
      uniqueIds.map(async (mediaId) => {
        try {
          const media = await dedupeRequest(`media:${mediaId}`, () =>
            getMedia(mediaId)
          )
          const fallback =
            targets.find((t) => t.mediaId === mediaId)?.fallbackUrl ?? ""
          resolved.set(mediaId, {
            url: resolveMediaUrl(media, fallback),
            cid: media.cid || mediaId,
          })
        } catch (error) {
          console.warn(
            `GET media ${mediaId} failed, keeping saved src:`,
            error
          )
        }
      })
    )

    if (editor.isDestroyed) return

    const sorted = [...targets].sort((a, b) => b.pos - a.pos)
    for (const target of sorted) {
      const next = resolved.get(target.mediaId)
      if (!next) continue

      const node = editor.state.doc.nodeAt(target.pos)
      if (!node || !MEDIA_NODE_TYPES.has(node.type.name)) continue

      if (
        node.attrs.src === next.url &&
        String(node.attrs.cid ?? "") === String(next.cid)
      ) {
        continue
      }

      editor
        .chain()
        .command(({ tr, dispatch }) => {
          if (!dispatch) return true
          tr.setNodeMarkup(target.pos, undefined, {
            ...node.attrs,
            src: next.url,
            cid: next.cid,
          })
          return true
        })
        .run()
    }

    resolvedFingerprints.set(editor, mediaFingerprint(editor))
  })().finally(() => {
    resolveInflight.delete(editor)
  })

  resolveInflight.set(editor, run)
  return run
}
