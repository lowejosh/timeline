import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type AvailableSetsHeaderProps = {
  onApply: () => void;
  titleId: string;
};

export function AvailableSetsHeader({
  onApply,
  titleId,
}: AvailableSetsHeaderProps) {
  return (
    <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:items-start">
      <Button
        aria-label="Back to layers"
        className="rounded-full"
        onClick={onApply}
        size="icon"
        type="button"
        variant="glass"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="grid min-w-0 gap-1">
        <h1
          className="m-0 font-display text-base font-semibold leading-none text-foreground"
          id={titleId}
        >
          Available sets
        </h1>
        <p className="m-0 text-[0.69rem] leading-snug text-muted-foreground">
          Drag with the handle to add, remove, and order timeline layers.
        </p>
      </div>

      <Button
        aria-label="Create a set, coming soon"
        className="ml-auto max-sm:ml-0"
        disabled
        size="pill"
        title="Create set, coming soon"
        type="button"
        variant="subtle"
      >
        <Plus className="size-3.5" />
        <span>Create (Coming soon)</span>
      </Button>
    </div>
  );
}
