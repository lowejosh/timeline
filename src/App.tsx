import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TimelineCanvas,
  TIMELINE_CANVAS_PAD,
} from "./components/timeline/TimelineCanvas";
import { TimelineSidebar } from "./components/chrome/TimelineSidebar";
import { useAnimatedViewport } from "./hooks/useAnimatedViewport";
import { useElementSize } from "./hooks/useElementSize";
import {
  ROOT_ERA,
  TIMELINE_DISPLAY,
  findEraById,
  getAncestorChain,
  type Era,
} from "./lib/data/eras";
import {
  TIMELINE_DECORATION_CATEGORY_IDS,
  getDefaultEnabledTimelineGroupIds,
} from "./lib/data/timelineDecorations";
import { resolveTimelineSidebarSections } from "./lib/data/timelineSidebar";
import {
  shouldAutoSuppressCivilizations,
  shouldAutoSuppressHumanEvolution,
} from "./lib/time/timelineLayerAutoToggle";
import {
  getHomeViewport,
  HOME_RANGE,
  worldToScreen,
} from "./lib/time/viewport";
import "./App.css";

type LayerAutoToggleMode = "auto" | "manual-on" | "manual-off";

const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const CIVILIZATIONS_GROUP_ID = TIMELINE_DECORATION_CATEGORY_IDS.civilizations;

function App() {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
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
  const [humanEvolutionToggleMode, setHumanEvolutionToggleMode] =
    useState<LayerAutoToggleMode>("auto");
  const [isHumanEvolutionAutoSuppressed, setIsHumanEvolutionAutoSuppressed] =
    useState(false);
  const [isCivilizationsAutoHidden, setIsCivilizationsAutoHidden] =
    useState(false);
  const autoTransitionFrameRef = useRef(0);

  // Use refs for values needed in RAF callbacks to avoid stale closures
  const viewportRef = useRef(animated.viewport);
  const innerWidthRef = useRef(innerWidth);
  useEffect(() => {
    viewportRef.current = animated.viewport;
    innerWidthRef.current = innerWidth;
  });

  useEffect(() => {
    const nextHumanEvolutionSuppressed = shouldAutoSuppressHumanEvolution(
      animated.viewport,
      innerWidth,
      TIMELINE_CANVAS_PAD,
      isHumanEvolutionAutoSuppressed,
    );
    const nextCivilizationsSuppressed = shouldAutoSuppressCivilizations(
      animated.viewport,
      innerWidth,
      TIMELINE_CANVAS_PAD,
      isCivilizationsAutoHidden,
    );
    let shouldBumpOverlayVisibilityKey = false;

    if (nextHumanEvolutionSuppressed !== isHumanEvolutionAutoSuppressed) {
      setIsHumanEvolutionAutoSuppressed(nextHumanEvolutionSuppressed);

      if (humanEvolutionToggleMode === "auto") {
        shouldBumpOverlayVisibilityKey = true;
      }
    }

    if (nextCivilizationsSuppressed !== isCivilizationsAutoHidden) {
      setIsCivilizationsAutoHidden(nextCivilizationsSuppressed);
      shouldBumpOverlayVisibilityKey = true;
    }

    if (shouldBumpOverlayVisibilityKey) {
      setOverlayVisibilityTransitionKey((current) => current + 1);
    }
  }, [
    animated.viewport,
    innerWidth,
    isCivilizationsAutoHidden,
    humanEvolutionToggleMode,
    isHumanEvolutionAutoSuppressed,
  ]);

  const enabledGroupIds = useMemo(() => {
    const next = new Set(manualEnabledGroupIds);

    if (humanEvolutionToggleMode === "manual-on") {
      next.add(HUMAN_EVOLUTION_GROUP_ID);
    } else if (humanEvolutionToggleMode === "manual-off") {
      next.delete(HUMAN_EVOLUTION_GROUP_ID);
    } else if (defaultEnabledGroupIds.has(HUMAN_EVOLUTION_GROUP_ID)) {
      if (isHumanEvolutionAutoSuppressed) {
        next.delete(HUMAN_EVOLUTION_GROUP_ID);
      } else {
        next.add(HUMAN_EVOLUTION_GROUP_ID);
      }
    }

    if (defaultEnabledGroupIds.has(CIVILIZATIONS_GROUP_ID)) {
      if (manualEnabledGroupIds.has(CIVILIZATIONS_GROUP_ID)) {
        next.add(CIVILIZATIONS_GROUP_ID);
      } else {
        next.delete(CIVILIZATIONS_GROUP_ID);
      }
    }

    return next;
  }, [
    defaultEnabledGroupIds,
    humanEvolutionToggleMode,
    isHumanEvolutionAutoSuppressed,
    manualEnabledGroupIds,
  ]);

  const renderEnabledGroupIds = useMemo(() => {
    const next = new Set(enabledGroupIds);

    if (isCivilizationsAutoHidden && next.has(CIVILIZATIONS_GROUP_ID)) {
      next.delete(CIVILIZATIONS_GROUP_ID);
    }

    return next;
  }, [enabledGroupIds, isCivilizationsAutoHidden]);

  const activeEra = findEraById(ROOT_ERA, activeEraId) ?? ROOT_ERA;
  const chain = getAncestorChain(ROOT_ERA, activeEraId);
  const parentEra = chain.length > 1 ? chain[chain.length - 2] : null;
  // Sibling eras: the children of the parent (or root's children if at root)
  const siblingEras = parentEra
    ? (parentEra.children ?? [])
    : (activeEra.children ?? []);

  // Check if we should auto-collapse when zoomed out
  const checkAutoTransition = useCallback(() => {
    setActiveEraId((currentId) => {
      const era = findEraById(ROOT_ERA, currentId) ?? ROOT_ERA;
      const ch = getAncestorChain(ROOT_ERA, currentId);
      if (ch.length <= 1 || currentId === ROOT_ERA.id) return currentId;

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
        return ch[ch.length - 2].id;
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
    const chain = getAncestorChain(ROOT_ERA, activeEraId);
    if (chain.length > 1) {
      // Go up one level
      const parent = chain[chain.length - 2];
      setActiveEraId(parent.id);
      animated.animateToRange(parent.startYear, parent.endYear);
    } else {
      // Already at root — go home
      animated.animateToRange(HOME_RANGE[0], HOME_RANGE[1]);
    }
  }, [activeEraId, animated]);

  const sidebarSections = useMemo(
    () =>
      resolveTimelineSidebarSections(
        TIMELINE_DISPLAY,
        animated.viewport,
        innerWidth,
        TIMELINE_CANVAS_PAD,
        enabledGroupIds,
        isCivilizationsAutoHidden
          ? new Set([CIVILIZATIONS_GROUP_ID])
          : new Set(),
      ),
    [animated.viewport, enabledGroupIds, innerWidth, isCivilizationsAutoHidden],
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

  return (
    <main
      className="app-shell"
      data-sidebar-open={isSidebarOpen ? "true" : "false"}
    >
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
          sections={sidebarSections}
          onToggleEntry={handleToggleEntry}
        />
      </div>
      <section className="app-stage" ref={stageRef}>
        {stageSize.width > 0 && stageSize.height > 0 ? (
          <TimelineCanvas
            height={stageSize.height}
            viewport={animated.viewport}
            width={stageSize.width}
            activeEra={activeEra}
            activeChain={chain}
            siblingEras={siblingEras}
            markers={TIMELINE_DISPLAY.markers}
            overlayBands={TIMELINE_DISPLAY.overlays}
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
        ) : null}
      </section>
    </main>
  );
}

export default App;
