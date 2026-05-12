import * as React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  indeterminate?: boolean;
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, className, indeterminate = false, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const isSelected = Boolean(checked) || indeterminate;

    return (
      <span className="relative inline-flex size-4 shrink-0">
        <input
          checked={checked}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          ref={innerRef}
          type="checkbox"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex size-4 items-center justify-center rounded-[0.28rem] border border-border bg-surface shadow-inner transition-[background-color,border-color,box-shadow,transform] duration-150 after:absolute after:inset-1 after:rounded-[0.16rem] after:bg-foreground after:opacity-0 after:scale-50 after:rotate-[-10deg] after:transition-[opacity,transform] after:duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50",
            isSelected &&
              "translate-y-[-1px] scale-105 border-primary/50 bg-primary/20 shadow-sm after:opacity-100 after:scale-100 after:rotate-0",
            indeterminate &&
              "after:inset-x-1 after:inset-y-auto after:top-1/2 after:h-0.5 after:-translate-y-1/2",
            className,
          )}
        />
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
