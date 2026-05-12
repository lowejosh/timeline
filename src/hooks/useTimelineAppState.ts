import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAnimatedViewport } from "./useAnimatedViewport";
import { getTimelineCanvasPad } from "../lib/rendering/layout/padding";
import { useElementSize } from "./useElementSize";
import { resolveTimelineSidebarTree } from "../lib/app/sidebarModel";
import { getAutoHiddenOverlayIds } from "../lib/rendering/overlayRedundancy";
import {
  MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER,
  shouldUseMobileTimelineDrawer,
} from "../lib/app/layout";
import {
  filterHiddenOverlayBands,
  getVisibleTimelineOverlayGroupIdsWithViewportEdges,
  getVisibleTimelineGroupIds,
} from "../lib/app/timelineVisibility";
import {
  readStoredEnabledSetIds,
  readStoredExpandedSetIds,
  readStoredTimelineSetOrder,
  readStoredVisibleSetIds,
  writeStoredEnabledSetIds,
  writeStoredExpandedSetIds,
  writeStoredTimelineSetOrder,
  writeStoredVisibleSetIds,
} from "../lib/app/timelineSetStorage";
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
  TIMELINE_DECORATION_CATEGORY_IDS,
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
  normalizeTimelineSetOrder,
  TIMELINE_SET_ID_BY_GROUP_ID,
  TIMELINE_SET_SPAN_PRIORITY_BY_ID,
} from "../lib/catalog/timelineSets";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "../lib/catalog/layerAutoToggle";
import {
  getVisibleRange,
  getHomeViewport,
  HOME_RANGE,
  worldToScreen,
  type TimelineViewport,
} from "../lib/core/viewport";

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;

function shouldStartWithSidebarOpen() {
  if (typeof window === "undefined") {
    return true;
  }

  return !shouldUseMobileTimelineDrawer(window.innerWidth, window.innerHeight);
}

