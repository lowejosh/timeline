import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  children: React.ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
};

export function Field({ children, className, htmlFor, label }: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label
        className="text-[0.76rem] font-semibold text-foreground"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
