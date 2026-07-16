import { TrackitApp } from "@/trackit/TrackitApp"
import { ToastProvider } from "@/components/ui/toast"

function App() {
  return (
    <ToastProvider>
      <TrackitApp />
    </ToastProvider>
  )
}

export default App
