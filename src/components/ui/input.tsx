import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type" | "value"
> & {
  value: number;
  onValueChange: (value: number) => void;
};
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputSurfaceClassName =
  "w-full border border-border bg-surface/60 text-sm text-primary transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        inputSurfaceClassName,
        "flex h-9 rounded-full px-3 py-2",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, onBlur, onValueChange, value, ...props }, ref) => {
    const [draftValue, setDraftValue] = React.useState(() => String(value));

    React.useEffect(() => {
      if (draftValue === "" && value === 0) {
        return;
      }

      setDraftValue(String(value));
    }, [draftValue, value]);

    return (
      <input
        className={cn(
          inputSurfaceClassName,
          "flex h-9 rounded-full px-3 py-2",
          className,
        )}
        inputMode="decimal"
        onBlur={(event) => {
          if (draftValue.trim() === "") {
            setDraftValue("0");
          }

          onBlur?.(event);
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          const parsedValue = Number(nextValue);

          setDraftValue(nextValue);
          onValueChange(
            nextValue.trim() === "" || !Number.isFinite(parsedValue)
              ? 0
              : parsedValue,
          );
        }}
        ref={ref}
        type="number"
        value={draftValue}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        inputSurfaceClassName,
        "min-h-28 resize-y rounded-md px-3 py-2 leading-relaxed",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
