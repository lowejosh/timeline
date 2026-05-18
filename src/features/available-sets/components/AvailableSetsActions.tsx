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
    <div className="flex justify-end gap-2 max-sm:justify-stretch">
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
