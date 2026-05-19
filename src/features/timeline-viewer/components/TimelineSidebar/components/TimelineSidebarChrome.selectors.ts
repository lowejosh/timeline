import { useCallback, useMemo } from "react";

import { useAppRouteNavigation, useRouteView } from "@/app/routePaths";
import { useTimelineLayerStore } from "@/stores/timelineLayer.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";

export const useSidebarActiveView = useRouteView;

export const useExpandedSetIds = () =>
  useTimelineLayerStore((state) => state.expandedSetIds);

export const useIsSidebarOpen = () =>
  useTimelineUiStore((state) => state.isSidebarOpen);

export function useSidebarChromeActions(catalog: TimelineCatalogSnapshot) {
  const routeNavigation = useAppRouteNavigation();
  const reorderSetsAction = useTimelineLayerStore((state) => state.reorderSets);
  const toggleEntry = useTimelineLayerStore((state) => state.toggleEntry);
  const toggleSetExpanded = useTimelineLayerStore(
    (state) => state.toggleSetExpanded,
  );
  const setIsSidebarOpen = useTimelineUiStore(
    (state) => state.setIsSidebarOpen,
  );
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);
  const openSetManager = useCallback(() => {
    setIsSidebarOpen(false);
    routeNavigation.openSets();
  }, [routeNavigation, setIsSidebarOpen]);
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
