import type { MediaMapperDto, UploadMediaResponse } from "@/types/media"

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

export function normalizeUploadResponse(payload: unknown): UploadMediaResponse {
  const root = asRecord(payload)
  const nested = asRecord(root?.data)

  const cid = String(root?.cid ?? nested?.cid ?? "").trim()
  const url = String(root?.url ?? nested?.url ?? "").trim()

  if (!cid || !url || url.startsWith("blob:")) {
    throw new Error("Upload response missing backend url")
  }

  return { cid, url }
}

export function normalizeMediaResponse(payload: unknown): MediaMapperDto {
  const root = asRecord(payload)
  const nested = asRecord(root?.data)
  const source = nested ?? root ?? {}

  return {
    cid: source.cid != null ? String(source.cid) : undefined,
    mediaId: source.mediaId != null ? String(source.mediaId) : undefined,
    extension: source.extension != null ? String(source.extension) : undefined,
    title: source.title != null ? String(source.title) : undefined,
    url: source.url != null ? String(source.url) : undefined,
    fileName: source.fileName != null ? String(source.fileName) : undefined,
    fileSize: typeof source.fileSize === "number" ? source.fileSize : undefined,
    pinned: typeof source.pinned === "boolean" ? source.pinned : undefined,
    active: typeof source.active === "boolean" ? source.active : undefined,
    createdOn:
      source.createdOn != null ? String(source.createdOn) : undefined,
  }
}
