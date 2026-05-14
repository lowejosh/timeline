import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ShortcutKeyProps = ComponentProps<"kbd"> & {
  size?: "sm" | "md";
};

export function ShortcutKey({
  className,
  size = "md",
  ...props
}: ShortcutKeyProps) {
  return (
    <kbd
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded border border-border bg-surface/80 font-mono font-semibold leading-none text-foreground shadow-[inset_0_-1px_0_rgba(77,61,47,0.1)]",
        size === "sm"
          ? "h-5 min-w-5 px-1.5 text-[0.62rem]"
          : "min-h-6 min-w-6 px-1.5 text-[0.68rem]",
        className,
      )}
      {...props}
    />
  );
}

export function ShortcutChord({
  className,
  keys,
  size = "md",
}: {
  className?: string;
  keys: readonly string[];
  size?: "sm" | "md";
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1", className)}>
      {keys.map((key) => (
        <ShortcutKey key={key} size={size}>
          {key}
        </ShortcutKey>
      ))}
    </span>
  );
}

