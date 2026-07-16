// trackit frontend
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastItem = {
  id: number
  message: string
}

type ToastContextValue = {
  toast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string) => {
    const id = Date.now()
    setItems((prev) => [...prev, { id, message }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }, 2800)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border border-[#bfdbfe] bg-white px-4 py-3 text-sm text-[#1e293b] shadow-lg"
            )}
            role="status"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#10b981]" />
            <p className="flex-1 font-medium leading-snug">{item.message}</p>
            <button
              type="button"
              className="rounded p-0.5 text-[#94a3b8] hover:bg-[#eff6ff] hover:text-[#3b82f6]"
              onClick={() =>
                setItems((prev) => prev.filter((t) => t.id !== item.id))
              }
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return ctx
}
