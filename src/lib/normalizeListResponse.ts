/** Unwrap list payloads that may be bare arrays or `{ data|content|items: [] }`. */
export function normalizeListResponse<T>(
  payload: unknown,
  isItem: (value: unknown) => value is T,
  nestedKeys: string[] = ["content", "data", "items", "results"]
): T[] {
  if (Array.isArray(payload)) return payload.filter(isItem)

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>
    for (const key of nestedKeys) {
      const nested = obj[key]
      if (Array.isArray(nested)) return nested.filter(isItem)
    }
  }

  return []
}
