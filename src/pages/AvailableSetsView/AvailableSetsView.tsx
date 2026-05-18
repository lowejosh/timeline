import * as rx from "./AvailableSetsView.selectors";
import { useMemo } from "react";
import { AvailableSetsPage } from "@/features/available-sets";
import { useTimelineCatalog } from "@/hooks/useTimelineCatalog";
import { useCustomSetCatalogStore } from "@/stores/customSetCatalog.store";
import { THEME } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";

export function AvailableSetsView() {
  const catalog = useTimelineCatalog();
  const customSetDocuments = useCustomSetCatalogStore((state) => state.documents);
  const customSetIds = useMemo(
    () => new Set(customSetDocuments.map((document) => document.metadata.id)),
    [customSetDocuments],
  );
  const deleteCustomSet = useCustomSetCatalogStore(
    (state) => state.deleteCustomSet,
  );
  const activeView = rx.useActiveView();
  const enabledSetIds = rx.useEnabledSetIds();
  const orderedSetIds = rx.useOrderedSetIds();
  const visibleSetIds = rx.useVisibleSetIds();
  const actions = rx.useAvailableSetsActions(catalog);

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
        allSets={catalog.sets}
        catalog={catalog}
        customSetIds={customSetIds}
        enabledSetIds={enabledSetIds}
        isActive={activeView === "available-sets"}
        onApply={actions.applySets}
        onClose={actions.closeSetManager}
        onCreateSet={actions.openCreateSet}
        onDeleteCustomSet={deleteCustomSet}
        onEditCustomSet={actions.openEditCustomSet}
        onToggleVisible={actions.toggleVisibleSet}
        orderedSetIds={orderedSetIds}
        visibleSetIds={visibleSetIds}
      />
    </div>
  );
}
