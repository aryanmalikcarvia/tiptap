import type { MediaMapperDto } from "@/types/media"

/** Strip file extension from cid for media path ids. */
export function mediaIdFromCid(cid: string): string {
  const cleaned = cid.trim().split("/").pop() || cid.trim()
  return cleaned.replace(/\.[^/.]+$/, "")
}

/** Resolve media id from a full url or raw cid. */
export function mediaIdFromSrc(src: string): string | null {
  if (!src) return null

  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const name = new URL(src).pathname.split("/").filter(Boolean).pop()
      return name ? mediaIdFromCid(name) : null
    }
  } catch {
    /* ignore invalid url */
  }

  return mediaIdFromCid(src)
}

export function resolveMediaUrl(
  media: MediaMapperDto | null | undefined,
  fallbackUrl?: string
): string {
  const url = String(media?.url ?? fallbackUrl ?? "").trim()
  if (!url || url.startsWith("blob:")) {
    throw new Error("Media url missing")
  }
  return url
}
