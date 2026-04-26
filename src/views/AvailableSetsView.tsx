import type { useTimelineAppState } from "@/hooks/useTimelineAppState";

import { AvailableSetsPage } from "@/components/AvailableSets";
import { TIMELINE_SETS } from "@/lib/catalog/timelineSets";
import { THEME } from "@/lib/ui/theme";

type TimelineAppState = ReturnType<typeof useTimelineAppState>;

type AvailableSetsViewProps = {
  app: TimelineAppState;
};

export function AvailableSetsView({ app }: AvailableSetsViewProps) {
  return (
    <div
      className="app-view app-view--available-sets absolute inset-0 w-full h-full"
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
