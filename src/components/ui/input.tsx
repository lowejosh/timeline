import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputSurfaceClassName =
  "w-full border border-border bg-surface/60 text-sm text-foreground transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
