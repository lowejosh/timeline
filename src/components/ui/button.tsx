import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[background-color,border-color,color,box-shadow,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "size-8",
        pill: "h-8 rounded-full px-3 text-xs",
        sm: "h-8 px-3 text-xs",
      },
      variant: {
        default:
          "border border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-accent/60",
        glass:
          "border border-border/80 bg-glass text-foreground shadow-glass backdrop-blur-md hover:border-border hover:bg-glass-hover hover:shadow-glass-hover data-[state=open]:bg-glass-active",
        outline:
          "border border-border bg-surface/50 text-foreground hover:bg-glass-hover",
        subtle:
          "border border-border/70 bg-surface/40 text-muted-foreground hover:bg-surface hover:text-foreground",
      },
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