export function useTimelineAppState() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const canvasPad = getTimelineCanvasPad(stageSize.width, stageSize.height);
  const viewportWidth = Math.max(innerWidth - canvasPad * 2, 1);
  const animated = useAnimatedViewport(
    getHomeViewport(Math.max(1440 - canvasPad * 2, 1)),
    viewportWidth,
  );

  const [activeView, setActiveView] = useState<"timeline" | "available-sets">(
    "timeline",
  );
  const [activeEraId, setActiveEraId] = useState(ROOT_ERA.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    shouldStartWithSidebarOpen(),
  );
  const [isCosmicCalendarMode, setIsCosmicCalendarMode] = useState(false);
  const [overlayVisibilityTransitionSeed, setOverlayVisibilityTransitionSeed] =
    useState(0);
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(),
    [],
  );
  const [manualEnabledGroupIds, setManualEnabledGroupIds] = useState<
    Set<string>
  >(() => getDefaultEnabledTimelineGroupIds());
  const [enabledSetIds, setEnabledSetIds] = useState<Set<TimelineSetId>>(() =>
    readStoredEnabledSetIds(),
  );
  // Separate from enabledSetIds (library membership): which collected sets are
  // currently rendering on the timeline. Toggled from the sidebar.
  const [visibleSetIds, setVisibleSetIds] = useState<Set<TimelineSetId>>(() =>
    readStoredVisibleSetIds(),
  );
  useEffect(() => {
    writeStoredVisibleSetIds(visibleSetIds);
  }, [visibleSetIds]);
  const [orderedSetIds, setOrderedSetIds] = useState<TimelineSetId[]>(() =>
    readStoredTimelineSetOrder(),
  );
  const [expandedSetIds, setExpandedSetIds] = useState<Set<TimelineSetId>>(() =>
    readStoredExpandedSetIds(),
  );
  const [humanEvolutionToggleMode, setHumanEvolutionToggleMode] =
    useState<LayerAutoToggleMode>("auto");
  const [autoSuppressedGroupIds, setAutoSuppressedGroupIds] = useState<
    Set<string>
  >(() => new Set());
  const autoTransitionFrameRef = useRef(0);
  const hasResolvedInitialSidebarVisibilityRef = useRef(false);

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
    if (
      hasResolvedInitialSidebarVisibilityRef.current ||
      stageSize.width <= 0 ||
      stageSize.height <= 0
    ) {
      return;
    }

    hasResolvedInitialSidebarVisibilityRef.current = true;
    setIsSidebarOpen(
      !shouldUseMobileTimelineDrawer(stageSize.width, stageSize.height),
    );
  }, [stageSize.height, stageSize.width]);

  useEffect(() => {
    writeStoredTimelineSetOrder(orderedSetIds);
  }, [orderedSetIds]);

  useEffect(() => {
    writeStoredEnabledSetIds(enabledSetIds);
  }, [enabledSetIds]);

  useEffect(() => {
    writeStoredExpandedSetIds(expandedSetIds);
  }, [expandedSetIds]);

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
  }, [
    animated.viewport,
    canvasPad,
    innerWidth,
    viewportWidth,
    visibleSetIds,
  ]);

  const hasHigherPrioritySetSpanVisible = useCallback(
    (
      ownerSetId: TimelineSetId | null | undefined,
      ownerPriority?: number,
    ) => {
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
    setActiveEraId((currentId: string) => {
      const era =
        findEraById(prioritizedRootEra, currentId) ?? prioritizedRootEra;
      const navigableAncestor = getNavigableAncestor(
        prioritizedRootEra,
        currentId,
      );

      if (
        currentId === prioritizedRootEra.id ||
        isEraFamilyRoot(era) ||
        !navigableAncestor
      ) {
        return currentId;
      }

      const eraPixelWidth = Math.abs(
        worldToScreen(
          era.endYear,
          viewportRef.current,
          viewportWidthRef.current,
        ) -
          worldToScreen(
            era.startYear,
            viewportRef.current,
            viewportWidthRef.current,
          ),
      );
      const fillRatio = eraPixelWidth / viewportWidthRef.current;

      if (fillRatio < 0.45) {
        return navigableAncestor.id;
      }

      return currentId;
    });
  }, [prioritizedRootEra]);

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
    [animated],
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
  }, [activeEraId, animated, prioritizedRootEra]);

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

  const handleToggleEntry = useCallback(
    (groupIds: string[], nextEnabled: boolean) => {
      if (groupIds.includes(HUMAN_EVOLUTION_GROUP_ID)) {
        setHumanEvolutionToggleMode(nextEnabled ? "manual-on" : "manual-off");
      }
      setOverlayVisibilityTransitionSeed((current) => current + 1);

      setManualEnabledGroupIds((current) => {
        const next = new Set(current);

        for (const groupId of groupIds) {
          if (nextEnabled) {
            next.add(groupId);
          } else {
            next.delete(groupId);
          }
        }

        return next;
      });
    },
    [],
  );

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

      setVisibleSetIds((current) => {
        const next = new Set(current);

        if (nextEnabled) {
          next.add(setId);
        } else {
          next.delete(setId);
        }

        return next;
      });

      setOverlayVisibilityTransitionSeed((current) => current + 1);
    },
    [activeEraId, animated, prioritizedRootEra],
  );

  const handleToggleSetExpanded = useCallback(
    (setId: TimelineSetId, nextExpanded: boolean) => {
      setExpandedSetIds((current) => {
        const next = new Set(current);

        if (nextExpanded) {
          next.add(setId);
        } else {
          next.delete(setId);
        }

        return next;
      });
    },
    [],
  );

  const handleOpenSetManager = useCallback(() => {
    setIsSidebarOpen(false);
    setActiveView("available-sets");
  }, []);

  const handleCloseSetManager = useCallback(() => {
    setActiveView("timeline");
    setIsSidebarOpen(
      !shouldUseMobileTimelineDrawer(stageSize.width, stageSize.height),
    );
  }, [stageSize.height, stageSize.width]);

  const handleApplySets = useCallback(
    (
      nextEnabledSetIds: Set<TimelineSetId>,
      nextOrderedSetIds: TimelineSetId[],
    ) => {
      // Mirror the safety logic from handleToggleSet: if the active era belongs
      // to a set that is being disabled, navigate back to the root.
      const activeFamilyId = getEraFamilyId(prioritizedRootEra, activeEraId);
      const activeSetId = activeFamilyId
        ? getSetIdForEraFamily(activeFamilyId)
        : null;
      const normalizedNextOrder = normalizeTimelineSetOrder(nextOrderedSetIds);

      if (activeSetId && !nextEnabledSetIds.has(activeSetId)) {
        setActiveEraId(ROOT_ERA.id);
        animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
      }

      // Sync visibleSetIds: remove sets removed from library, add newly
      // added sets as visible by default. Keep existing visibility choices.
      const prevEnabledSetIds = enabledSetIds;
      setVisibleSetIds((currentVisible) => {
        const next = new Set(currentVisible);
        for (const id of next) {
          if (!nextEnabledSetIds.has(id)) next.delete(id);
        }
        for (const id of nextEnabledSetIds) {
          if (!prevEnabledSetIds.has(id)) next.add(id);
        }
        return next;
      });

      setEnabledSetIds(new Set(nextEnabledSetIds));
      setOrderedSetIds((current) => {
        const normalizedCurrent = normalizeTimelineSetOrder(current);

        if (
          normalizedCurrent.length === normalizedNextOrder.length &&
          normalizedCurrent.every(
            (setId, index) => setId === normalizedNextOrder[index],
          )
        ) {
          return current;
        }

        return normalizedNextOrder;
      });
      setOverlayVisibilityTransitionSeed((current) => current + 1);
      setActiveView("timeline");
      setIsSidebarOpen(
        !shouldUseMobileTimelineDrawer(stageSize.width, stageSize.height),
      );
    },
    [
      activeEraId,
      animated,
      enabledSetIds,
      prioritizedRootEra,
      stageSize.height,
      stageSize.width,
    ],
  );

  const handleReorderSets = useCallback((nextOrder: TimelineSetId[]) => {
    setOrderedSetIds((current) => {
      const normalizedCurrent = normalizeTimelineSetOrder(current);
      const normalizedNext = normalizeTimelineSetOrder(nextOrder);

      if (
        normalizedCurrent.length === normalizedNext.length &&
        normalizedCurrent.every(
          (setId, index) => setId === normalizedNext[index],
        )
      ) {
        return current;
      }

      return normalizedNext;
    });
  }, []);

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

    // sidebar
    isSidebarOpen,
    setIsSidebarOpen,
    isCosmicCalendarMode,
    setIsCosmicCalendarMode,
    sidebarTree,
    expandedSetIds,
    enabledSetIds,
    visibleSetIds,
    orderedSetIds,

    // view
    activeView,

    // handlers
    handleZoom,
    handleViewportChange,
    handleContinuousViewportChange,
    handleViewportGestureStart,
    handleViewportGestureEnd,
    handleDrillIntoEra,
    handleNavigateUp,
    handleToggleEntry,
    handleToggleSet,
    handleToggleSetExpanded,
    handleReorderSets,
    handleOpenSetManager,
    handleCloseSetManager,
    handleApplySets,
  };
}
