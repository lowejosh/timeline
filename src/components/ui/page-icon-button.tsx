import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PageIconButtonProps = Omit<
  ButtonProps,
  "aria-label" | "children" | "size" | "variant"
> & {
  children: ReactNode;
  label: string;
  showSelectedTint?: boolean;
  selected?: boolean;
};

export function PageIconButton({
  children,
  className,
  label,
  showSelectedTint = true,
  selected = false,
  ...props
}: PageIconButtonProps) {
  return (
    <Button
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "rounded-full text-primary",
        selected && showSelectedTint && "bg-accent/70",
        className,
      )}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children}
    </Button>
  );
}
