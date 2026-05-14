import { useCallback } from "react";

import { useTimelineSidebarEscape } from "../hooks/useTimelineSidebarEscape";
import { Button } from "@/components/ui/button";
import type { TimelineSidebarSetState } from "@/lib/app/sidebarModel";
import type { TimelineLayerShortcutTarget } from "@/lib/app/timelineKeyboard";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { TimelineSidebar } from "../TimelineSidebar";
import { cn } from "@/lib/utils";

type TimelineSidebarChromeProps = {
  activeView: "timeline" | "available-sets";
  expandedSetIds: ReadonlySet<TimelineSetId>;
  isOpen: boolean;
  layerShortcuts: readonly TimelineLayerShortcutTarget[];
  mode: "drawer" | "popup";
  onOpenSetManager: () => void;
  onReorderSets: (nextSetIds: TimelineSetId[]) => void;
  onToggleEntry: (groupIds: string[], nextEnabled: boolean) => void;
  onToggleSet: (setId: TimelineSetId, nextEnabled: boolean) => void;
  onToggleSetExpanded: (
    setId: TimelineSetId,
    nextExpanded: boolean,
  ) => void;
  setIsOpen: (updater: boolean | ((current: boolean) => boolean)) => void;
  showShortcuts?: boolean;
  sets: TimelineSidebarSetState[];
};

export function TimelineSidebarChrome({
  activeView,
  expandedSetIds,
  isOpen,
  layerShortcuts,
  mode,
  onOpenSetManager,
  onReorderSets,
  onToggleEntry,
  onToggleSet,
  onToggleSetExpanded,
  setIsOpen,
  showShortcuts = true,
  sets,
}: TimelineSidebarChromeProps) {
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useTimelineSidebarEscape({
    activeView,
    isOpen,
    onClose: closeSidebar,
  });

  return (
    <>
      <Button
        aria-controls="timeline-layers-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide layers controls" : "Show layers controls"}
        className={cn(
          "absolute left-[calc(env(safe-area-inset-left,0px)+0.75rem)] top-[calc(env(safe-area-inset-top,0px)+0.75rem)] z-[4] h-auto rounded-full px-3 py-2 text-xs",
          "transition-[background-color,border-color,box-shadow,opacity,transform] duration-200",
          activeView === "available-sets" && "pointer-events-none opacity-0",
          mode === "drawer" &&
            isOpen &&
            "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
          "max-sm:left-[10px] max-sm:top-[10px]",
        )}
        data-open={isOpen ? "true" : "false"}
        onClick={() => {
          setIsOpen((current) => !current);
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
      </Button>
      <button
        aria-label="Close layers controls"
        className={cn(
          "absolute inset-0 z-[2] hidden border-0 bg-transparent p-0 transition-opacity duration-200",
          mode === "drawer" && "block",
          isOpen
            ? "pointer-events-auto bg-[rgba(44,31,20,0.16)] opacity-100 backdrop-blur-md"
            : "pointer-events-none opacity-0",
          activeView === "available-sets" && "pointer-events-none opacity-0",
        )}
        data-open={isOpen ? "true" : "false"}
        onClick={closeSidebar}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-hidden={!isOpen}
        className={cn(
          "absolute left-3 top-14 z-[3] w-[min(var(--sidebar-width),calc(100vw-24px))] max-h-[min(calc(100%-68px),var(--sidebar-max-height))] origin-top-left transition-[opacity,transform] duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.985] opacity-0",
          activeView === "available-sets" && "pointer-events-none opacity-0",
          "max-sm:left-[10px] max-sm:top-[50px] max-sm:w-[min(var(--sidebar-width),calc(100vw-20px))] max-sm:max-h-[min(calc(100%-60px),var(--sidebar-max-height))]",
          mode === "drawer" &&
            "bottom-0 left-0 top-0 w-[min(calc(var(--sidebar-width)+env(safe-area-inset-left,0px)),calc(100vw-18px))] max-h-none origin-left",
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
          onOpenSetManager={onOpenSetManager}
          onReorderSets={onReorderSets}
          onToggleEntry={onToggleEntry}
          onToggleSet={onToggleSet}
          onToggleSetExpanded={onToggleSetExpanded}
          showShortcuts={showShortcuts}
          sets={sets}
        />
      </div>
    </>
  );
}
