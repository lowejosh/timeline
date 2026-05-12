import * as React from "react";

import { cn } from "@/lib/utils";

export type SwitchProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "role"
> & {
  checked: boolean;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, disabled, ...props }, ref) => (
    <button
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-[1.12rem] w-8 shrink-0 cursor-pointer rounded-full border border-transparent p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      disabled={disabled}
      ref={ref}
      role="switch"
      type="button"
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-1 top-1/2 size-3 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          checked && "translate-x-[0.86rem]",
        )}
      />
    </button>
  ),
);
Switch.displayName = "Switch";
