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
  filterMarkersBySets,
  filterOverlaysBySets,
  getDefaultEnabledTimelineSetIds,
  getSetIdForEraFamily,
} from "./lib/data/timelineSets";
import { resolveTimelineSidebarTree } from "./lib/data/timelineSidebar";
import { shouldAutoSuppressTimelineLayer } from "./lib/time/timelineLayerAutoToggle";
import {
  getHomeViewport,
  HOME_RANGE,
  worldToScreen,
} from "./lib/time/viewport";
import "./App.css";

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const OVERVIEW_RULER_TIER_HEIGHT = 18;
const OVERVIEW_RULER_MAX_TIERS = 3;
const MIN_STAGE_HEIGHT_FOR_OVERVIEW_RULER = 480;

function App() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [timelineRef, timelineSize] = useElementSize<HTMLDivElement>();
  const innerWidth = Math.max(stageSize.width, 1);
  const animated = useAnimatedViewport(getHomeViewport(1440), innerWidth);
  const [activeEraId, setActiveEraId] = useState(ROOT_ERA.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [overlayVisibilityTransitionKey, setOverlayVisibilityTransitionKey] =
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
    const nextAutoSuppressedGroupIds = new Set(autoSuppressedGroupIds);
    let hasSuppressionChanges = false;
    let shouldBumpOverlayVisibilityKey = false;

    for (const [groupId, rule] of autoToggleRulesByGroupId) {
      const currentlySuppressed = autoSuppressedGroupIds.has(groupId);
      const nextSuppressed = shouldAutoSuppressTimelineLayer(
        rule,
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        currentlySuppressed,
      );

      if (nextSuppressed === currentlySuppressed) {
        continue;
      }

      hasSuppressionChanges = true;

      if (nextSuppressed) {
        nextAutoSuppressedGroupIds.add(groupId);
      } else {
        nextAutoSuppressedGroupIds.delete(groupId);
      }

      if (
        groupId !== HUMAN_EVOLUTION_GROUP_ID ||
        humanEvolutionToggleMode === "auto"
      ) {
        shouldBumpOverlayVisibilityKey = true;
      }
    }

    if (!hasSuppressionChanges && !shouldBumpOverlayVisibilityKey) {
      return;
    }

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      if (hasSuppressionChanges) {
        setAutoSuppressedGroupIds(nextAutoSuppressedGroupIds);
      }

      if (shouldBumpOverlayVisibilityKey) {
        setOverlayVisibilityTransitionKey((current) => current + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    animated.viewport,
    autoSuppressedGroupIds,
    autoToggleRulesByGroupId,
    innerWidth,
    humanEvolutionToggleMode,
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
  }, [
    defaultEnabledGroupIds,
    humanEvolutionToggleMode,
    manualEnabledGroupIds,
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

  const rootDisplayEras = useMemo(
    () => getRootDisplayErasBySets(ROOT_ERA, enabledSetIds),
    [enabledSetIds],
  );

  const setFilteredMarkers = useMemo(
    () => filterMarkersBySets(TIMELINE_DISPLAY.markers, enabledSetIds),
    [enabledSetIds],
  );
  const setFilteredOverlays = useMemo(
    () => filterOverlaysBySets(TIMELINE_DISPLAY.overlays, enabledSetIds),
    [enabledSetIds],
  );
  const setFilteredDisplay = useMemo(
    () => ({
      markers: setFilteredMarkers,
      overlays: setFilteredOverlays,
    }),
    [setFilteredMarkers, setFilteredOverlays],
  );

  const activeEra = findEraById(ROOT_ERA, activeEraId) ?? ROOT_ERA;
  const rawChain = getAncestorChain(ROOT_ERA, activeEraId);
  const chain = getEraDisplayChain(ROOT_ERA, activeEraId);
  const rawParentEra = rawChain.length > 1 ? rawChain[rawChain.length - 2] : null;
  const parentEra =
    rawParentEra &&
    rawParentEra.id !== ROOT_ERA.id &&
    !isEraFamilyRoot(rawParentEra)
      ? rawParentEra
      : null;
  const isTopLevelDisplayEra =
    rawParentEra === ROOT_ERA ||
    (rawParentEra !== null && isEraFamilyRoot(rawParentEra));
  const siblingEras =
    activeEra.id === ROOT_ERA.id || isTopLevelDisplayEra
      ? rootDisplayEras
      : rawParentEra
        ? (rawParentEra.children ?? [])
        : (activeEra.children ?? []);

  // Check if we should auto-collapse when zoomed out
  const checkAutoTransition = useCallback(() => {
    setActiveEraId((currentId) => {
      const era = findEraById(ROOT_ERA, currentId) ?? ROOT_ERA;
      const navigableAncestor = getNavigableAncestor(ROOT_ERA, currentId);

      if (
        currentId === ROOT_ERA.id ||
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
  }, []);

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
    const parent = getNavigableAncestor(ROOT_ERA, activeEraId);

    if (parent && parent.id !== ROOT_ERA.id) {
      setActiveEraId(parent.id);
      animated.animateToRange(parent.startYear, parent.endYear);
    } else {
      // Already at root — go home
      setActiveEraId(ROOT_ERA.id);
      animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1]);
    }
  }, [activeEraId, animated]);

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
      ),
    [
      animated.viewport,
      baseEnabledGroupIds,
      enabledSetIds,
      innerWidth,
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
      setOverlayVisibilityTransitionKey((current) => current + 1);

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
        const activeFamilyId = getEraFamilyId(ROOT_ERA, activeEraId);
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

      setOverlayVisibilityTransitionKey((current) => current + 1);
    },
    [activeEraId, animated],
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
                overlayBands={setFilteredOverlays}
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
