import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type IconButtonProps = Omit<ButtonProps, "children" | "size"> & {
  children: ReactNode;
  label: string;
  selected?: boolean;
  tooltip?: string;
};

export function IconButton({
  children,
  className,
  label,
  selected = false,
  tooltip,
  variant = "glass",
  ...props
}: IconButtonProps) {
  const button = (
    <Button
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "rounded-full text-muted-foreground",
        selected && "border-border bg-glass-selected text-primary",
        className,
      )}
      data-selected={selected ? "true" : "false"}
      size="icon"
      type="button"
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );

  return tooltip || label ? (
    <Tooltip content={tooltip ?? label}>{button}</Tooltip>
  ) : (
    button
  );
}
