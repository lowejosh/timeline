import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TimelineCanvas,
  TIMELINE_CANVAS_PAD,
} from "./components/timeline/TimelineCanvas";
import { TimelineDisclaimer } from "./components/chrome/TimelineDisclaimer";
import { TimelineSidebar } from "./components/chrome/TimelineSidebar";
import { TimelineOverviewRulerStack } from "./components/timeline/TimelineOverviewRulerStack";
import { useAnimatedViewport } from "./hooks/useAnimatedViewport";
import { useElementSize } from "./hooks/useElementSize";
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
} from "./lib/data/eras";
import {
  TIMELINE_DECORATION_CATEGORY_IDS,
  TIMELINE_DECORATION_GROUPS,
  getDefaultEnabledTimelineGroupIds,
} from "./lib/data/timelineDecorations";
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
} from "./lib/data/timelineSets";
import { resolveTimelineSidebarTree } from "./lib/data/timelineSidebar";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressTimelineLayer,
} from "./lib/time/timelineLayerAutoToggle";
import { getAutoHiddenOverlayIds } from "./lib/time/overlayRedundancy";
import {
  getHomeViewport,
  HOME_RANGE,
  getVisibleRange,
  worldToScreen,
} from "./lib/time/viewport";
import { isTimelineDecorationVisibleAtZoom } from "./lib/time/overlayTracks";
import type {
  TimelineMarker,
  TimelineOverlayBand,
} from "./lib/data/timelineTypes";
import "./App.css";

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const OVERVIEW_RULER_TIER_HEIGHT = 18;
const OVERVIEW_RULER_MAX_TIERS = 3;
const MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER = 480;
const TIMELINE_SET_ORDER_STORAGE_KEY = "timeline:set-order:v1";

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
  viewport: import("./lib/time/viewport").TimelineViewport,
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

    if (!storedValue) {
      return getDefaultTimelineSetOrder();
    }

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

