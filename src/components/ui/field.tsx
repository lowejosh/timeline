import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  children: React.ReactNode;
  className?: string;
  description?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
};

export function Field({
  children,
  className,
  description,
  htmlFor,
  label,
  required = false,
}: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label
        className="text-[0.76rem] font-semibold text-primary"
        htmlFor={htmlFor}
      >
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
      {description ? (
        <p className="m-0 text-[0.72rem] leading-snug text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
