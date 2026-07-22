import { apiClient } from "@/axios/axiosConfig";
import axios from "axios";

export type UploadMediaResponse = {
  cid: string;
  url: string;
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const rawDetail =
      typeof data === "string"
        ? data
        : data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : error.message;

    const detail = rawDetail.trim();
    const looksLikeHtml =
      detail.startsWith("<!DOCTYPE") ||
      detail.startsWith("<html") ||
      detail.includes("<title>") ||
      detail.includes("<body>");

    if (status === 502 || status === 503 || looksLikeHtml) {
      return "Server temporarily unavailable. Please try again.";
    }

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

/** DELETE  */
export async function deleteMedia(mediaId: string): Promise<void> {
  await apiClient.delete(`/users/projects/medias/${mediaId}`);
}

export function mediaIdFromCid(cid: string): string {
  return cid.replace(/\.[^/.]+$/, "");
}
