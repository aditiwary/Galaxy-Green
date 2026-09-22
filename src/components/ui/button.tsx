import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-semibold uppercase tracking-[0.09em] cursor-pointer transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "btn-luxury btn-shimmer bg-primary text-primary-foreground shadow-glow hover:bg-primary/95",
        luxury:
          "btn-luxury btn-shimmer bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-gold hover:brightness-105",
        destructive:
          "btn-luxury bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "btn-luxury-outline border border-border text-foreground hover:border-primary/60",
        secondary:
          "btn-luxury-outline bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost:
          "transition-all duration-200 hover:bg-surface/90 hover:text-primary text-foreground/90",
        link: "text-primary underline-offset-4 hover:underline normal-case tracking-normal text-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-[11px]",
        lg: "h-12 px-7",
        xl: "h-14 px-8 text-xs font-bold tracking-widest",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
