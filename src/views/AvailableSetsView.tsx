import * as rx from "./AvailableSetsView.selectors";
import { AvailableSetsPage } from "@/components/AvailableSets";
import { TIMELINE_SETS } from "@/lib/catalog/timelineSets";
import { THEME } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";

export function AvailableSetsView() {
  const activeView = rx.useActiveView();
  const enabledSetIds = rx.useEnabledSetIds();
  const orderedSetIds = rx.useOrderedSetIds();
  const visibleSetIds = rx.useVisibleSetIds();
  const actions = rx.useAvailableSetsActions();

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden backdrop-blur-2xl transition-[transform,opacity] duration-300 ease-out will-change-[transform,opacity]",
        activeView === "available-sets"
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0",
      )}
      style={{
        background: `linear-gradient(180deg, ${THEME.color.glass.setsFrom} 0%, ${THEME.color.glass.setsTo} 100%)`,
      }}
    >
      <AvailableSetsPage
        allSets={TIMELINE_SETS}
        enabledSetIds={enabledSetIds}
        isActive={activeView === "available-sets"}
        onApply={actions.applySets}
        onClose={actions.closeSetManager}
        onToggleVisible={actions.toggleVisibleSet}
        orderedSetIds={orderedSetIds}
        visibleSetIds={visibleSetIds}
      />
    </div>
  );
}
