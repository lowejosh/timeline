import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TIMELINE_CANVAS_PAD } from "../rendering/layout/padding";
import { useAnimatedViewport } from "../../hooks/useAnimatedViewport";
import { useElementSize } from "../../hooks/useElementSize";
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
} from "../domain/eras";
import {
  TIMELINE_DECORATION_CATEGORY_IDS,
  TIMELINE_DECORATION_GROUPS,
  getDefaultEnabledTimelineGroupIds,
} from "../catalog/decorations";
import {
  applyTimelineSetOrderToEraTree,
  applyTimelineSetOrderToMarkers,
  applyTimelineSetOrderToOverlays,
  filterMarkersBySets,
  filterOverlaysBySets,
  getDefaultTimelineSetOrder,
  getDefaultEnabledTimelineSetIds,
  getSetIdForEraFamily,
  normalizeTimelineSetOrder,
} from "../catalog/timelineSets";
import { resolveTimelineSidebarTree } from "./sidebarModel";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "../catalog/layerAutoToggle";
import { getAutoHiddenOverlayIds } from "../rendering/overlayRedundancy";
import {
  getHomeViewport,
  HOME_RANGE,
  getVisibleRange,
  worldToScreen,
  type TimelineViewport,
} from "../core/viewport";
import { isTimelineDecorationVisibleAtZoom } from "../rendering/queries/visibility";
import type {
  TimelineMarker,
  TimelineOverlayBand,
} from "../core/timelineTypes";

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const OVERVIEW_RULER_TIER_HEIGHT = 18;
const OVERVIEW_RULER_MAX_TIERS = 3;
const MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER = 480;

const TIMELINE_SET_ORDER_STORAGE_KEY = "timeline:set-order:v1";
const TIMELINE_ENABLED_SET_IDS_STORAGE_KEY = "timeline:enabled-set-ids:v1";
const TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY = "timeline:expanded-set-ids:v1";
const TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY = "timeline:visible-set-ids:v1";
function readStoredVisibleSetIds(): Set<TimelineSetId> {
  if (typeof window === "undefined") {
    return readStoredEnabledSetIds();
  }
  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY,
    );
    if (!storedValue) return readStoredEnabledSetIds();
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return readStoredEnabledSetIds();
    return new Set(
      parsed.filter((id): id is TimelineSetId => typeof id === "string"),
    );
  } catch {
    return readStoredEnabledSetIds();
  }
}

export const TIMELINE_APP_LAYOUT = {
  overviewRulerTierHeight: OVERVIEW_RULER_TIER_HEIGHT,
  overviewRulerMaxTiers: OVERVIEW_RULER_MAX_TIERS,
  canvasPad: TIMELINE_CANVAS_PAD,
} as const;

function addVisibleOverlayGroupIds(
  overlays: TimelineOverlayBand[],
  visibleStart: number,
  visibleEnd: number,
  zoom: number,
  enabledGroupIds: ReadonlySet<string>,
  visibleGroupIds: Set<string>,
) {
  for (const overlay of overlays) {
    if (
      overlay.groupId &&
      enabledGroupIds.has(overlay.groupId) &&
      isTimelineDecorationVisibleAtZoom(overlay, zoom) &&
      overlay.startYear <= visibleEnd &&
      overlay.endYear >= visibleStart
    ) {
      visibleGroupIds.add(overlay.groupId);
    }

    if (overlay.children && overlay.children.length > 0) {
      addVisibleOverlayGroupIds(
        overlay.children,
        visibleStart,
        visibleEnd,
        zoom,
        enabledGroupIds,
        visibleGroupIds,
      );
    }
  }
}

function getVisibleTimelineGroupIds(
  markers: TimelineMarker[],
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledGroupIds: ReadonlySet<string>,
) {
  if (width <= pad * 2) {
    return new Set<string>();
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const visibleGroupIds = new Set<string>();

  for (const marker of markers) {
    if (
      marker.groupId &&
      enabledGroupIds.has(marker.groupId) &&
      isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) &&
      marker.year >= visibleStart &&
      marker.year <= visibleEnd
    ) {
      visibleGroupIds.add(marker.groupId);
    }
  }

  addVisibleOverlayGroupIds(
    overlays,
    visibleStart,
    visibleEnd,
    viewport.zoom,
    enabledGroupIds,
    visibleGroupIds,
  );

  return visibleGroupIds;
}

function filterHiddenOverlayBands(
  overlays: TimelineOverlayBand[],
  hiddenOverlayIds: ReadonlySet<string>,
): TimelineOverlayBand[] {
  return overlays.flatMap((overlay) => {
    if (hiddenOverlayIds.has(overlay.id)) {
      return [];
    }

    return [
      {
        ...overlay,
        children: overlay.children
          ? filterHiddenOverlayBands(overlay.children, hiddenOverlayIds)
          : undefined,
      },
    ];
  });
}

function readStoredTimelineSetOrder() {
  if (typeof window === "undefined") {
    return getDefaultTimelineSetOrder();
  }
  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_SET_ORDER_STORAGE_KEY,
    );
    if (!storedValue) return getDefaultTimelineSetOrder();
    const parsed = JSON.parse(storedValue);
    return normalizeTimelineSetOrder(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : undefined,
    );
  } catch {
    return getDefaultTimelineSetOrder();
  }
}

