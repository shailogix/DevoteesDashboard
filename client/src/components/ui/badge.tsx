import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // M3 chip/badge base — pill shaped, smooth transitions
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        /* M3 Filled chip */
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-elevation-1",
        /* M3 Filled-Tonal chip */
        tonal:
          "bg-primary/12 text-primary hover:bg-primary/20 border-0",
        /* M3 Secondary filled */
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/85 shadow-sm",
        /* M3 Secondary tonal */
        "secondary-tonal":
          "bg-secondary/12 text-secondary hover:bg-secondary/20",
        /* Destructive */
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        /* M3 Outlined chip */
        outline:
          "border border-border text-foreground hover:bg-muted",
        /* M3 Success */
        success:
          "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300",
        /* M3 Warning */
        warning:
          "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
        /* M3 Info */
        info:
          "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
