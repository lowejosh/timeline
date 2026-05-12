import type { useTimelineAppState } from "@/hooks/useTimelineAppState";

import { AvailableSetsPage } from "@/components/AvailableSets";
import { TIMELINE_SETS } from "@/lib/catalog/timelineSets";
import { THEME } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";

type TimelineAppState = ReturnType<typeof useTimelineAppState>;

type AvailableSetsViewProps = {
  app: TimelineAppState;
};

export function AvailableSetsView({ app }: AvailableSetsViewProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden backdrop-blur-2xl transition-[transform,opacity] duration-300 ease-out will-change-[transform,opacity]",
        app.activeView === "available-sets"
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0",
      )}
      style={{
        background: `linear-gradient(180deg, ${THEME.color.glass.setsFrom} 0%, ${THEME.color.glass.setsTo} 100%)`,
      }}
    >
      <AvailableSetsPage
        allSets={TIMELINE_SETS}
        enabledSetIds={app.enabledSetIds}
        isActive={app.activeView === "available-sets"}
        onApply={app.handleApplySets}
        onClose={app.handleCloseSetManager}
        onToggleVisible={app.handleToggleSet}
        orderedSetIds={app.orderedSetIds}
        visibleSetIds={app.visibleSetIds}
      />
    </div>
  );
}
