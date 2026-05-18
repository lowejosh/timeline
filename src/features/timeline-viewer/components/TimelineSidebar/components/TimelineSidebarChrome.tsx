import * as rx from "./TimelineSidebarChrome.selectors";

import { useTimelineSidebarEscape } from "../TimelineSidebar.hooks";
import { Button } from "@/components/ui/button";
import { ShortcutKey } from "@/components/ui/shortcut-key";
import type { TimelineSidebarSetState } from "@/lib/app/sidebarModel";
import type { TimelineLayerShortcutTarget } from "@/lib/app/timelineKeyboard";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import { TimelineSidebar } from "../TimelineSidebar";
import { cn } from "@/lib/utils";
import { Map } from "lucide-react";

type TimelineSidebarChromeProps = {
  isMapPreviewEnabled: boolean;
  catalog: TimelineCatalogSnapshot;
  layerShortcuts: readonly TimelineLayerShortcutTarget[];
  mode: "drawer" | "popup";
  onToggleMapPreview: () => void;
  onToggleSet: (setId: TimelineSetId, nextEnabled: boolean) => void;
  showShortcuts?: boolean;
  sets: TimelineSidebarSetState[];
};

export function TimelineSidebarChrome({
  catalog,
  isMapPreviewEnabled,
  layerShortcuts,
  mode,
  onToggleMapPreview,
  onToggleSet,
  showShortcuts = true,
  sets,
}: TimelineSidebarChromeProps) {
  const activeView = rx.useSidebarActiveView();
  const expandedSetIds = rx.useExpandedSetIds();
  const isOpen = rx.useIsSidebarOpen();
  const actions = rx.useSidebarChromeActions(catalog);

  useTimelineSidebarEscape({
    activeView,
    isOpen,
    onClose: actions.closeSidebar,
  });

  return (
    <>
      <div
        className={cn(
          "absolute left-[var(--app-chrome-left)] top-[var(--app-chrome-top)] z-[4] flex items-center gap-2",
          "transition-[opacity,transform] duration-200",
          activeView !== "timeline" && "pointer-events-none opacity-0",
          mode === "drawer" &&
            isOpen &&
            "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        <Button
          aria-controls="timeline-layers-panel"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide layers controls" : "Show layers controls"}
          className={cn(
            "h-auto rounded-full px-3 py-2 text-xs",
            isOpen &&
              "bg-glass-selected border-border",
          )}
          data-open={isOpen ? "true" : "false"}
          onClick={() => {
            actions.setIsSidebarOpen((current) => !current);
          }}
          size="pill"
          type="button"
          variant="glass"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className="size-4 shrink-0">
            <rect x="2" y="3.25" width="12" height="1.5" rx="0.75" style={{ transformBox: 'fill-box', transformOrigin: '50% 50%', transform: isOpen ? 'translateY(4px) rotate(45deg)' : 'none', transition: 'transform 220ms cubic-bezier(0.4,0,0.2,1)' }} />
            <rect x="2" y="7.25" width="12" height="1.5" rx="0.75" style={{ transformBox: 'fill-box', transformOrigin: '50% 50%', opacity: isOpen ? 0 : 1, transform: isOpen ? 'scaleX(0)' : 'none', transition: 'opacity 160ms ease, transform 220ms cubic-bezier(0.4,0,0.2,1)' }} />
            <rect x="2" y="11.25" width="12" height="1.5" rx="0.75" style={{ transformBox: 'fill-box', transformOrigin: '50% 50%', transform: isOpen ? 'translateY(-4px) rotate(-45deg)' : 'none', transition: 'transform 220ms cubic-bezier(0.4,0,0.2,1)' }} />
          </svg>
          <span>Layers</span>
          {showShortcuts ? (
            <ShortcutKey
              aria-hidden="true"
              className="border-border/70 bg-surface/70 text-muted-foreground"
              size="sm"
            >
              L
            </ShortcutKey>
          ) : null}
        </Button>
        <Button
          aria-label={isMapPreviewEnabled ? "Hide map preview" : "Show map preview"}
          aria-pressed={isMapPreviewEnabled}
          className={cn(
            "h-auto rounded-full px-3 py-2 text-xs",
            isMapPreviewEnabled &&
              "bg-glass-selected border-border",
          )}
          onClick={onToggleMapPreview}
          size="pill"
          type="button"
          variant="glass"
        >
          <Map className="size-4 shrink-0" />
          {showShortcuts ? (
            <ShortcutKey
              aria-hidden="true"
              className="border-border/70 bg-surface/70 text-muted-foreground"
              size="sm"
            >
              M
            </ShortcutKey>
          ) : null}
        </Button>
      </div>
      <button
        aria-label="Close layers controls"
        className={cn(
          "focus-ring-none absolute inset-0 hidden border-0 bg-transparent p-0 transition-opacity duration-200",
          mode === "drawer" && "z-[6] block",
          mode !== "drawer" && "z-[2]",
          isOpen
            ? "pointer-events-auto bg-overlay-scrim opacity-100 backdrop-blur-md"
            : "pointer-events-none opacity-0",
          activeView !== "timeline" && "pointer-events-none opacity-0",
        )}
        data-open={isOpen ? "true" : "false"}
        onClick={actions.closeSidebar}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-hidden={!isOpen}
        className={cn(
          "absolute origin-top-left transition-[opacity,transform] duration-300 ease-out",
          mode === "drawer" ? "z-[7]" : "z-[3]",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.985] opacity-0",
          activeView !== "timeline" && "pointer-events-none opacity-0",
          mode === "drawer"
            ? "bottom-0 left-0 top-0 h-full max-h-none w-[min(calc(var(--sidebar-width)+env(safe-area-inset-left,0px)),calc(100vw-18px))] origin-left"
            : "left-3 top-14 w-[min(var(--sidebar-width),calc(100vw-24px))] max-h-[min(calc(100%-68px),var(--sidebar-max-height))] max-sm:left-[10px] max-sm:top-[50px] max-sm:w-[min(var(--sidebar-width),calc(100vw-20px))] max-sm:max-h-[min(calc(100%-60px),var(--sidebar-max-height))]",
          mode === "drawer" &&
            (isOpen
              ? "translate-x-0 translate-y-0"
              : "translate-x-[calc(-100%-12px)] translate-y-0"),
        )}
        data-open={isOpen ? "true" : "false"}
        data-mode={mode}
        id="timeline-layers-panel"
      >
        <TimelineSidebar
          expandedSetIds={expandedSetIds}
          layerShortcuts={layerShortcuts}
          mode={mode}
          onOpenSetManager={actions.openSetManager}
          onReorderSets={actions.reorderSets}
          onToggleEntry={actions.toggleEntry}
          onToggleSet={onToggleSet}
          onToggleSetExpanded={actions.toggleSetExpanded}
          showShortcuts={showShortcuts}
          sets={sets}
        />
      </div>
    </>
  );
}
