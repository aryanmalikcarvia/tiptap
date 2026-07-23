import { mediaApiClient } from "@/axios/axiosConfig"
import { mediaIdFromCid } from "@/lib/mediaIds"
import {
  normalizeMediaResponse,
  normalizeUploadResponse,
} from "@/lib/normalizeMedia"
import type { MediaMapperDto, UploadMediaResponse } from "@/types/media"

/** POST /media/upload */
export async function uploadMedia(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData()
  formData.append("file", file, file.name)

  const response = await mediaApiClient.post<unknown>("/media/upload", formData)
  return normalizeUploadResponse(response.data)
}

/** GET /users/projects/medias/{mediaId} */
export async function getMedia(mediaId: string): Promise<MediaMapperDto> {
  const id = mediaIdFromCid(mediaId)
  const response = await mediaApiClient.get<unknown>(
    `/users/projects/medias/${encodeURIComponent(id)}`
  )
  return normalizeMediaResponse(response.data)
}

/** DELETE /users/projects/medias/{mediaId} */
export async function deleteMedia(mediaId: string): Promise<void> {
  const id = mediaIdFromCid(mediaId)
  await mediaApiClient.delete(
    `/users/projects/medias/${encodeURIComponent(id)}`
  )
}
