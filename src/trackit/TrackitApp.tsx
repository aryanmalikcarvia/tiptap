// trackit frontend
import { BrowserRouter } from "react-router-dom"
import { TrackitRoutes } from "@/trackit/routes/TrackitRoutes"

export function TrackitApp() {
  return (
    <BrowserRouter>
      <TrackitRoutes />
    </BrowserRouter>
  )
}
