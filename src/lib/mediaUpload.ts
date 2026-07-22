import {
  getApiErrorMessage,
  uploadMedia,
  type UploadMediaResponse,
} from "@/api/mediaApi"

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

/**
 * POST upload. Fail pe local object URL — editor paste/upload tootna nahi chahiye.
 */
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

  onProgress?.({ progress: 100 })

  return {
    cid: uploaded.cid,
    url: uploaded.url,
    kind: getMediaKind(file),
    name: uploaded.cid,
  }
}

/** TipTap image upload / paste — API pehle, fail pe local blob */
export async function handleMediaImageUpload(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  try {
    const item = await uploadAndResolveMedia(file, onProgress, abortSignal)
    return item.url
  } catch (error) {
    console.warn(
      "Media API upload failed, using local preview:",
      getApiErrorMessage(error)
    )
    onProgress?.({ progress: 100 })
    return URL.createObjectURL(file)
  }
}
