import { cn } from "@/lib/utils";

type ColorPickerProps = {
  id: string;
  value: string;
  className?: string;
  swatches?: readonly string[];
  onChange: (value: string) => void;
};

const DEFAULT_SWATCHES = [
  "rgb(64, 167, 226)",
  "rgb(232, 134, 69)",
  "rgb(88, 217, 69)",
  "rgb(191, 82, 224)",
  "rgb(229, 208, 67)",
  "rgb(63, 213, 188)",
  "rgb(227, 84, 93)",
  "rgb(81, 114, 225)",
] as const;

export function ColorPicker({
  className,
  id,
  onChange,
  swatches = DEFAULT_SWATCHES,
  value,
}: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <label
        className="relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-md border border-border bg-surface/60 shadow-inner transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring"
        htmlFor={id}
        style={{ backgroundColor: value }}
      >
        <span className="sr-only">Choose color</span>
        <input
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          id={id}
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {swatches.map((swatch) => (
          <button
            aria-label={`Use ${swatch}`}
            aria-pressed={
              value.toLocaleLowerCase() === swatch.toLocaleLowerCase()
            }
            className={cn(
              "size-8 cursor-pointer rounded-full border border-border shadow-inner transition-[box-shadow,transform,border-color] hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              value.toLocaleLowerCase() === swatch.toLocaleLowerCase() &&
                "border-foreground shadow-[0_0_0_2px_var(--color-background),0_0_0_4px_var(--color-primary)]",
            )}
            key={swatch}
            onClick={() => onChange(swatch)}
            style={{ backgroundColor: swatch }}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
