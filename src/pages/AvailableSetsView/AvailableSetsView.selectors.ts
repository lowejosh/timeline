import { useCallback, useMemo } from "react";

import {
  ROOT_ERA,
  getEraFamilyId,
  type TimelineSetId,
} from "@/lib/catalog/eras";
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

export function useAvailableSetsActions() {
  const activeEraId = useTimelineNavigationStore((state) => state.activeEraId);
  const setActiveEraId = useTimelineNavigationStore(
    (state) => state.setActiveEraId,
  );
  const setActiveView = useTimelineNavigationStore(
    (state) => state.setActiveView,
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
    () => applyTimelineSetOrderToEraTree(ROOT_ERA, orderedSetIds),
    [orderedSetIds],
  );
  const getActiveSetId = useCallback(() => {
    const activeFamilyId = getEraFamilyId(prioritizedRootEra, activeEraId);

    return activeFamilyId ? getSetIdForEraFamily(activeFamilyId) : null;
  }, [activeEraId, prioritizedRootEra]);
  const resetActiveSet = useCallback(() => {
    setActiveEraId(ROOT_ERA.id);
    animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
  }, [animateToRange, setActiveEraId]);
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
        setActiveEraId(ROOT_ERA.id);
        animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
      }
    },
    [animateToRange, getActiveSetId, setActiveEraId],
  );
  const closeSetManager = useCallback(() => {
    const { width, height } = getCurrentStageSize();

    setActiveView("timeline");
    setIsSidebarOpen(!shouldUseMobileTimelineDrawer(width, height));
  }, [setActiveView, setIsSidebarOpen]);
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
      applySetLibrary(nextEnabledSetIds, nextOrderedSetIds);
      closeSetManager();
    },
    [applySetLibrary, closeSetManager, resetActiveSetIfRemoved],
  );

  return useMemo(
    () => ({
      applySets,
      closeSetManager,
      toggleVisibleSet,
    }),
    [applySets, closeSetManager, toggleVisibleSet],
  );
}
