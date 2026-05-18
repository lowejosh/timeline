import { useCallback, useMemo } from "react";

import { getEraFamilyId, type TimelineSetId } from "@/lib/catalog/eras";
import type { TimelineCatalogSnapshot } from "@/lib/catalog/timelineCatalog";
import { shouldUseMobileTimelineDrawer } from "@/lib/app/layout";
import {
  applyTimelineSetOrderToEraTree,
  getSetIdForEraFamily,
} from "@/lib/catalog/timelineSets";
import { HOME_RANGE } from "@/lib/core/viewport";
import { useTimelineLayerStore } from "@/stores/timelineLayer.store";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";
import { useTimelineViewportStore } from "@/stores/timelineViewport.store";

export const useActiveView = () =>
  useTimelineNavigationStore((state) => state.activeView);

export const useEnabledSetIds = () =>
  useTimelineLayerStore((state) => state.enabledSetIds);

export const useOrderedSetIds = () =>
  useTimelineLayerStore((state) => state.orderedSetIds);

export const useVisibleSetIds = () =>
  useTimelineLayerStore((state) => state.visibleSetIds);

function getCurrentStageSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useAvailableSetsActions(catalog: TimelineCatalogSnapshot) {
  const activeEraId = useTimelineNavigationStore((state) => state.activeEraId);
  const setActiveEraId = useTimelineNavigationStore(
    (state) => state.setActiveEraId,
  );
  const setActiveView = useTimelineNavigationStore(
    (state) => state.setActiveView,
  );
  const openCreateSetAction = useTimelineNavigationStore(
    (state) => state.openCreateSet,
  );
  const openEditCustomSetAction = useTimelineNavigationStore(
    (state) => state.openEditCustomSet,
  );
  const orderedSetIds = useTimelineLayerStore((state) => state.orderedSetIds);
  const applySetLibrary = useTimelineLayerStore(
    (state) => state.applySetLibrary,
  );
  const toggleSetVisible = useTimelineLayerStore(
    (state) => state.toggleSetVisible,
  );
  const setIsSidebarOpen = useTimelineUiStore(
    (state) => state.setIsSidebarOpen,
  );
  const animateToRange = useTimelineViewportStore(
    (state) => state.animateToRange,
  );
  const prioritizedRootEra = useMemo(
    () => applyTimelineSetOrderToEraTree(catalog.rootEra, orderedSetIds, catalog),
    [catalog, orderedSetIds],
  );
  const getActiveSetId = useCallback(() => {
    const activeFamilyId = getEraFamilyId(prioritizedRootEra, activeEraId);

    return activeFamilyId ? getSetIdForEraFamily(activeFamilyId, catalog) : null;
  }, [activeEraId, catalog, prioritizedRootEra]);
  const resetActiveSet = useCallback(() => {
    setActiveEraId(catalog.rootEra.id);
    animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
  }, [animateToRange, catalog.rootEra.id, setActiveEraId]);
  const resetActiveSetIfRemoved = useCallback(
    (nextEnabledSetIds: ReadonlySet<TimelineSetId>) => {
      const activeSetId = getActiveSetId();

      if (activeSetId && !nextEnabledSetIds.has(activeSetId)) {
        resetActiveSet();
      }
    },
    [getActiveSetId, resetActiveSet],
  );
  const resetActiveSetIfMatches = useCallback(
    (setId: TimelineSetId) => {
      if (getActiveSetId() === setId) {
        setActiveEraId(catalog.rootEra.id);
        animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
      }
    },
    [animateToRange, catalog.rootEra.id, getActiveSetId, setActiveEraId],
  );
  const closeSetManager = useCallback(() => {
    const { width, height } = getCurrentStageSize();

    setActiveView("timeline");
    setIsSidebarOpen(!shouldUseMobileTimelineDrawer(width, height));
  }, [setActiveView, setIsSidebarOpen]);
  const openCreateSet = useCallback(() => {
    openCreateSetAction();
  }, [openCreateSetAction]);
  const openEditCustomSet = useCallback(
    (setId: TimelineSetId) => {
      openEditCustomSetAction(setId);
    },
    [openEditCustomSetAction],
  );
  const toggleVisibleSet = useCallback(
    (setId: TimelineSetId, nextVisible: boolean) => {
      if (!nextVisible) {
        resetActiveSetIfMatches(setId);
      }

      toggleSetVisible(setId, nextVisible);
    },
    [resetActiveSetIfMatches, toggleSetVisible],
  );
  const applySets = useCallback(
    (
      nextEnabledSetIds: Set<TimelineSetId>,
      nextOrderedSetIds: TimelineSetId[],
    ) => {
      resetActiveSetIfRemoved(nextEnabledSetIds);
      applySetLibrary(nextEnabledSetIds, nextOrderedSetIds, catalog);
      closeSetManager();
    },
    [applySetLibrary, catalog, closeSetManager, resetActiveSetIfRemoved],
  );

  return useMemo(
    () => ({
      applySets,
      closeSetManager,
      openCreateSet,
      openEditCustomSet,
      toggleVisibleSet,
    }),
    [
      applySets,
      closeSetManager,
      openCreateSet,
      openEditCustomSet,
      toggleVisibleSet,
    ],
  );
}
