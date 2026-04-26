import { useCallback } from "react";

import { useTimelineSidebarEscape } from "../hooks/useTimelineSidebarEscape";
import type { TimelineSidebarSetState } from "@/lib/app/sidebarModel";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import { TimelineSidebar } from "../TimelineSidebar";

type TimelineSidebarChromeProps = {
  activeView: "timeline" | "available-sets";
  expandedSetIds: ReadonlySet<TimelineSetId>;
  isOpen: boolean;
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
  sets: TimelineSidebarSetState[];
};

export function TimelineSidebarChrome({
  activeView,
  expandedSetIds,
  isOpen,
  mode,
  onOpenSetManager,
  onReorderSets,
  onToggleEntry,
  onToggleSet,
  onToggleSetExpanded,
  setIsOpen,
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
      <button
        aria-controls="timeline-layers-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Hide layers controls" : "Show layers controls"}
        className="timeline-sidebar-toggle__wrap absolute top-3 left-3 z-[4] inline-flex items-center gap-[0.45rem] py-[0.46rem] px-[0.68rem] border rounded-full text-[var(--ink)] backdrop-blur-[14px] cursor-pointer bg-[var(--glass-base)] border-[var(--brown-14)] [box-shadow:0_8px_18px_var(--shadow-8)] [transition:background-color_180ms_ease,box-shadow_180ms_ease,border-color_180ms_ease,transform_180ms_ease,opacity_180ms_ease] hover:bg-[var(--glass-hover)] hover:border-[var(--brown-20)] hover:[box-shadow:0_10px_22px_var(--shadow-10)] hover:-translate-y-px data-[open=true]:bg-[var(--glass-active)] data-[open=true]:border-[var(--brown-18)] data-[open=true]:[box-shadow:0_10px_22px_var(--shadow-10)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--focus)] max-sm:top-[10px] max-sm:left-[10px] max-sm:py-[0.42rem] max-sm:data-[open=true]:opacity-0 max-sm:data-[open=true]:pointer-events-none max-sm:data-[open=true]:-translate-y-1 max-sm:data-[open=true]:scale-[0.98]"
        data-open={isOpen ? "true" : "false"}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className="timeline-sidebar-toggle__glyph relative w-[0.8rem] h-[0.8rem]"
        />
        <span className="font-semibold text-[0.76rem] leading-none tracking-[0.01em] font-sans">
          Layers
        </span>
      </button>
      <button
        aria-label="Close layers controls"
        className="timeline-sidebar-backdrop absolute inset-0 z-[2] border-0 bg-transparent p-0"
        data-open={isOpen ? "true" : "false"}
        onClick={closeSidebar}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-hidden={!isOpen}
        className="timeline-sidebar-shell absolute top-14 left-3 z-[3] w-[min(var(--sidebar-width),calc(100vw-24px))] max-h-[min(calc(100%-68px),var(--sidebar-max-height))] max-sm:top-[50px] max-sm:left-[10px] max-sm:w-[min(var(--sidebar-width),calc(100vw-20px))] max-sm:max-h-[min(calc(100%-60px),var(--sidebar-max-height))]"
        data-open={isOpen ? "true" : "false"}
        data-mode={mode}
        id="timeline-layers-panel"
      >
        <TimelineSidebar
          expandedSetIds={expandedSetIds}
          onOpenSetManager={onOpenSetManager}
          onReorderSets={onReorderSets}
          onToggleEntry={onToggleEntry}
          onToggleSet={onToggleSet}
          onToggleSetExpanded={onToggleSetExpanded}
          sets={sets}
        />
      </div>
    </>
  );
}
