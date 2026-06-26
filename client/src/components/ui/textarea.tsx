import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // M3 Filled textarea style matching Input
        "flex min-h-[100px] w-full rounded-xl border-0 border-b-2 border-border/60",
        "bg-muted/60 px-4 py-3 text-sm text-foreground",
        "placeholder:text-muted-foreground/60 font-medium",
        "ring-offset-background",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:border-primary focus-visible:bg-muted/80",
        "focus-visible:ring-0",
        "hover:border-muted-foreground/50 hover:bg-muted/70",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        "dark:bg-muted/40 dark:focus-visible:bg-muted/60",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
