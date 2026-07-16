// trackit frontend

export const TRACKIT_ROUTES = {
  home: "/",
  create: "/tasks/new",
  edit: (taskId: string | number) => `/tasks/${taskId}/edit`,
  details: (taskId: string | number) => `/tasks/${taskId}`,
} as const
