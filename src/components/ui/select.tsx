import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SelectOption<TValue extends string = string> = {
  label: string;
  value: TValue;
};

type SelectProps<TValue extends string = string> = {
  options: readonly SelectOption<TValue>[];
  value: TValue;
  className?: string;
  onValueChange: (value: TValue) => void;
};

export function Select<TValue extends string = string>({
  className,
  onValueChange,
  options,
  value,
}: SelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={isOpen}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-border bg-background/70 px-3 text-left text-sm font-medium text-primary transition-[border-color,box-shadow,background-color] hover:bg-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className,
          )}
          type="button"
        >
          <span className="truncate">{selectedOption?.label ?? value}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-primary transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="grid w-[var(--radix-popover-trigger-width)] gap-1 rounded-md p-1.5"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              aria-selected={isSelected}
              className={cn(
                "flex h-8 cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isSelected && "bg-accent text-primary",
              )}
              key={option.value}
              onClick={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
              role="option"
              type="button"
            >
              <span className="truncate">{option.label}</span>
              {isSelected ? <Check className="size-3.5 text-primary" /> : null}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
