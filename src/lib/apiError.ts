import axios from "axios"

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return error.message || "Network Error"

    const status = error.response.status
    const data = error.response.data
    const detail =
      typeof data === "string"
        ? data
        : data && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : error.message

    return status ? `API ${status}: ${detail}` : detail
  }

  if (error instanceof Error) return error.message
  return "Request failed. Try again."
}
