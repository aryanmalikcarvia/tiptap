import { mediaApiClient } from "@/axios/axiosConfig"
import type { UploadMediaResponse } from "@/types/media"

function normalizeUploadResponse(payload: unknown): UploadMediaResponse {
  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null
  const nested =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null

  const cid = String(root?.cid ?? nested?.cid ?? "").trim()
  const url = String(root?.url ?? nested?.url ?? "").trim()

  if (!cid || !url || url.startsWith("blob:")) {
    throw new Error("Upload response missing backend url")
  }

  return { cid, url }
}

export async function uploadMedia(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData()
  formData.append("file", file, file.name)

  const response = await mediaApiClient.post<unknown>("/media/upload", formData)
  return normalizeUploadResponse(response.data)
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await mediaApiClient.delete(`/users/projects/medias/${mediaId}`)
}

export function mediaIdFromCid(cid: string): string {
  return cid.replace(/\.[^/.]+$/, "")
}
