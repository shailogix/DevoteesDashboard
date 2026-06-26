import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "ring-offset-background transition-all duration-200 focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "relative overflow-hidden m3-ripple",
  ].join(" "),
  {
    variants: {
      variant: {
        /* M3 Filled — primary action */
        default:
          "rounded-full bg-primary text-primary-foreground shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-px active:translate-y-0 active:shadow-none",
        /* M3 Filled-Tonal — secondary action (new M3 preferred) */
        tonal:
          "rounded-full bg-primary/12 text-primary hover:bg-primary/18 active:bg-primary/24 shadow-none",
        /* M3 Elevated */
        elevated:
          "rounded-full bg-surface-container-high text-foreground shadow-elevation-2 hover:shadow-elevation-3 hover:-translate-y-px active:translate-y-0",
        /* M3 Outlined */
        outline:
          "rounded-full border-[1.5px] border-primary/30 bg-transparent text-primary hover:bg-primary/8 hover:border-primary active:bg-primary/12",
        /* M3 Text */
        ghost:
          "rounded-full text-foreground hover:bg-foreground/8 active:bg-foreground/12",
        /* M3 Destructive */
        destructive:
          "rounded-full bg-destructive text-destructive-foreground shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-px",
        /* Link */
        link: "rounded-none text-primary underline-offset-4 hover:underline p-0 h-auto",
        /* M3 Secondary filled */
        secondary:
          "rounded-full bg-secondary text-secondary-foreground shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-px",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm:  "h-9  px-4 py-2   text-xs rounded-full",
        lg:  "h-14 px-8 py-3   text-base",
        xl:  "h-16 px-10 py-4  text-lg",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
