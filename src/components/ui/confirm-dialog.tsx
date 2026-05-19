import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageIconButton } from "@/components/ui/page-icon-button";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  description,
  isOpen,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex animate-[shortcut-overlay-in_180ms_ease-out] items-center justify-center bg-overlay-scrim px-3 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="Close confirmation dialog"
        className="absolute inset-0 border-0 bg-transparent p-0"
        onClick={onClose}
        type="button"
      />
      <section className="relative grid w-[min(27rem,calc(100vw-24px))] animate-[shortcut-dialog-in_220ms_cubic-bezier(0.22,1,0.36,1)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-panel">
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <h2
            className="m-0 font-display text-base font-semibold leading-none text-primary"
            id="confirm-dialog-title"
          >
            {title}
          </h2>
          <PageIconButton label="Close" onClick={onClose} type="button">
            <X className="size-4" />
          </PageIconButton>
        </header>
        <div className="grid gap-4 px-4 py-4">
          <p className="m-0 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} size="pill" type="button" variant="ghost">
              {cancelLabel}
            </Button>
            <Button
              className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
              onClick={onConfirm}
              size="pill"
              type="button"
              variant="subtle"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
