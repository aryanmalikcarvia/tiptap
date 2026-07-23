import axios from "axios"

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function messageFromStatus(status: number): string {
  if (status === 401 || status === 403) return "Not authorized. Please try again."
  if (status === 404) return "Not found."
  if (status === 503) return "Server temporarily unavailable. Please try again."
  if (status >= 500) return "Server error. Please try again."
  if (status >= 400) return "Request failed. Please try again."
  return "Request failed. Try again."
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return error.message || "Network Error"

    const status = error.response.status
    const data = error.response.data

    let detail = ""
    if (typeof data === "string") {
      detail = looksLikeHtml(data) ? "" : data.trim()
    } else if (data && typeof data === "object" && "message" in data) {
      detail = String((data as { message: unknown }).message ?? "").trim()
      if (looksLikeHtml(detail)) detail = ""
    }

    if (detail) {
      const clean = looksLikeHtml(detail) ? stripHtml(detail) : detail
      if (clean && clean.length < 180) return `API ${status}: ${clean}`
    }

    return `API ${status}: ${messageFromStatus(status)}`
  }

  if (error instanceof Error) {
    const msg = error.message
    if (looksLikeHtml(msg)) return "Server error. Please try again."
    return msg
  }

  return "Request failed. Try again."
}