function App() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const animated = useAnimatedViewport(getHomeViewport(1440), innerWidth);
  const [activeEraId, setActiveEraId] = useState(ROOT_ERA.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [overlayVisibilityTransitionSeed, setOverlayVisibilityTransitionSeed] =
    useState(0);
  const defaultEnabledGroupIds = useMemo(
    () => getDefaultEnabledTimelineGroupIds(),
    [],
  );
  const [manualEnabledGroupIds, setManualEnabledGroupIds] = useState<
    Set<string>
  >(() => getDefaultEnabledTimelineGroupIds());
  // Backend-only set enablement. No UI controls yet; all sets enabled by
  // default so the visible app matches prior behavior. Future community/custom
  // overlays will flip entries in this set to hide whole content families.
  const [enabledSetIds, setEnabledSetIds] = useState<Set<TimelineSetId>>(() =>
    getDefaultEnabledTimelineSetIds(),
  );
  const [orderedSetIds, setOrderedSetIds] = useState<TimelineSetId[]>(() =>
    readStoredTimelineSetOrder(),
  );
  const [expandedSetIds, setExpandedSetIds] = useState<Set<TimelineSetId>>(
    () => new Set(),
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

  // Use refs for values needed in RAF callbacks to avoid stale closures
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
      // Ignore storage failures, the sidebar can still work with in-memory order.
    }
  }, [orderedSetIds]);

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
  }, [
    defaultEnabledGroupIds,
    humanEvolutionToggleMode,
    manualEnabledGroupIds,
  ]);

  const autoToggleVisibleGroupIds = useMemo(
    () =>
      getVisibleTimelineGroupIds(
        filterMarkersBySets(TIMELINE_DISPLAY.markers, enabledSetIds),
        filterOverlaysBySets(TIMELINE_DISPLAY.overlays, enabledSetIds),
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        baseEnabledGroupIds,
      ),
    [animated.viewport, baseEnabledGroupIds, enabledSetIds, innerWidth],
  );

  const autoHiddenOverlayIds = useMemo(
    () =>
      getAutoHiddenOverlayIds(
        filterOverlaysBySets(TIMELINE_DISPLAY.overlays, enabledSetIds),
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        enabledSetIds,
        baseEnabledGroupIds,
        autoToggleVisibleGroupIds,
      ),
    [
      animated.viewport,
      autoToggleVisibleGroupIds,
      baseEnabledGroupIds,
      enabledSetIds,
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
        enabledSetIds,
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
    enabledSetIds,
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
    () => getRootDisplayErasBySets(prioritizedRootEra, enabledSetIds),
    [enabledSetIds, prioritizedRootEra],
  );

  const setFilteredMarkers = useMemo(() => {
    const filteredMarkers = filterMarkersBySets(
      TIMELINE_DISPLAY.markers,
      enabledSetIds,
    );

    return applyTimelineSetOrderToMarkers(filteredMarkers, orderedSetIds);
  }, [enabledSetIds, orderedSetIds]);
  const setFilteredOverlays = useMemo(() => {
    const filteredOverlays = filterOverlaysBySets(
      TIMELINE_DISPLAY.overlays,
      enabledSetIds,
    );

    return applyTimelineSetOrderToOverlays(filteredOverlays, orderedSetIds);
  }, [enabledSetIds, orderedSetIds]);
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

  const activeEra = findEraById(prioritizedRootEra, activeEraId) ?? prioritizedRootEra;
  const rawChain = getAncestorChain(prioritizedRootEra, activeEraId);
  const chain = getEraDisplayChain(prioritizedRootEra, activeEraId);
  const rawParentEra = rawChain.length > 1 ? rawChain[rawChain.length - 2] : null;
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

  // Check if we should auto-collapse when zoomed out
  const checkAutoTransition = useCallback(() => {
    setActiveEraId((currentId) => {
      const era = findEraById(prioritizedRootEra, currentId) ?? prioritizedRootEra;
      const navigableAncestor = getNavigableAncestor(prioritizedRootEra, currentId);

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

      // Auto-collapse: if drilled in and era is too small, go back to parent
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
    (
      updater: (
        current: import("./lib/time/viewport").TimelineViewport,
      ) => import("./lib/time/viewport").TimelineViewport,
    ) => {
      animated.updateViewport(updater);
      scheduleAutoTransitionCheck();
    },
    [animated, scheduleAutoTransitionCheck],
  );

  const handleDrillIntoEra = useCallback(
    (era: Era) => {
      setActiveEraId(era.id);
      // Zoom tight enough that era overfills viewport, ensuring childOpacity=1
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
      // Already at root — go home
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
        baseEnabledGroupIds,
        sidebarSuppressedGroupIds,
        orderedSetIds,
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      enabledSetIds,
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

      setEnabledSetIds((current) => {
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

  const handleReorderSets = useCallback((nextOrder: TimelineSetId[]) => {
    setOrderedSetIds((current) => {
      const normalizedCurrent = normalizeTimelineSetOrder(current);
      const normalizedNext = normalizeTimelineSetOrder(nextOrder);

      if (
        normalizedCurrent.length === normalizedNext.length &&
        normalizedCurrent.every((setId, index) => setId === normalizedNext[index])
      ) {
        return current;
      }

      return normalizedNext;
    });
  }, []);

  const isOverviewVisible = stageSize.height >= MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER;
  const mainCanvasHeight = Math.max(
    timelineSize.height > 0 ? timelineSize.height : stageSize.height,
    1,
  );

  return (
    <main
      className="app-shell"
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
    >
      <TimelineDisclaimer />
      <button
        aria-controls="timeline-layers-panel"
        aria-expanded={isSidebarOpen}
        aria-label={
          isSidebarOpen ? "Hide layers controls" : "Show layers controls"
        }
        className="timeline-sidebar-toggle"
        onClick={() => {
          setIsSidebarOpen((current) => !current);
        }}
        type="button"
      >
        <span aria-hidden="true" className="timeline-sidebar-toggle__glyph" />
        <span className="timeline-sidebar-toggle__label">Layers</span>
      </button>
      <div
        aria-hidden={!isSidebarOpen}
        className="timeline-sidebar-shell"
        data-open={isSidebarOpen ? "true" : "false"}
        id="timeline-layers-panel"
      >
        <TimelineSidebar
          expandedSetIds={expandedSetIds}
          onReorderSets={handleReorderSets}
          onToggleSet={handleToggleSet}
          onToggleSetExpanded={handleToggleSetExpanded}
          sets={sidebarTree}
          onToggleEntry={handleToggleEntry}
        />
      </div>
      <section className="app-stage" ref={stageRef}>
        {stageSize.width > 0 && stageSize.height > 0 ? (
          <div className="app-stage__stack">
            <div className="app-stage__timeline" ref={timelineRef}>
              <TimelineCanvas
                height={mainCanvasHeight}
                viewport={animated.viewport}
                width={stageSize.width}
                activeEra={activeEra}
                activeChain={chain}
                siblingEras={siblingEras}
                markers={setFilteredMarkers}
                overlayBands={visibleFilteredOverlays}
                enabledGroupIds={renderEnabledGroupIds}
                overlayVisibilityTransitionKey={overlayVisibilityTransitionKey}
                parentEra={parentEra}
                isAnimating={animated.isAnimating}
                onViewportChange={handleViewportChange}
                onAnimateZoom={handleZoom}
                onAnimateToRange={animated.animateToRange}
                onDrillIntoEra={handleDrillIntoEra}
                onNavigateUp={handleNavigateUp}
                onRecordDragSample={animated.recordDragSample}
                onReleaseMomentum={animated.releaseMomentum}
              />
            </div>
            {isOverviewVisible ? (
              <div className="app-stage__overview">
                <TimelineOverviewRulerStack
                  eras={rootDisplayEras}
                  mainInnerWidth={Math.max(
                    stageSize.width - TIMELINE_CANVAS_PAD * 2,
                    1,
                  )}
                  onViewportChange={handleViewportChange}
                  pad={TIMELINE_CANVAS_PAD}
                  tierHeight={OVERVIEW_RULER_TIER_HEIGHT}
                  tierOptions={{
                    maxTiers: OVERVIEW_RULER_MAX_TIERS,
                  }}
                  viewport={animated.viewport}
                  width={stageSize.width}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default App;
