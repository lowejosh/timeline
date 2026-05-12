import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.64rem] font-semibold leading-none transition-colors",
  {
    defaultVariants: {
      variant: "subtle",
    },
    variants: {
      variant: {
        default: "border-border bg-primary text-primary-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        subtle: "border-transparent bg-muted text-muted-foreground",
        warning: "border-warning/30 bg-warning/15 text-warning",
      },
    },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ className, variant }))} {...props} />
  );
}
