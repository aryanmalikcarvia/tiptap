// trackit frontend
import { Navigate, Route, Routes } from "react-router-dom"
import { CreateTaskPage } from "@/trackit/pages/CreateTaskPage"
import { HomePage } from "@/trackit/pages/HomePage"
import { TaskDetailsPage } from "@/trackit/pages/TaskDetailsPage"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

export function TrackitRoutes() {
  return (
    <Routes>
      <Route path={TRACKIT_ROUTES.home} element={<HomePage />} />
      <Route path={TRACKIT_ROUTES.create} element={<CreateTaskPage />} />
      <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
      <Route path="*" element={<Navigate to={TRACKIT_ROUTES.home} replace />} />
    </Routes>
  )
}
