import { apiClient } from "@/axios/axiosConfig";
import axios from "axios";

export type UploadMediaResponse = {
  cid: string;
  url: string;
};

export type MediaResponse = {
  cid?: string;
  url?: string;
  mediaUrl?: string;
  [key: string]: unknown;
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const detail =
      typeof data === "string"
        ? data
        : data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : error.message;

    return status ? `API ${status}: ${detail}` : detail;
  }

  if (error instanceof Error) return error.message;
  return "Upload failed. Try again.";
}

/** POST /media/upload  */
export async function uploadMedia(file: File): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const { data } = await apiClient.post<UploadMediaResponse>(
    "/media/upload",
    formData
  );

  return data;
}

// get media 
export async function getMedia(mediaId: string): Promise<MediaResponse> {
  const { data } = await apiClient.get<MediaResponse>(
    `/users/projects/medias/${mediaId}`
  );

  return data;
}

/** DELETE  */
export async function deleteMedia(mediaId: string): Promise<void> {
  await apiClient.delete(`/users/projects/medias/${mediaId}`);
}

export function mediaIdFromCid(cid: string): string {
  return cid.replace(/\.[^/.]+$/, "");
}

export function resolveMediaUrl(
  media: MediaResponse,
  fallbackUrl: string
): string {
  if (typeof media.url === "string" && media.url) return media.url;
  if (typeof media.mediaUrl === "string" && media.mediaUrl) return media.mediaUrl;
  return fallbackUrl;
}
