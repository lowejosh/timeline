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
  readStoredEnabledGroupIds,
  readStoredExpandedSetIds,
  readStoredGroupToggleMode,
  readStoredMapPreviewEnabled,
  readStoredSidebarOpen,
  readStoredTimelineSetOrder,
  readStoredVisibleSetIds,
  writeStoredEnabledSetIds,
  writeStoredEnabledGroupIds,
  writeStoredExpandedSetIds,
  writeStoredGroupToggleMode,
  writeStoredMapPreviewEnabled,
  writeStoredSidebarOpen,
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
  TIMELINE_SETS_BY_ID,
  TIMELINE_SET_SPAN_PRIORITY_BY_ID,
} from "../lib/catalog/timelineSets";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "../lib/catalog/layerAutoToggle";
import {
  getVisibleRange,
  getHomeViewport,
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

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
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

function getDefaultGroupIdsForSet(setId: TimelineSetId): string[] {
  const set = TIMELINE_SETS_BY_ID[setId];

  if (!set) {
    return [];
  }

  return set.groups
    .filter((group) => group.defaultEnabled !== false)
    .map((group) => group.id);
}

function shouldStartWithSidebarOpen() {
  const stored = readStoredSidebarOpen();

  if (stored !== null) {
    return stored;
  }

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
  const [isMapPreviewEnabled, setIsMapPreviewEnabled] = useState(() =>
    readStoredMapPreviewEnabled(),
  );
  const [overlayVisibilityTransitionSeed, setOverlayVisibilityTransitionSeed] =
    useState(0);
  const [expandOverlayRequest, setExpandOverlayRequest] = useState<{
    overlayId: string;
    seq: number;
  } | null>(null);
  const expandOverlaySeqRef = useRef(0);
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(),
    [],
  );
  const [manualEnabledGroupIds, setManualEnabledGroupIds] = useState<
    Set<string>
  >(() => readStoredEnabledGroupIds());
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
  useEffect(() => {
    writeStoredMapPreviewEnabled(isMapPreviewEnabled);
  }, [isMapPreviewEnabled]);
  const [orderedSetIds, setOrderedSetIds] = useState<TimelineSetId[]>(() =>
    readStoredTimelineSetOrder(),
  );
  const [expandedSetIds, setExpandedSetIds] = useState<Set<TimelineSetId>>(() =>
    readStoredExpandedSetIds(),
  );
  const [humanEvolutionToggleMode, setHumanEvolutionToggleMode] =
    useState<LayerAutoToggleMode>(() =>
      readStoredGroupToggleMode(HUMAN_EVOLUTION_GROUP_ID),
    );
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

    if (readStoredSidebarOpen() === null) {
      setIsSidebarOpen(
        !shouldUseMobileTimelineDrawer(stageSize.width, stageSize.height),
      );
    }
  }, [stageSize.height, stageSize.width]);

  useEffect(() => {
    writeStoredSidebarOpen(isSidebarOpen);
  }, [isSidebarOpen]);

  useEffect(() => {
    writeStoredTimelineSetOrder(orderedSetIds);
  }, [orderedSetIds]);

  useEffect(() => {
    writeStoredEnabledSetIds(enabledSetIds);
  }, [enabledSetIds]);

  useEffect(() => {
    writeStoredEnabledGroupIds(manualEnabledGroupIds);
  }, [manualEnabledGroupIds]);

  useEffect(() => {
    if (
      !enabledSetIds.has("computing") ||
      manualEnabledGroupIds.has("computer-models")
    ) {
      return;
    }

    setManualEnabledGroupIds((current) => {
      if (current.has("computer-models")) {
        return current;
      }

      const next = new Set(current);
      next.add("computer-models");
      return next;
    });
  }, [enabledSetIds, manualEnabledGroupIds]);

  useEffect(() => {
    writeStoredGroupToggleMode(
      HUMAN_EVOLUTION_GROUP_ID,
      humanEvolutionToggleMode,
    );
  }, [humanEvolutionToggleMode]);

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

  const handleHomeRange = useCallback(() => {
    setActiveEraId(prioritizedRootEra.id);
    animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1], 0);
    scheduleAutoTransitionCheck();
  }, [animated, prioritizedRootEra.id, scheduleAutoTransitionCheck]);

  const handleFullTimelineRange = useCallback(() => {
    setActiveEraId(prioritizedRootEra.id);
    animated.animateToRange(TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR, 0);
    scheduleAutoTransitionCheck();
  }, [animated, prioritizedRootEra.id, scheduleAutoTransitionCheck]);

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
        setExpandedSetIds((current) => {
          if (current.has(shortcut.setId)) {
            return current;
          }

          const next = new Set(current);
          next.add(shortcut.setId);
          return next;
        });

        setVisibleSetIds((current) => {
          if (current.has(shortcut.setId)) {
            return current;
          }

          const next = new Set(current);
          next.add(shortcut.setId);
          return next;
        });
      } else {
        setExpandedSetIds((current) => {
          if (current.has(shortcut.parentSetId)) {
            return current;
          }

          const next = new Set(current);
          next.add(shortcut.parentSetId);
          return next;
        });

        setVisibleSetIds((current) => {
          if (current.has(shortcut.parentSetId)) {
            return current;
          }

          const next = new Set(current);
          next.add(shortcut.parentSetId);
          return next;
        });

        if (shortcut.groupIds.includes(HUMAN_EVOLUTION_GROUP_ID)) {
          setHumanEvolutionToggleMode("manual-on");
        }

        setManualEnabledGroupIds((current) => {
          let changed = false;
          const next = new Set(current);

          for (const groupId of shortcut.groupIds) {
            if (!next.has(groupId)) {
              next.add(groupId);
              changed = true;
            }
          }

          return changed ? next : current;
        });
      }

      setOverlayVisibilityTransitionSeed((current) => current + 1);
      setActiveEraId(prioritizedRootEra.id);

      if (range) {
        animated.animateToRange(range.startYear, range.endYear);
        scheduleAutoTransitionCheck();
      }

      return true;
    },
    [
      animated,
      layerRangeByShortcutId,
      layerShortcuts,
      prioritizedRootEra.id,
      scheduleAutoTransitionCheck,
    ],
  );

  const handleSearchResultSelect = useCallback(
    (result: TimelineSearchResult) => {
      if (result.setId) {
        setVisibleSetIds((current) => {
          if (current.has(result.setId!)) {
            return current;
          }

          const next = new Set(current);
          next.add(result.setId!);
          return next;
        });
      }

      if (result.groupId) {
        if (result.groupId === HUMAN_EVOLUTION_GROUP_ID) {
          setHumanEvolutionToggleMode("manual-on");
        }

        setManualEnabledGroupIds((current) => {
          if (current.has(result.groupId!)) {
            return current;
          }

          const next = new Set(current);
          next.add(result.groupId!);
          return next;
        });
      }

      setOverlayVisibilityTransitionSeed((current) => current + 1);
      setActiveEraId(prioritizedRootEra.id);

      if (result.expandableAsOverlayId) {
        expandOverlaySeqRef.current += 1;
        setExpandOverlayRequest({
          overlayId: result.expandableAsOverlayId,
          seq: expandOverlaySeqRef.current,
        });
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
    [animated, prioritizedRootEra.id, scheduleAutoTransitionCheck],
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

      const addedSetIds = Array.from(nextEnabledSetIds).filter(
        (setId) => !enabledSetIds.has(setId),
      );

      if (addedSetIds.length > 0) {
        setManualEnabledGroupIds((current) => {
          const next = new Set(current);
          let changed = false;

          for (const setId of addedSetIds) {
            for (const groupId of getDefaultGroupIdsForSet(setId)) {
              if (!next.has(groupId)) {
                next.add(groupId);
                changed = true;
              }
            }
          }

          return changed ? next : current;
        });
      }

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
    isMapPreviewEnabled,
    setIsMapPreviewEnabled,
    sidebarTree,
    expandedSetIds,
    layerShortcuts,
    enabledSetIds,
    visibleSetIds,
    orderedSetIds,
    searchEnabledGroupIds: baseEnabledGroupIds,

    // view
    activeView,
    expandOverlayRequest,

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
    handleHomeRange,
    handleFullTimelineRange,
    handleKeyboardNavigationFrame,
    handleKeyboardNavigationEnd,
    handleLayerShortcut,
    handleSearchResultSelect,
    handleReorderSets,
    handleOpenSetManager,
    handleCloseSetManager,
    handleApplySets,
  };
}
