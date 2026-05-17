import { useCallback, useEffect, useMemo, useRef } from "react";

import { getTimelineCanvasPad } from "../lib/rendering/layout/padding";
import { useElementSize } from "./useElementSize";
import { resolveTimelineSidebarTree } from "../lib/app/sidebarModel";
import { getAutoHiddenOverlayIds } from "../lib/rendering/overlayRedundancy";
import {
  MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER,
} from "../lib/app/layout";
import {
  filterHiddenOverlayBands,
  getVisibleTimelineOverlayGroupIdsWithViewportEdges,
  getVisibleTimelineGroupIds,
} from "../lib/app/timelineVisibility";
import {
  ROOT_ERA,
  TIMELINE_DISPLAY,
  findEraById,
  getAncestorChain,
  getEraDisplayChain,
  getEraFamilyId,
  getNavigableAncestor,
  getRootDisplayErasBySets,
  isEraFamilyRoot,
  type Era,
  type TimelineSetId,
} from "@/lib/catalog/eras";
import {
  TIMELINE_DECORATION_GROUPS,
  getDefaultEnabledTimelineGroupIds,
} from "../lib/catalog/decorations";
import {
  applyTimelineSetOrderToEraTree,
  applyTimelineSetOrderToMarkers,
  applyTimelineSetOrderToOverlays,
  filterMarkersBySets,
  filterOverlaysBySets,
  getSetIdForEraFamily,
  TIMELINE_SET_ID_BY_GROUP_ID,
  TIMELINE_SET_SPAN_PRIORITY_BY_ID,
} from "../lib/catalog/timelineSets";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "../lib/catalog/layerAutoToggle";
import {
  getVisibleRange,
  getViewportForRange,
  HOME_RANGE,
  normalizeViewport,
  panByPixels,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  worldToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "../lib/core/viewport";
import {
  allocateTimelineLayerShortcuts,
  getChildLayerShortcutId,
  getSetLayerShortcutId,
} from "@/lib/app/timelineKeyboard";
import {
  computeGroupYearRanges,
  computeSetYearRanges,
  type TimelineYearRange,
} from "@/lib/catalog/timelineSetMetrics";
import type { TimelineSearchResult } from "@/lib/app/timelineSearch";
import {
  HUMAN_EVOLUTION_GROUP_ID,
  useTimelineLayerStore,
} from "@/stores/timelineLayerStore";
import { useTimelineNavigationStore } from "@/stores/timelineNavigationStore";
import { useTimelineUiStore } from "@/stores/timelineUiStore";
import { useTimelineViewportStore } from "@/stores/timelineViewportStore";

const SEARCH_MARKER_VISIBILITY_ZOOM_OFFSET = 4;
const SEARCH_MAX_FOCUS_ZOOM = 30;
const SEARCH_POINT_MIN_FOCUS_SPAN_YEARS = 120;
const SEARCH_DEEP_TIME_CONTEXT_FACTOR = 0.04;

function getSearchMarkerFocusSpan(year: number) {
  const yearsFromPresent = Math.abs(TIMELINE_MAX_YEAR - year);

  if (yearsFromPresent >= 1_000_000_000) {
    return Math.max(
      100_000_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 100_000_000) {
    return Math.max(
      10_000_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 1_000_000) {
    return Math.max(
      100_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 100_000) {
    return Math.max(10_000, yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR);
  }

  if (yearsFromPresent >= 10_000) {
    return Math.max(1_000, yearsFromPresent * 0.08);
  }

  if (yearsFromPresent >= 500) {
    return 250;
  }

  return SEARCH_POINT_MIN_FOCUS_SPAN_YEARS;
}

function getSearchResultFocusRange(result: TimelineSearchResult) {
  if (Math.abs(result.startYear - result.endYear) >= 1e-9) {
    return {
      startYear: result.startYear,
      endYear: result.endYear,
    };
  }

  const markerFocusSpan = getSearchMarkerFocusSpan(result.startYear);

  return {
    startYear: result.startYear - markerFocusSpan / 2,
    endYear: result.endYear + markerFocusSpan / 2,
  };
}

function getSearchResultViewport(
  result: TimelineSearchResult,
  current: TimelineViewport,
  width: number,
) {
  const focusRange = getSearchResultFocusRange(result);
  const fitViewport = getViewportForRange(
    focusRange.startYear,
    focusRange.endYear,
    width,
    undefined,
    current.scaleMode,
  );
  const visibilityZoom = result.minZoom ?? 0;
  const maxFocusZoom = Math.min(
    SEARCH_MAX_FOCUS_ZOOM,
    result.maxZoom ?? Infinity,
  );
  let targetZoom: number;

  if (result.kind === "marker") {
    const requiredZoom = Math.min(
      maxFocusZoom,
      visibilityZoom + SEARCH_MARKER_VISIBILITY_ZOOM_OFFSET,
    );
    const desiredZoom = Math.max(
      requiredZoom,
      Math.min(fitViewport.zoom, maxFocusZoom),
    );

    targetZoom = desiredZoom;
  } else if (current.zoom > fitViewport.zoom) {
    targetZoom = fitViewport.zoom;
  } else {
    const requiredZoom = Math.min(maxFocusZoom, visibilityZoom);
    const desiredZoom = Math.max(
      requiredZoom,
      Math.min(fitViewport.zoom, maxFocusZoom),
    );

    targetZoom = desiredZoom;
  }

  return normalizeViewport(
    {
      centerYear: fitViewport.centerYear,
      zoom: targetZoom,
      scaleMode: current.scaleMode,
    },
    width,
  );
}

export function useTimelineAppState() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const canvasPad = getTimelineCanvasPad(stageSize.width, stageSize.height);
  const viewportWidth = Math.max(innerWidth - canvasPad * 2, 1);
  const viewport = useTimelineViewportStore((state) => state.viewport);
  const isAnimating = useTimelineViewportStore((state) => state.isAnimating);
  const setViewportWidth = useTimelineViewportStore(
    (state) => state.setViewportWidth,
  );
  const cancelTransientMotion = useTimelineViewportStore(
    (state) => state.cancelTransientMotion,
  );
  const updateViewport = useTimelineViewportStore(
    (state) => state.updateViewport,
  );
  const updateViewportDirect = useTimelineViewportStore(
    (state) => state.updateViewportDirect,
  );
  const animateToRange = useTimelineViewportStore(
    (state) => state.animateToRange,
  );
  const animateToViewport = useTimelineViewportStore(
    (state) => state.animateToViewport,
  );
  const animateZoom = useTimelineViewportStore((state) => state.animateZoom);
  const recordDragSample = useTimelineViewportStore(
    (state) => state.recordDragSample,
  );
  const releaseMomentum = useTimelineViewportStore(
    (state) => state.releaseMomentum,
  );
  const animated = useMemo(
    () => ({
      viewport,
      isAnimating,
      cancelTransientMotion,
      updateViewport,
      updateViewportDirect,
      animateToRange,
      animateToViewport,
      animateZoom,
      recordDragSample,
      releaseMomentum,
    }),
    [
      animateToRange,
      animateToViewport,
      animateZoom,
      cancelTransientMotion,
      isAnimating,
      recordDragSample,
      releaseMomentum,
      updateViewport,
      updateViewportDirect,
      viewport,
    ],
  );
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
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(),
    [],
  );
  const autoTransitionFrameRef = useRef(0);

  const autoToggleRulesByGroupId = useMemo(
    () =>
      new Map(
        TIMELINE_DECORATION_GROUPS.flatMap((group) =>
          group.autoToggleRule
            ? [[group.id, group.autoToggleRule] as const]
            : [],
        ),
      ),
    [],
  );
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

  const baseEnabledGroupIds = useMemo(() => {
    const next = new Set(manualEnabledGroupIds);

    if (humanEvolutionToggleMode === "manual-on") {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else if (humanEvolutionToggleMode === "manual-off") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    } else if (defaultEnabledGroupIds.has(HUMAN_EVOLUTION_GROUP_ID)) {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    }

    return next;
  }, [defaultEnabledGroupIds, humanEvolutionToggleMode, manualEnabledGroupIds]);

  const visibleSetMarkers = useMemo(
    () => filterMarkersBySets(TIMELINE_DISPLAY.markers, visibleSetIds),
    [visibleSetIds],
  );
  const visibleSetOverlays = useMemo(
    () => filterOverlaysBySets(TIMELINE_DISPLAY.overlays, visibleSetIds),
    [visibleSetIds],
  );

  const autoToggleVisibleGroupIds = useMemo(
    () =>
      getVisibleTimelineGroupIds(
        visibleSetMarkers,
        visibleSetOverlays,
        animated.viewport,
        innerWidth,
        canvasPad,
        baseEnabledGroupIds,
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      canvasPad,
      innerWidth,
      visibleSetMarkers,
      visibleSetOverlays,
    ],
  );

  const autoToggleVisibleOverlayGroupIds = useMemo(
    () =>
      getVisibleTimelineOverlayGroupIdsWithViewportEdges(
        visibleSetOverlays,
        animated.viewport,
        innerWidth,
        canvasPad,
        baseEnabledGroupIds,
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      canvasPad,
      innerWidth,
      visibleSetOverlays,
    ],
  );

  const autoToggleVisibleSetSpanPriorities = useMemo(() => {
    if (innerWidth <= canvasPad * 2) {
      return new Map<string, number>();
    }

    const [visibleStart, visibleEnd] = getVisibleRange(
      animated.viewport,
      viewportWidth,
    );
    const visibleSetSpanPriorities = new Map<string, number>();

    for (const [setId, span] of TIMELINE_SET_SPAN_PRIORITY_BY_ID) {
      if (
        visibleSetIds.has(setId) &&
        span.startYear <= visibleEnd &&
        span.endYear >= visibleStart
      ) {
        visibleSetSpanPriorities.set(setId, span.priority);
      }
    }

    return visibleSetSpanPriorities;
  }, [animated.viewport, canvasPad, innerWidth, viewportWidth, visibleSetIds]);

  const hasHigherPrioritySetSpanVisible = useCallback(
    (ownerSetId: TimelineSetId | null | undefined, ownerPriority?: number) => {
      if (!ownerSetId) {
        return false;
      }

      const comparisonPriority =
        ownerPriority ??
        TIMELINE_SET_SPAN_PRIORITY_BY_ID.get(ownerSetId)?.priority;

      if (comparisonPriority === undefined) {
        return false;
      }

      for (const [setId, priority] of autoToggleVisibleSetSpanPriorities) {
        if (setId !== ownerSetId && priority > comparisonPriority) {
          return true;
        }
      }

      return false;
    },
    [autoToggleVisibleSetSpanPriorities],
  );

  const autoHiddenOverlayIds = useMemo(
    () =>
      getAutoHiddenOverlayIds(
        visibleSetOverlays,
        animated.viewport,
        innerWidth,
        canvasPad,
        visibleSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
        autoToggleVisibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible,
      ),
    [
      animated.viewport,
      autoToggleVisibleOverlayGroupIds,
      autoToggleVisibleGroupIds,
      baseEnabledGroupIds,
      canvasPad,
      hasHigherPrioritySetSpanVisible,
      visibleSetIds,
      innerWidth,
      visibleSetOverlays,
    ],
  );

  const autoHiddenOverlaySignature = useMemo(
    () => Array.from(autoHiddenOverlayIds).sort().join("|"),
    [autoHiddenOverlayIds],
  );
  const autoSuppressedGroupSignature = useMemo(
    () => Array.from(autoSuppressedGroupIds).sort().join("|"),
    [autoSuppressedGroupIds],
  );
  const overlayVisibilityTransitionKey = useMemo(
    () =>
      `${overlayVisibilityTransitionSeed}:${autoSuppressedGroupSignature}:${autoHiddenOverlaySignature}`,
    [
      autoHiddenOverlaySignature,
      autoSuppressedGroupSignature,
      overlayVisibilityTransitionSeed,
    ],
  );

  useEffect(() => {
    const nextAutoSuppressedGroupIds = new Set(autoSuppressedGroupIds);
    let hasSuppressionChanges = false;

    for (const [groupId, rule] of autoToggleRulesByGroupId) {
      const currentlySuppressed = autoSuppressedGroupIds.has(groupId);
      const isAutoToggleEnabled = isTimelineLayerAutoToggleEnabled(
        rule,
        visibleSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
        groupId,
        autoToggleVisibleOverlayGroupIds,
        hasHigherPrioritySetSpanVisible(
          TIMELINE_SET_ID_BY_GROUP_ID.get(groupId),
        ),
      );
      const nextSuppressed = isAutoToggleEnabled
        ? shouldAutoSuppressTimelineLayer(
            rule,
            animated.viewport,
            innerWidth,
            canvasPad,
            currentlySuppressed,
          )
        : false;

      if (nextSuppressed === currentlySuppressed) {
        continue;
      }

      hasSuppressionChanges = true;

      if (nextSuppressed) {
        nextAutoSuppressedGroupIds.add(groupId);
      } else {
        nextAutoSuppressedGroupIds.delete(groupId);
      }
    }

    if (!hasSuppressionChanges) {
      return;
    }

    setAutoSuppressedGroupIds(nextAutoSuppressedGroupIds);
  }, [
    animated.viewport,
    autoSuppressedGroupIds,
    autoToggleRulesByGroupId,
    autoToggleVisibleOverlayGroupIds,
    autoToggleVisibleGroupIds,
    baseEnabledGroupIds,
    canvasPad,
    hasHigherPrioritySetSpanVisible,
    setAutoSuppressedGroupIds,
    visibleSetIds,
    innerWidth,
  ]);

  const renderEnabledGroupIds = useMemo(() => {
    const next = new Set(baseEnabledGroupIds);

    for (const groupId of autoSuppressedGroupIds) {
      if (
        groupId === HUMAN_EVOLUTION_GROUP_ID &&
        humanEvolutionToggleMode !== "auto"
      ) {
        continue;
      }

      next.delete(groupId);
    }

    return next;
  }, [autoSuppressedGroupIds, baseEnabledGroupIds, humanEvolutionToggleMode]);

  const sidebarSuppressedGroupIds = useMemo(() => {
    const next = new Set(autoSuppressedGroupIds);

    if (humanEvolutionToggleMode !== "auto") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    }

    return next;
  }, [autoSuppressedGroupIds, humanEvolutionToggleMode]);

  const prioritizedRootEra = useMemo(
    () => applyTimelineSetOrderToEraTree(ROOT_ERA, orderedSetIds),
    [orderedSetIds],
  );

  const rootDisplayEras = useMemo(
    () => getRootDisplayErasBySets(prioritizedRootEra, visibleSetIds),
    [visibleSetIds, prioritizedRootEra],
  );

  const setFilteredMarkers = useMemo(() => {
    return applyTimelineSetOrderToMarkers(visibleSetMarkers, orderedSetIds);
  }, [visibleSetMarkers, orderedSetIds]);

  const setFilteredOverlays = useMemo(() => {
    return applyTimelineSetOrderToOverlays(visibleSetOverlays, orderedSetIds);
  }, [visibleSetOverlays, orderedSetIds]);

  const visibleFilteredOverlays = useMemo(
    () => filterHiddenOverlayBands(setFilteredOverlays, autoHiddenOverlayIds),
    [autoHiddenOverlayIds, setFilteredOverlays],
  );

  const setFilteredDisplay = useMemo(
    () => ({
      markers: setFilteredMarkers,
      overlays: visibleFilteredOverlays,
    }),
    [setFilteredMarkers, visibleFilteredOverlays],
  );

  const activeEra =
    findEraById(prioritizedRootEra, activeEraId) ?? prioritizedRootEra;
  const rawChain = getAncestorChain(prioritizedRootEra, activeEraId);
  const chain = getEraDisplayChain(prioritizedRootEra, activeEraId);
  const rawParentEra =
    rawChain.length > 1 ? rawChain[rawChain.length - 2] : null;
  const parentEra =
    rawParentEra &&
    rawParentEra.id !== prioritizedRootEra.id &&
    !isEraFamilyRoot(rawParentEra)
      ? rawParentEra
      : null;
  const isTopLevelDisplayEra =
    rawParentEra?.id === prioritizedRootEra.id ||
    (rawParentEra !== null && isEraFamilyRoot(rawParentEra));
  const siblingEras =
    activeEra.id === prioritizedRootEra.id || isTopLevelDisplayEra
      ? rootDisplayEras
      : rawParentEra
        ? (rawParentEra.children ?? [])
        : (activeEra.children ?? []);

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

  const sidebarTree = useMemo(
    () =>
      resolveTimelineSidebarTree(
        setFilteredDisplay,
        animated.viewport,
        innerWidth,
        canvasPad,
        enabledSetIds,
        visibleSetIds,
        baseEnabledGroupIds,
        sidebarSuppressedGroupIds,
        orderedSetIds,
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      canvasPad,
      enabledSetIds,
      visibleSetIds,
      innerWidth,
      orderedSetIds,
      sidebarSuppressedGroupIds,
      setFilteredDisplay,
    ],
  );

  const layerShortcuts = useMemo(
    () => allocateTimelineLayerShortcuts(sidebarTree),
    [sidebarTree],
  );

  const layerRangeByShortcutId = useMemo(() => {
    const setRanges = computeSetYearRanges(sidebarTree.map((set) => set.id));
    const childGroupIds = sidebarTree.flatMap((set) =>
      set.children.flatMap((child) => child.groupIds),
    );
    const groupRanges = computeGroupYearRanges(childGroupIds);
    const ranges = new Map<string, TimelineYearRange>();

    for (const [setId, range] of setRanges) {
      ranges.set(getSetLayerShortcutId(setId), range);
    }

    for (const set of sidebarTree) {
      for (const child of set.children) {
        let childRange: TimelineYearRange | null = null;

        for (const groupId of child.groupIds) {
          const groupRange = groupRanges.get(groupId);

          if (!groupRange) {
            continue;
          }

          childRange = childRange
            ? {
                startYear: Math.min(childRange.startYear, groupRange.startYear),
                endYear: Math.max(childRange.endYear, groupRange.endYear),
              }
            : groupRange;
        }

        if (childRange) {
          ranges.set(getChildLayerShortcutId(child), childRange);
        }
      }
    }

    return ranges;
  }, [sidebarTree]);

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
