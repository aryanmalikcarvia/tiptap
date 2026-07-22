import { getApiErrorMessage } from "@/lib/apiError"
import { uploadMedia } from "@/api/mediaApi"
import type { UploadMediaResponse } from "@/types/media"

export const MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export type MediaKind = "image" | "video" | "pdf" | "other"

export type UploadedMediaItem = {
  cid: string
  url: string
  kind: MediaKind
  name: string
}

export function getMediaKind(fileOrCid: File | string): MediaKind {
  const name =
    typeof fileOrCid === "string" ? fileOrCid : fileOrCid.name || ""
  const mime = typeof fileOrCid === "string" ? "" : fileOrCid.type || ""

  if (
    mime.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
  ) {
    return "image"
  }
  if (
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v|avi)$/i.test(name)
  ) {
    return "video"
  }
  if (mime === "application/pdf" || /\.pdf$/i.test(name)) {
    return "pdf"
  }
  return "other"
}

/** POST upload — always returns backend url (no blob fallback). */
export async function uploadAndResolveMedia(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<UploadedMediaItem> {
  if (!file) {
    throw new Error("No file provided")
  }

  if (file.size > MAX_MEDIA_FILE_SIZE) {
    throw new Error(
      `File size exceeds maximum allowed (${MAX_MEDIA_FILE_SIZE / (1024 * 1024)}MB)`
    )
  }

  if (abortSignal?.aborted) {
    throw new Error("Upload cancelled")
  }

  onProgress?.({ progress: 20 })

  let uploaded: UploadMediaResponse
  try {
    uploaded = await uploadMedia(file)
  } catch (error) {
    throw new Error(getApiErrorMessage(error))
  }

  if (abortSignal?.aborted) {
    throw new Error("Upload cancelled")
  }

  if (!uploaded.url || uploaded.url.startsWith("blob:")) {
    throw new Error("Upload did not return a backend media url")
  }

  onProgress?.({ progress: 100 })

  return {
    cid: uploaded.cid,
    url: uploaded.url,
    kind: getMediaKind(file),
    name: uploaded.cid,
  }
}

/** TipTap image upload / paste — backend url only */
export async function handleMediaImageUpload(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  const item = await uploadAndResolveMedia(file, onProgress, abortSignal)
  return item.url
}
