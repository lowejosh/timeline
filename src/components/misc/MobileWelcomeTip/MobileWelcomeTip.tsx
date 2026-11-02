import { ChevronsUpDown, HousePlus, RotateCw, Share } from "lucide-react";

import { Button } from "@/components/ui/button";

type MobileWelcomeTipProps = {
  dismiss: () => void;
  isOpen: boolean;
  isStandalone: boolean;
  platform: "ios" | "generic";
};

export function MobileWelcomeTip({
  dismiss,
  isOpen,
  isStandalone,
  platform,
}: MobileWelcomeTipProps) {
  if (!isOpen) return null;

  return (
    <aside
      aria-labelledby="mobile-welcome-title"
      className="fixed left-[calc(env(safe-area-inset-left,0px)+0.75rem)] right-[calc(env(safe-area-inset-right,0px)+0.75rem)] bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-[6] mx-auto grid max-w-[23rem] gap-3 rounded-lg border border-border/80 bg-card/95 p-4 text-card-foreground shadow-panel backdrop-blur-md motion-safe:animate-[popover-in_180ms_cubic-bezier(0.22,1,0.36,1)] landscape:left-[calc(env(safe-area-inset-left,0px)+3rem)] landscape:right-[calc(env(safe-area-inset-right,0px)+3rem)]"
    >
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <RotateCw
          aria-hidden="true"
          className="mt-0.5 size-5 text-muted-foreground"
        />
        <div className="grid gap-1">
          <h2
            id="mobile-welcome-title"
            className="m-0 font-display text-base font-semibold leading-tight"
          >
            A couple of quick tips
          </h2>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">
            Try turning your phone sideways.
            {!isStandalone &&
              " Adding to Home Screen removes the annoying browser tabs. Looks better (especially in landscape)."}
          </p>
        </div>
      </div>

      {!isStandalone && (
        <p className="m-0 flex items-start gap-2 rounded-md bg-surface/50 px-2.5 py-2 text-[0.7rem] leading-relaxed text-muted-foreground">
          {platform === "ios" ? (
            <Share aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          ) : (
            <HousePlus
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0"
            />
          )}
          <span>
            {platform === "ios"
              ? "Tap Share, then Add to Home Screen."
              : "Open your browser menu and choose Install app or Add to Home Screen."}
          </span>
        </p>
      )}

      <div className="flex items-center gap-2 text-xs leading-relaxed">
        <ChevronsUpDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <p className="m-0">
          You can drag the arrows on either side up or down to zoom.
        </p>
      </div>

      <Button
        className="h-10 justify-self-end rounded-full px-5 text-xs"
        onClick={dismiss}
        type="button"
      >
        Got it
      </Button>
    </aside>
  );
}
