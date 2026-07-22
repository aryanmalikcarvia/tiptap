export type TaskContent = Record<string, unknown> | unknown[] | string | null

export type Task = {
  id: number | string
  title: string
  content: TaskContent
}

export type TaskPayload = {
  title: string
  content: TaskContent
}
