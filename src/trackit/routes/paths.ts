// trackit frontend

export const TRACKIT_ROUTES = {
  home: "/",
  create: "/tasks/new",
  details: "/tasks/:taskId",
  detailsPath: (taskId: string | number) => `/tasks/${taskId}`,
} as const

