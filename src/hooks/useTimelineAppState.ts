import { useCallback, useEffect, useRef } from "react";

import { getTimelineCanvasPad } from "@/lib/rendering/layout/padding";
import { useElementSize } from "@/hooks/useElementSize";
import {
  MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER,
} from "@/lib/app/layout";
import {
  ROOT_ERA,
  findEraById,
  getEraFamilyId,
  getNavigableAncestor,
  isEraFamilyRoot,
  type Era,
  type TimelineSetId,
} from "@/lib/catalog/eras";
import {
  getSetIdForEraFamily,
} from "@/lib/catalog/timelineSets";
import {
  HOME_RANGE,
  panByPixels,
  TIMELINE_MIN_YEAR,
  TIMELINE_MAX_YEAR,
  worldToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "@/lib/core/viewport";
import type { TimelineSearchResult } from "@/lib/app/timelineSearch";
import {
  useTimelineLayerStore,
} from "@/stores/timelineLayer.store";
import { useTimelineNavigationStore } from "@/stores/timelineNavigation.store";
import { useTimelineUiStore } from "@/stores/timelineUi.store";
import { getSearchResultViewport } from "@/lib/app/timelineSearchFocus";
import { useTimelineAnimatedViewport } from "@/hooks/useTimelineAnimatedViewport";
import { useTimelineDisplayState } from "@/hooks/useTimelineDisplayState";
import { useTimelineVisibilityState } from "@/hooks/useTimelineVisibilityState";

export function useTimelineAppState() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const canvasPad = getTimelineCanvasPad(stageSize.width, stageSize.height);
  const viewportWidth = Math.max(innerWidth - canvasPad * 2, 1);
  const { animated, setViewportWidth } = useTimelineAnimatedViewport();
  const activeEraId = useTimelineNavigationStore((state) => state.activeEraId);
  const setActiveEraId = useTimelineNavigationStore(
    (state) => state.setActiveEraId,
  );
  const requestExpandOverlay = useTimelineNavigationStore(
    (state) => state.requestExpandOverlay,
  );
  const resolveInitialSidebarVisibility = useTimelineUiStore(
    (state) => state.resolveInitialSidebarVisibility,
  );
  const manualEnabledGroupIds = useTimelineLayerStore(
    (state) => state.manualEnabledGroupIds,
  );
  const enabledSetIds = useTimelineLayerStore((state) => state.enabledSetIds);
  const visibleSetIds = useTimelineLayerStore((state) => state.visibleSetIds);
  const orderedSetIds = useTimelineLayerStore((state) => state.orderedSetIds);
  const humanEvolutionToggleMode = useTimelineLayerStore(
    (state) => state.humanEvolutionToggleMode,
  );
  const autoSuppressedGroupIds = useTimelineLayerStore(
    (state) => state.autoSuppressedGroupIds,
  );
  const overlayVisibilityTransitionSeed = useTimelineLayerStore(
    (state) => state.overlayVisibilityTransitionSeed,
  );
  const ensureGroupsEnabled = useTimelineLayerStore(
    (state) => state.ensureGroupsEnabled,
  );
  const ensureSetVisible = useTimelineLayerStore(
    (state) => state.ensureSetVisible,
  );
  const setAutoSuppressedGroupIds = useTimelineLayerStore(
    (state) => state.setAutoSuppressedGroupIds,
  );
  const toggleSetExpanded = useTimelineLayerStore(
    (state) => state.toggleSetExpanded,
  );
  const toggleSetVisible = useTimelineLayerStore(
    (state) => state.toggleSetVisible,
  );
  const triggerOverlayVisibilityTransition = useTimelineLayerStore(
    (state) => state.triggerOverlayVisibilityTransition,
  );
  const autoTransitionFrameRef = useRef(0);
  const viewportRef = useRef(animated.viewport);
  const viewportWidthRef = useRef(viewportWidth);
  useEffect(() => {
    viewportRef.current = animated.viewport;
    viewportWidthRef.current = viewportWidth;
  });

  useEffect(() => {
    setViewportWidth(viewportWidth);
  }, [setViewportWidth, viewportWidth]);

  useEffect(() => {
    resolveInitialSidebarVisibility(stageSize.width, stageSize.height);
  }, [
    resolveInitialSidebarVisibility,
    stageSize.height,
    stageSize.width,
  ]);

  const {
    autoHiddenOverlayIds,
    baseEnabledGroupIds,
    overlayVisibilityTransitionKey,
    renderEnabledGroupIds,
    sidebarSuppressedGroupIds,
    visibleSetMarkers,
    visibleSetOverlays,
  } = useTimelineVisibilityState({
    autoSuppressedGroupIds,
    canvasPad,
    humanEvolutionToggleMode,
    innerWidth,
    manualEnabledGroupIds,
    overlayVisibilityTransitionSeed,
    setAutoSuppressedGroupIds,
    viewport: animated.viewport,
    viewportWidth,
    visibleSetIds,
  });

  const {
    activeEra,
    chain,
    layerRangeByShortcutId,
    layerShortcuts,
    parentEra,
    prioritizedRootEra,
    rootDisplayEras,
    setFilteredMarkers,
    siblingEras,
    sidebarTree,
    visibleFilteredOverlays,
  } = useTimelineDisplayState({
    activeEraId,
    autoHiddenOverlayIds,
    baseEnabledGroupIds,
    canvasPad,
    enabledSetIds,
    innerWidth,
    orderedSetIds,
    sidebarSuppressedGroupIds,
    viewport: animated.viewport,
    visibleSetIds,
    visibleSetMarkers,
    visibleSetOverlays,
  });

  const checkAutoTransition = useCallback(() => {
    const currentId = useTimelineNavigationStore.getState().activeEraId;
    const era = findEraById(prioritizedRootEra, currentId) ?? prioritizedRootEra;
    const navigableAncestor = getNavigableAncestor(
      prioritizedRootEra,
      currentId,
    );

    if (
      currentId === prioritizedRootEra.id ||
      isEraFamilyRoot(era) ||
      !navigableAncestor
    ) {
      return;
    }

    const eraPixelWidth = Math.abs(
      worldToScreen(era.endYear, viewportRef.current, viewportWidthRef.current) -
        worldToScreen(
          era.startYear,
          viewportRef.current,
          viewportWidthRef.current,
        ),
    );
    const fillRatio = eraPixelWidth / viewportWidthRef.current;

    if (fillRatio < 0.45) {
      setActiveEraId(navigableAncestor.id);
    }
  }, [prioritizedRootEra, setActiveEraId]);

  const scheduleAutoTransitionCheck = useCallback(() => {
    if (autoTransitionFrameRef.current) {
      return;
    }

    autoTransitionFrameRef.current = requestAnimationFrame(() => {
      autoTransitionFrameRef.current = 0;
      checkAutoTransition();
    });
  }, [checkAutoTransition]);

  useEffect(() => {
    return () => {
      if (autoTransitionFrameRef.current) {
        cancelAnimationFrame(autoTransitionFrameRef.current);
      }
    };
  }, []);

  const handleZoom = useCallback(
    (zoomDelta: number, anchorX: number) => {
      animated.animateZoom(zoomDelta, anchorX);
      scheduleAutoTransitionCheck();
    },
    [animated, scheduleAutoTransitionCheck],
  );

  const handleViewportChange = useCallback(
    (updater: (current: TimelineViewport) => TimelineViewport) => {
      animated.updateViewport(updater);
      scheduleAutoTransitionCheck();
    },
    [animated, scheduleAutoTransitionCheck],
  );

  const handleContinuousViewportChange = useCallback(
    (updater: (current: TimelineViewport) => TimelineViewport) => {
      animated.updateViewportDirect(updater);
    },
    [animated],
  );

  const handleViewportGestureStart = useCallback(() => {
    animated.cancelTransientMotion();
  }, [animated]);

  const handleViewportGestureEnd = useCallback(() => {
    scheduleAutoTransitionCheck();
  }, [scheduleAutoTransitionCheck]);

  const handleDrillIntoEra = useCallback(
    (era: Era) => {
      setActiveEraId(era.id);
      animated.animateToRange(era.startYear, era.endYear, -0.1);
    },
    [animated, setActiveEraId],
  );

  const handleNavigateUp = useCallback(() => {
    const parent = getNavigableAncestor(prioritizedRootEra, activeEraId);

    if (parent && parent.id !== prioritizedRootEra.id) {
      setActiveEraId(parent.id);
      animated.animateToRange(parent.startYear, parent.endYear);
    } else {
      setActiveEraId(prioritizedRootEra.id);
      animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
    }
  }, [activeEraId, animated, prioritizedRootEra, setActiveEraId]);

  const handleToggleSet = useCallback(
    (setId: TimelineSetId, nextEnabled: boolean) => {
      if (!nextEnabled) {
        const activeFamilyId = getEraFamilyId(prioritizedRootEra, activeEraId);
        const activeSetId = activeFamilyId
          ? getSetIdForEraFamily(activeFamilyId)
          : null;

        if (activeSetId === setId) {
          setActiveEraId(ROOT_ERA.id);
          animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
        }
      }

      toggleSetVisible(setId, nextEnabled);
    },
    [
      activeEraId,
      animated,
      prioritizedRootEra,
      setActiveEraId,
      toggleSetVisible,
    ],
  );

  const handleHomeRange = useCallback(() => {
    setActiveEraId(prioritizedRootEra.id);
    animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
    scheduleAutoTransitionCheck();
  }, [
    animated,
    prioritizedRootEra.id,
    scheduleAutoTransitionCheck,
    setActiveEraId,
  ]);

  const handleFullTimelineRange = useCallback(() => {
    setActiveEraId(prioritizedRootEra.id);
    animated.animateToRange(TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR, 0);
    scheduleAutoTransitionCheck();
  }, [
    animated,
    prioritizedRootEra.id,
    scheduleAutoTransitionCheck,
    setActiveEraId,
  ]);

  const handleKeyboardNavigationFrame = useCallback(
    ({
      panPixels,
      zoomAnchorRatio,
      zoomDelta,
    }: {
      panPixels: number;
      zoomAnchorRatio: number;
      zoomDelta: number;
    }) => {
      if (panPixels === 0 && zoomDelta === 0) {
        return;
      }

      animated.updateViewportDirect((current) => {
        const width = viewportWidthRef.current;
        const zoomed =
          zoomDelta !== 0
            ? zoomAtPosition(
                current,
                current.zoom + zoomDelta,
                width * zoomAnchorRatio,
                width,
              )
            : current;

        return panPixels !== 0 ? panByPixels(zoomed, panPixels, width) : zoomed;
      });
    },
    [animated],
  );

  const handleKeyboardNavigationEnd = useCallback(() => {
    scheduleAutoTransitionCheck();
  }, [scheduleAutoTransitionCheck]);

  const handleLayerShortcut = useCallback(
    (normalizedKey: string) => {
      const shortcut = layerShortcuts.find(
        (candidate) => candidate.normalizedKey === normalizedKey,
      );

      if (!shortcut) {
        return false;
      }

      const range = layerRangeByShortcutId.get(shortcut.id);

      if (shortcut.kind === "set") {
        toggleSetExpanded(shortcut.setId, true);
        ensureSetVisible(shortcut.setId);
      } else {
        toggleSetExpanded(shortcut.parentSetId, true);
        ensureSetVisible(shortcut.parentSetId);
        ensureGroupsEnabled(shortcut.groupIds);
      }

      triggerOverlayVisibilityTransition();
      setActiveEraId(prioritizedRootEra.id);

      if (range) {
        animated.animateToRange(range.startYear, range.endYear);
        scheduleAutoTransitionCheck();
      }

      return true;
    },
    [
      animated,
      ensureGroupsEnabled,
      ensureSetVisible,
      layerRangeByShortcutId,
      layerShortcuts,
      prioritizedRootEra.id,
      scheduleAutoTransitionCheck,
      setActiveEraId,
      toggleSetExpanded,
      triggerOverlayVisibilityTransition,
    ],
  );

  const handleSearchResultSelect = useCallback(
    (result: TimelineSearchResult) => {
      if (result.setId) {
        ensureSetVisible(result.setId);
      }

      if (result.groupId) {
        ensureGroupsEnabled([result.groupId]);
      }

      triggerOverlayVisibilityTransition();
      setActiveEraId(prioritizedRootEra.id);

      if (result.expandableAsOverlayId) {
        requestExpandOverlay(result.expandableAsOverlayId);
      }

      animated.animateToViewport(
        getSearchResultViewport(
          result,
          animated.viewport,
          viewportWidthRef.current,
        ),
      );

      scheduleAutoTransitionCheck();
    },
    [
      animated,
      ensureGroupsEnabled,
      ensureSetVisible,
      prioritizedRootEra.id,
      requestExpandOverlay,
      scheduleAutoTransitionCheck,
      setActiveEraId,
      triggerOverlayVisibilityTransition,
    ],
  );

  const isOverviewVisible =
    stageSize.height >= MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER;
  const mainCanvasHeight = Math.max(
    timelineSize.height > 0 ? timelineSize.height : stageSize.height,
    1,
  );

  return {
    // refs & measurements
    stageRef,
    stageSize,
    timelineRef,
    timelineSize,
    mainCanvasHeight,
    isOverviewVisible,
    canvasPad,

    // viewport
    animated,

    // era navigation
    activeEra,
    chain,
    parentEra,
    siblingEras,
    rootDisplayEras,

    // visible content
    setFilteredMarkers,
    visibleFilteredOverlays,
    renderEnabledGroupIds,
    overlayVisibilityTransitionKey,

    sidebarTree,
    layerShortcuts,

    // handlers
    handleZoom,
    handleViewportChange,
    handleContinuousViewportChange,
    handleViewportGestureStart,
    handleViewportGestureEnd,
    handleDrillIntoEra,
    handleNavigateUp,
    handleToggleSet,
    handleHomeRange,
    handleFullTimelineRange,
    handleKeyboardNavigationFrame,
    handleKeyboardNavigationEnd,
    handleLayerShortcut,
    handleSearchResultSelect,
  };
}
