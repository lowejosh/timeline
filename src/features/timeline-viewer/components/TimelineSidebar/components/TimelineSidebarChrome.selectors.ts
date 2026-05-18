import { useCallback, useMemo } from "react";

import { useTimelineLayerStore } from "@/stores/timelineLayer.store";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";

export const useSidebarActiveView = () =>
  useTimelineNavigationStore((state) => state.activeView);

export const useExpandedSetIds = () =>
  useTimelineLayerStore((state) => state.expandedSetIds);

export const useIsSidebarOpen = () =>
  useTimelineUiStore((state) => state.isSidebarOpen);

export function useSidebarChromeActions(catalog: TimelineCatalogSnapshot) {
  const reorderSetsAction = useTimelineLayerStore((state) => state.reorderSets);
  const toggleEntry = useTimelineLayerStore((state) => state.toggleEntry);
  const toggleSetExpanded = useTimelineLayerStore(
    (state) => state.toggleSetExpanded,
  );
  const setActiveView = useTimelineNavigationStore(
    (state) => state.setActiveView,
  );
  const setIsSidebarOpen = useTimelineUiStore(
    (state) => state.setIsSidebarOpen,
  );
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);
  const openSetManager = useCallback(() => {
    setIsSidebarOpen(false);
    setActiveView("available-sets");
  }, [setActiveView, setIsSidebarOpen]);
  const reorderSets = useCallback(
    (nextSetIds: Parameters<typeof reorderSetsAction>[0]) => {
      reorderSetsAction(nextSetIds, catalog);
    },
    [catalog, reorderSetsAction],
  );

  return useMemo(
    () => ({
      closeSidebar,
      openSetManager,
      reorderSets,
      setIsSidebarOpen,
      toggleEntry,
      toggleSetExpanded,
    }),
    [
      closeSidebar,
      openSetManager,
      reorderSets,
      setIsSidebarOpen,
      toggleEntry,
      toggleSetExpanded,
    ],
  );
}
