// trackit frontend
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#1e293b] shadow-sm outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
