import { Home, Share, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstallPrompt } from "@/hooks/usePwaInstallPrompt";
import { cn } from "@/lib/utils";

export function PwaInstallPrompt() {
  const {
    canPromptInstall,
    dismiss,
    install,
    isOpen,
    platform,
    showInstallSteps,
  } = usePwaInstallPrompt();

  if (!isOpen) {
    return null;
  }

  const installStepText =
    platform === "ios"
      ? "Tap Share, then Add to Home Screen."
      : "Use your browser menu, then choose Install app or Add to Home Screen.";
  const primaryActionLabel = canPromptInstall
    ? "Add to Home Screen"
    : showInstallSteps
      ? "Got it"
      : "Show Steps";

  return (
    <section
      aria-labelledby="pwa-install-title"
      className={cn(
        "fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-[70]",
        "animate-[popover-in_180ms_cubic-bezier(0.22,1,0.36,1)] rounded-lg border border-border/80 bg-card/95 p-3 text-card-foreground shadow-panel backdrop-blur-md",
        "mx-auto grid max-w-[23rem] gap-3",
      )}
      role="dialog"
    >
      <button
        aria-label="Dismiss install suggestion"
        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full border-0 bg-transparent text-muted-foreground transition-colors hover:bg-surface/70 hover:text-foreground"
        onClick={() => {
          dismiss();
        }}
        type="button"
      >
        <X className="size-4" />
      </button>

      <div className="grid grid-cols-[auto_1fr] gap-3 pr-7">
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-surface/65 text-foreground shadow-inner"
        >
          <Smartphone className="size-4" />
        </span>
        <div className="grid gap-1">
          <h2
            className="m-0 font-display text-[1rem] font-semibold leading-tight text-foreground"
            id="pwa-install-title"
          >
            Add Timeline to Home Screen
          </h2>
          <p className="m-0 text-[0.78rem] font-medium leading-snug text-muted-foreground">
            It opens cleaner as an app, without browser bars around the timeline.
          </p>
        </div>
      </div>

      {showInstallSteps ? (
        <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-border/60 bg-surface/50 px-2.5 py-2 text-[0.72rem] font-semibold leading-snug text-muted-foreground">
          {platform === "ios" ? (
            <Share className="size-3.5" />
          ) : (
            <Home className="size-3.5" />
          )}
          <span>{installStepText}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <Button
          className="h-9 rounded-full text-xs"
          onClick={() => {
            if (!canPromptInstall && showInstallSteps) {
              dismiss();
              return;
            }

            void install();
          }}
          type="button"
          variant="default"
        >
          {primaryActionLabel}
        </Button>
        <Button
          className="h-9 rounded-full px-3 text-xs"
          onClick={() => {
            dismiss({ doNotShowAgain: true });
          }}
          type="button"
          variant="ghost"
        >
          Don't show again
        </Button>
      </div>
    </section>
  );
}
