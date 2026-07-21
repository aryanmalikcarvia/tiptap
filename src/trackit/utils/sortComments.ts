// trackit frontend
import type { TaskComment } from "@/trackit/api/commentsApi"

function commentTimestamp(comment: TaskComment): number {
  const raw = comment.createdAt ?? comment.updatedAt ?? ""
  if (!raw) return 0
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(raw)
  const date = new Date(hasTimezone ? raw : `${raw}Z`)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

/** Latest comment top pe */
export function sortCommentsNewestFirst(
  comments: TaskComment[]
): TaskComment[] {
  return [...comments].sort(
    (a, b) => commentTimestamp(b) - commentTimestamp(a)
  )
}
