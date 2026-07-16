// trackit frontend
import { Navigate, Route, Routes } from "react-router-dom"
import { CardDetailsPage } from "@/trackit/pages/CardDetailsPage"
import { CreateTaskPage } from "@/trackit/pages/CreateTaskPage"
import { EditTaskPage } from "@/trackit/pages/EditTaskPage"
import { HomePage } from "@/trackit/pages/HomePage"
import { TRACKIT_ROUTES } from "@/trackit/routes/paths"

export function TrackitRoutes() {
  return (
    <Routes>
      <Route path={TRACKIT_ROUTES.home} element={<HomePage />} />
      <Route path={TRACKIT_ROUTES.create} element={<CreateTaskPage />} />
      <Route path="/tasks/:taskId/edit" element={<EditTaskPage />} />
      <Route path="/tasks/:taskId" element={<CardDetailsPage />} />
      <Route path="*" element={<Navigate to={TRACKIT_ROUTES.home} replace />} />
    </Routes>
  )
}
