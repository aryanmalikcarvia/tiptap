import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "size-8",
  md: "size-10",
  lg: "size-16",
};

/** shadcn-style spinner — Lucide Loader2 */
export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-[#3b82f6]", sizeClass[size], className)}
      aria-hidden
    />
  );
}
