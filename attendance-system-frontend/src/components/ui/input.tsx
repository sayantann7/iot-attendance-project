import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#2563EB] placeholder:text-[#2563EB]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50 font-[Helvetica] transition-all",
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

