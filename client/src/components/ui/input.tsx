import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // M3 Filled text field style:
          // — Filled surface background (slightly tinted)
          // — No full border, rounded top corners, flat bottom
          // — Focus: colored bottom border indicator  
          // — Large radius (M3 Expressive uses 12px+ for text fields)
          "flex h-12 w-full rounded-xl border-0 border-b-2 border-border/60",
          "bg-muted/60 px-4 py-2.5 text-sm text-foreground",
          "placeholder:text-muted-foreground/60 font-medium",
          "ring-offset-background",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:bg-muted/80",
          "focus-visible:ring-0",
          "hover:border-muted-foreground/50 hover:bg-muted/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Dark theme adjustments
          "dark:bg-muted/40 dark:focus-visible:bg-muted/60",
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