function readStoredEnabledSetIds(): Set<TimelineSetId> {
  if (typeof window === "undefined") {
    return getDefaultEnabledTimelineSetIds();
  }
  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_ENABLED_SET_IDS_STORAGE_KEY,
    );
    if (!storedValue) return getDefaultEnabledTimelineSetIds();
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return getDefaultEnabledTimelineSetIds();
    return new Set(
      parsed.filter((id): id is TimelineSetId => typeof id === "string"),
    );
  } catch {
    return getDefaultEnabledTimelineSetIds();
  }
}

function readStoredExpandedSetIds(): Set<TimelineSetId> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const storedValue = window.localStorage.getItem(
      TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY,
    );
    if (!storedValue) return new Set();
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((id): id is TimelineSetId => typeof id === "string"),
    );
  } catch {
    return new Set();
  }
}

export function useTimelineAppState() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const animated = useAnimatedViewport(getHomeViewport(1440), innerWidth);

  const [activeView, setActiveView] = useState<"timeline" | "available-sets">(
    "timeline",
  );
  const [activeEraId, setActiveEraId] = useState(ROOT_ERA.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      try {
        window.localStorage.setItem(
          TIMELINE_VISIBLE_SET_IDS_STORAGE_KEY,
          JSON.stringify(Array.from(visibleSetIds)),
        );
      } catch {
        // Ignore storage failures; state still works in memory.
      }
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
  const innerWidthRef = useRef(innerWidth);
  useEffect(() => {
    viewportRef.current = animated.viewport;
    innerWidthRef.current = innerWidth;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TIMELINE_SET_ORDER_STORAGE_KEY,
        JSON.stringify(normalizeTimelineSetOrder(orderedSetIds)),
      );
    } catch {
      // Ignore storage failures; order still works in memory.
    }
  }, [orderedSetIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TIMELINE_ENABLED_SET_IDS_STORAGE_KEY,
        JSON.stringify(Array.from(enabledSetIds)),
      );
    } catch {
      // Ignore storage failures; state still works in memory.
    }
  }, [enabledSetIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TIMELINE_EXPANDED_SET_IDS_STORAGE_KEY,
        JSON.stringify(Array.from(expandedSetIds)),
      );
    } catch {
      // Ignore storage failures; state still works in memory.
    }
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

  const autoToggleVisibleGroupIds = useMemo(
    () =>
      getVisibleTimelineGroupIds(
        filterMarkersBySets(TIMELINE_DISPLAY.markers, visibleSetIds),
        filterOverlaysBySets(TIMELINE_DISPLAY.overlays, visibleSetIds),
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        baseEnabledGroupIds,
      ),
    [animated.viewport, baseEnabledGroupIds, visibleSetIds, innerWidth],
  );

  const autoHiddenOverlayIds = useMemo(
    () =>
      getAutoHiddenOverlayIds(
        filterOverlaysBySets(TIMELINE_DISPLAY.overlays, visibleSetIds),
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        visibleSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
      ),
    [
      animated.viewport,
      autoToggleVisibleGroupIds,
      baseEnabledGroupIds,
      visibleSetIds,
      innerWidth,
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
      );
      const nextSuppressed = isAutoToggleEnabled
        ? shouldAutoSuppressTimelineLayer(
            rule,
            animated.viewport,
            innerWidth,
            TIMELINE_CANVAS_PAD,
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
    autoToggleVisibleGroupIds,
    baseEnabledGroupIds,
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
    const filteredMarkers = filterMarkersBySets(
      TIMELINE_DISPLAY.markers,
      visibleSetIds,
    );

    return applyTimelineSetOrderToMarkers(filteredMarkers, orderedSetIds);
  }, [visibleSetIds, orderedSetIds]);

  const setFilteredOverlays = useMemo(() => {
    const filteredOverlays = filterOverlaysBySets(
      TIMELINE_DISPLAY.overlays,
      visibleSetIds,
    );

    return applyTimelineSetOrderToOverlays(filteredOverlays, orderedSetIds);
  }, [visibleSetIds, orderedSetIds]);

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
    setActiveEraId((currentId) => {
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
        worldToScreen(era.endYear, viewportRef.current, innerWidthRef.current) -
          worldToScreen(
            era.startYear,
            viewportRef.current,
            innerWidthRef.current,
          ),
      );
      const fillRatio = eraPixelWidth / innerWidthRef.current;

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
      animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1]);
    }
  }, [activeEraId, animated, prioritizedRootEra]);

  const sidebarTree = useMemo(
    () =>
      resolveTimelineSidebarTree(
        setFilteredDisplay,
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        enabledSetIds,
        visibleSetIds,
        baseEnabledGroupIds,
        sidebarSuppressedGroupIds,
        orderedSetIds,
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      enabledSetIds,
      visibleSetIds,
      innerWidth,
      orderedSetIds,
      sidebarSuppressedGroupIds,
      setFilteredDisplay,
    ],
  );

  const handleToggleEntry = useCallback(
    (entryId: string, groupIds: string[], nextEnabled: boolean) => {
      void entryId;
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
          animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1]);
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
    setIsSidebarOpen(true);
  }, []);

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
        animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1]);
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
      setIsSidebarOpen(true);
    },
    [activeEraId, animated, enabledSetIds, prioritizedRootEra],
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
    orderedSetIds,

    // view
    activeView,

    // handlers
    handleZoom,
    handleViewportChange,
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
