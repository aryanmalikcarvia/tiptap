// trackit frontend

export const TRACKIT_ROUTES = {
  home: "/",
  create: "/tasks/new",
  details: (taskId: string | number) => `/tasks/${taskId}`,
} as const
