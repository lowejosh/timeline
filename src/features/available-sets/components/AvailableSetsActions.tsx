import { Button } from "@/components/ui/button";

type AvailableSetsActionsProps = {
  onApply: () => void;
  onClose: () => void;
};

export function AvailableSetsActions({
  onApply,
  onClose,
}: AvailableSetsActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-1 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-3 max-sm:-mb-3 max-sm:justify-stretch max-sm:border-t max-sm:border-border/70 max-sm:bg-card/95 max-sm:p-3 max-sm:backdrop-blur-xl">
      <Button
        className="max-sm:flex-1"
        onClick={onClose}
        type="button"
        variant="outline"
      >
        Discard changes
      </Button>
      <Button className="max-sm:flex-1" onClick={onApply} type="button">
        Done
      </Button>
    </div>
  );
}
