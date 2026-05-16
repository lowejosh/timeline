import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import {
  deriveExpandedOverlayIds,
  useExpandedOverlayAnimation,
} from "./animation/useExpandedOverlayAnimation";
import { useOverlayBandAnimation } from "./animation/useOverlayBandAnimation";
import { useMarkerPriorityBoost } from "./animation/useMarkerPriorityBoost";
import type { Era } from "@/lib/catalog/eras";
import { useTimelineCanvasScene } from "./scene/useTimelineCanvasScene";
import { useEraChildAnimation } from "./animation/useEraChildAnimation";
import { useAxisTickAnimation } from "./animation/useAxisTickAnimation";
import { useCanvasBackingStore } from "./platform/useCanvasBackingStore";
import { useViewportInteractionState } from "./interactions/useViewportInteractionState";
import { useEdgeRailInteraction } from "./interactions/useEdgeRailInteraction";
import { TimelineTooltip } from "./ui/TimelineTooltip";
import { useWheelZoomPan } from "./interactions/useWheelZoomPan";
import { useTouchGestures } from "./interactions/useTouchGestures";
import { EdgeZoomZones } from "./ui/EdgeZoomZones";
import { drawTimelineCanvasFrame } from "./rendering/drawTimelineCanvasFrame";
import type {
  HoverRegion,
  OverlayInteractionRegion,
} from "@/lib/rendering/canvas/draw/drawContext";
import type { PrimordialDetailStripSegment } from "@/lib/rendering/canvas/primordial";
import { findEraAtYear } from "@/lib/rendering/canvas/overlayLayout";
import {
  CLICK_DRAG_THRESHOLD,
  TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
  TOOLTIP_EXIT_DURATION_MS,
} from "@/lib/rendering/canvas/constants";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "@/lib/rendering/tooltipRetention";
import {
  isEquivalentHoveredTooltip,
  type HoveredTooltipState,
  type RenderedTooltipState,
} from "@/lib/rendering/canvas/tooltip";
import {
  screenToWorld,
  panByPixels,
  zoomAtPosition,
} from "@/lib/core/viewport";
import {
  createTimelinePerfStats,
  createTimelineVerboseStats,
  getTimelinePerfMode,
  incrementCounter,
  type TimelinePerfMode,
  type TimelinePerfStats,
  type TimelineVerboseStats,
} from "@/lib/rendering/canvas/perf";
import {
  DEFAULT_TIMELINE_THEME,
  readTimelineCanvasTheme,
  type TimelineCanvasTheme,
} from "@/lib/rendering/canvas/theme";
import {
  OVERLAY_SCROLL_TOUCH_THRESHOLD_PX,
  TOUCH_CLICK_DRAG_THRESHOLD,
  TOUCH_TOOLTIP_HIT_SLOP_PX,
} from "./interactions/constants";
import type {
  DragState,
  DualEdgeTouchZoomState,
  PinchZoomState,
  TimelineCanvasProps,
  TimelineCanvasScene,
  TimelineSceneDiagnosticsSnapshot,
} from "./model/TimelineCanvas.types";

export function TimelineCanvas({
  width,
  height,
  pad,
  overviewReservedHeight = 0,
  viewport,
  activeEra,
  activeChain,
  siblingEras,
  markers,
  overlayBands,
  enabledGroupIds,
  overlayVisibilityTransitionKey,
  parentEra,
  isCosmicCalendarMode,
  isAnimating,
  onViewportChange,
  onContinuousViewportChange,
  onViewportGestureStart,
  onViewportGestureEnd,
  onAnimateZoom,
  onAnimateToRange,
  onDrillIntoEra,
  onNavigateUp,
  onRecordDragSample,
  onReleaseMomentum,
  expandOverlayRequest,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const tooltipInteractiveContentRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<TimelineCanvasTheme>(DEFAULT_TIMELINE_THEME);
  const perfModeRef = useRef<TimelinePerfMode>("off");
  const perfStatsRef = useRef<TimelinePerfStats>(createTimelinePerfStats());
  const verbosePerfStatsRef = useRef<TimelineVerboseStats>(
    createTimelineVerboseStats(),
  );
  const drawCanvasRef = useRef<((invalidateReasons?: string[]) => void) | null>(
    null,
  );
  const sceneRef = useRef<TimelineCanvasScene | null>(null);
  const lastSceneDiagnosticsRef =
    useRef<TimelineSceneDiagnosticsSnapshot | null>(null);
  const drawFrameRef = useRef(0);
  const interactiveChildErasRef = useRef<Era[]>([]);
  const dragStateRef = useRef<DragState | null>(null);
  const dualEdgeTouchZoomRef = useRef<DualEdgeTouchZoomState | null>(null);
  const pinchZoomRef = useRef<PinchZoomState | null>(null);
  const hoverRegionsRef = useRef<HoverRegion[]>([]);
  const overlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
  const hoveredTooltipRef = useRef<HoveredTooltipState | null>(null);
  const isTouchTooltipPinnedRef = useRef(false);
  const suppressTooltipUntilMoveRef = useRef(false);
  const tooltipExitTimeoutRef = useRef<number | null>(null);
  const tooltipEnterFrameRef = useRef(0);
  const lastPointerRef = useRef<{
    x: number;
    y: number;
    pointerType: string;
  } | null>(null);
  const preferredAxisLabelStepRef = useRef<number | undefined>(undefined);
  const primordialDetailStripAnimationRef = useRef<{
    opacity: number;
    target: number;
    lastTime: number;
    segments: PrimordialDetailStripSegment[];
  }>({
    opacity: 0,
    target: 0,
    lastTime: 0,
    segments: [],
  });

  const [hoveredTooltip, setHoveredTooltip] =
    useState<HoveredTooltipState | null>(null);
  const [renderedTooltip, setRenderedTooltip] =
    useState<RenderedTooltipState | null>(null);
  const [expandedOverlayIds, setExpandedOverlayIds] = useState<string[]>([]);
  const viewportRef = useRef(viewport);
  const reserveAxisDateRowRef = useRef(true);
  useEffect(() => {
    hoveredTooltipRef.current = hoveredTooltip;
  }, [hoveredTooltip]);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);
  useEffect(() => {
    themeRef.current = readTimelineCanvasTheme();
    perfModeRef.current = getTimelinePerfMode();
  }, []);
  useEffect(() => {
    return () => {
      if (tooltipExitTimeoutRef.current !== null) {
        window.clearTimeout(tooltipExitTimeoutRef.current);
      }

      if (tooltipEnterFrameRef.current) {
        cancelAnimationFrame(tooltipEnterFrameRef.current);
      }
    };
  }, []);
  const recordVerboseInteractionEvent = useCallback((eventName: string) => {
    if (perfModeRef.current !== "verbose") {
      return;
    }

    incrementCounter(verbosePerfStatsRef.current.interactionCounts, eventName);
  }, []);
  const { isViewportInteractionActiveRef, markViewportInteraction } =
    useViewportInteractionState(recordVerboseInteractionEvent, drawCanvasRef);
  const {
    adjustOverlayScrollOffset,
    axisTickTargets,
    expandedOverlayExtraHeight,
    overlayInteractionLayout,
    overlayLaneCount,
    overlayScrollOffset,
    reserveAxisDateRow,
    resolvedOverlayBands,
    visibleMarkers,
  } = useTimelineCanvasScene({
    enabledGroupIds,
    expandedOverlayIds,
    height,
    markers,
    onOverlayScroll: recordVerboseInteractionEvent,
    overlayBands,
    overviewReservedHeight,
    pad,
    surfaceRef: shellRef,
    viewport,
    width,
  });
  reserveAxisDateRowRef.current = reserveAxisDateRow;
  const commitHoveredTooltip = useCallback(
    (nextTooltip: HoveredTooltipState | null) => {
      const currentTooltip = hoveredTooltipRef.current;

      if (isEquivalentHoveredTooltip(currentTooltip, nextTooltip)) {
        if (currentTooltip && nextTooltip && currentTooltip !== nextTooltip) {
          hoveredTooltipRef.current = currentTooltip;
        }

        return;
      }

      if (tooltipExitTimeoutRef.current !== null) {
        window.clearTimeout(tooltipExitTimeoutRef.current);
        tooltipExitTimeoutRef.current = null;
      }

      if (tooltipEnterFrameRef.current) {
        cancelAnimationFrame(tooltipEnterFrameRef.current);
        tooltipEnterFrameRef.current = 0;
      }

      hoveredTooltipRef.current = nextTooltip;
      setHoveredTooltip(nextTooltip);

      if (!nextTooltip) {
        setRenderedTooltip((current) =>
          current
            ? {
                ...current,
                phase: "exiting",
              }
            : null,
        );

        tooltipExitTimeoutRef.current = window.setTimeout(() => {
          tooltipExitTimeoutRef.current = null;
          setRenderedTooltip((current) =>
            current?.phase === "exiting" ? null : current,
          );
        }, TOOLTIP_EXIT_DURATION_MS);

        return;
      }

      setRenderedTooltip({
        tooltipState: nextTooltip,
        phase: "entering",
      });

      tooltipEnterFrameRef.current = requestAnimationFrame(() => {
        tooltipEnterFrameRef.current = 0;
        setRenderedTooltip((current) => {
          if (!current) {
            return current;
          }

          return isEquivalentHoveredTooltip(current.tooltipState, nextTooltip)
            ? {
                tooltipState: nextTooltip,
                phase: "present",
              }
            : current;
        });
      });
    },
    [],
  );
  const highlightedMarkerId =
    hoveredTooltip?.tooltip.kind === "marker" ? hoveredTooltip.id : null;
  const resolveTooltipAtPoint = useCallback(
    (
      x: number,
      y: number,
      options: {
        pointerType?: string;
        allowTouch?: boolean;
        hitSlopPx?: number;
      } = {},
    ) => {
      const { pointerType, allowTouch = false, hitSlopPx = 0 } = options;

      if (
        !allowTouch &&
        pointerType !== undefined &&
        pointerType !== "mouse" &&
        pointerType !== "pen"
      ) {
        return null;
      }

      const previousTooltip = hoveredTooltipRef.current;
      let selectedRegion: HoverRegion | null = null;
      let selectedKindPriority = Number.POSITIVE_INFINITY;
      let selectedDistance = Number.POSITIVE_INFINITY;
      let selectedBias = Number.POSITIVE_INFINITY;

      for (const region of hoverRegionsRef.current) {
        if (
          x < region.left - hitSlopPx ||
          x > region.right + hitSlopPx ||
          y < region.top - hitSlopPx ||
          y > region.bottom + hitSlopPx
        ) {
          continue;
        }

        const kindPriority = region.tooltip.kind === "marker" ? 0 : 1;
        const distance = Math.hypot(x - region.anchorX, y - region.anchorY);
        const currentBias = previousTooltip?.id === region.id ? -0.25 : 0;

        const isBetter =
          kindPriority < selectedKindPriority ||
          (kindPriority === selectedKindPriority &&
            (distance < selectedDistance - 0.001 ||
              (Math.abs(distance - selectedDistance) <= 0.001 &&
                currentBias < selectedBias)));

        if (isBetter) {
          selectedRegion = region;
          selectedKindPriority = kindPriority;
          selectedDistance = distance;
          selectedBias = currentBias;
        }
      }

      if (!selectedRegion) {
        return null;
      }

      const resolvedTooltip = {
        id: selectedRegion.id,
        anchorX:
          selectedRegion.anchorMode === "follow-x" ? x : selectedRegion.anchorX,
        anchorY: selectedRegion.anchorY,
        placement: selectedRegion.placement,
        tooltip: selectedRegion.tooltip,
      } satisfies HoveredTooltipState;

      return isEquivalentHoveredTooltip(previousTooltip, resolvedTooltip)
        ? previousTooltip
        : resolvedTooltip;
    },
    [],
  );
  const resolveHoveredTooltipForCanvasDraw = useCallback(
    (x: number, y: number, pointerType: string) => {
      return resolveTooltipAtPoint(x, y, { pointerType });
    },
    [resolveTooltipAtPoint],
  );
  const drawCanvas = useCallback(
    (invalidateReasons: string[] = []) => {
      const { hasActiveFrameAnimation } = drawTimelineCanvasFrame({
        canvas: canvasRef.current,
        commitHoveredTooltip,
        frameRefs: {
          axisTickAnimationRef,
          eraChildAnimationRef,
          expandedOverlayProgressByIdRef,
          hoverRegionsRef,
          interactiveChildErasRef,
          markerPriorityBoostRef,
          overlayBandAnimationRef,
          overlayInteractionRegionsRef,
          preferredAxisLabelStepRef,
          primordialDetailStripAnimationRef,
          renderedExpandedOverlayIdsRef,
        },
        hoveredTooltipRef,
        invalidateReasons,
        isCosmicCalendarMode,
        isTouchTooltipPinned: isTouchTooltipPinnedRef.current,
        isViewportInteractionActive: isViewportInteractionActiveRef.current,
        lastPointer: dragStateRef.current ? null : lastPointerRef.current,
        overviewReservedHeight,
        overlayScrollOffset,
        pad,
        perfMode: perfModeRef.current,
        perfStats: perfStatsRef.current,
        resolveHoveredTooltipForCanvasDraw,
        reserveAxisDateRow: reserveAxisDateRowRef.current,
        scene: sceneRef.current,
        shellElement: shellRef.current,
        theme: themeRef.current,
        tooltipInteractiveContentElement: tooltipInteractiveContentRef.current,
        verbosePerfStats: verbosePerfStatsRef.current,
      });

      if (hasActiveFrameAnimation && !drawFrameRef.current) {
        drawFrameRef.current = requestAnimationFrame(() => {
          drawFrameRef.current = 0;
          drawCanvasRef.current?.(["frame-animation"]);
        });
      }
    },
    // Animation refs are created later in the hook order, but React keeps their
    // objects stable. The renderer reads their current values at draw time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      commitHoveredTooltip,
      isCosmicCalendarMode,
      overlayScrollOffset,
      overviewReservedHeight,
      pad,
      resolveHoveredTooltipForCanvasDraw,
    ],
  );

  useEffect(() => {
    drawCanvasRef.current = drawCanvas;

    return () => {
      if (drawCanvasRef.current === drawCanvas) {
        drawCanvasRef.current = null;
      }
    };
  }, [drawCanvas]);

  const applyTouchZoomDelta = useCallback(
    (zoomDelta: number, anchorX: number) => {
      if (width <= pad * 2) {
        return;
      }

      const clampedZoomDelta = Math.max(-0.05, Math.min(0.05, zoomDelta));

      if (Math.abs(clampedZoomDelta) <= 0.0001) {
        return;
      }

      const innerWidth = Math.max(width - pad * 2, 1);

      onViewportChange((current) =>
        zoomAtPosition(
          current,
          current.zoom + clampedZoomDelta,
          anchorX,
          innerWidth,
        ),
      );
    },
    [onViewportChange, pad, width],
  );

  const stopDualEdgeTouchZoom = useCallback(() => {
    dualEdgeTouchZoomRef.current = null;
  }, []);

  const stopPinchZoom = useCallback(() => {
    pinchZoomRef.current = null;
  }, []);

  const handleEdgeRailInteractionStart = useCallback(() => {
    lastPointerRef.current = null;
    commitHoveredTooltip(null);
    dragStateRef.current = null;
  }, [commitHoveredTooltip]);

  const {
    draggingEdgeZoomSide,
    edgeZoomGlow,
    handleEdgeRailPointerDown,
    handleEdgeRailPointerMove,
    handleEdgeRailPointerUp,
    hoveredEdgeZoomSide,
    pressedEdgeZoomSide,
    setHoveredEdgeZoomSide,
    stopEdgeRailInteraction,
  } = useEdgeRailInteraction({
    dualEdgeTouchZoomRef,
    markViewportInteraction,
    onInteractionStart: handleEdgeRailInteractionStart,
    onViewportChange,
    pad,
    recordVerboseInteractionEvent,
    width,
  });

  useWheelZoomPan({
    surfaceRef: shellRef,
    pad,
    width,
    onViewportChange,
    onContinuousViewportChange,
    onViewportGestureStart,
    onViewportGestureEnd,
    onInteractionStart: () => {
      lastPointerRef.current = null;
      commitHoveredTooltip(null);
      suppressTooltipUntilMoveRef.current = true;
    },
    recordVerboseInteractionEvent,
    markViewportInteraction,
  });

  function resolveHoveredTooltip(x: number, y: number, pointerType: string) {
    return resolveTooltipAtPoint(x, y, { pointerType });
  }
  function resolveOverlayInteractionRegion(x: number, y: number) {
    const rolePriority = {
      child: 0,
      parent: 1,
      panel: 2,
    } as const;

    let selectedRegion: OverlayInteractionRegion | undefined;
    let selectedPriority = Number.POSITIVE_INFINITY;
    let selectedArea = Number.POSITIVE_INFINITY;

    for (const region of overlayInteractionRegionsRef.current) {
      if (
        x < region.left ||
        x > region.right ||
        y < region.top ||
        y > region.bottom
      ) {
        continue;
      }

      const priority = rolePriority[region.role];
      const area = (region.right - region.left) * (region.bottom - region.top);

      if (
        priority < selectedPriority ||
        (priority === selectedPriority && area < selectedArea)
      ) {
        selectedRegion = region;
        selectedPriority = priority;
        selectedArea = area;
      }
    }

    return selectedRegion;
  }
  const scheduleRedraw = useCallback((reason = "unspecified") => {
    if (drawFrameRef.current) return;
    drawFrameRef.current = requestAnimationFrame(() => {
      drawFrameRef.current = 0;
      drawCanvasRef.current?.([reason]);
    });
  }, []);

  const eraChildAnimationRef = useEraChildAnimation(
    activeEra.id,
    siblingEras,
    viewport,
    width,
    pad,
    isAnimating,
    isViewportInteractionActiveRef,
    scheduleRedraw,
  );
  const markerPriorityBoostRef = useMarkerPriorityBoost(
    highlightedMarkerId,
    scheduleRedraw,
  );
  const overlayBandAnimationRef = useOverlayBandAnimation(
    resolvedOverlayBands,
    overlayLaneCount,
    height,
    overlayScrollOffset,
    reserveAxisDateRow,
    overviewReservedHeight,
    expandedOverlayExtraHeight,
    overlayVisibilityTransitionKey,
    scheduleRedraw,
  );
  const axisTickAnimationRef = useAxisTickAnimation(
    axisTickTargets,
    scheduleRedraw,
  );
  const {
    progressByIdRef: expandedOverlayProgressByIdRef,
    renderedIdsRef: renderedExpandedOverlayIdsRef,
  } = useExpandedOverlayAnimation(expandedOverlayIds, scheduleRedraw);

  useEffect(() => {
    if (!expandOverlayRequest) return;
    setExpandedOverlayIds((current) =>
      current.includes(expandOverlayRequest.overlayId)
        ? current
        : [...current, expandOverlayRequest.overlayId],
    );
  }, [expandOverlayRequest]);

  useEffect(() => {
    setExpandedOverlayIds((current) => {
      const derived = deriveExpandedOverlayIds(current, resolvedOverlayBands);

      if (derived === current) return current;

      // Snap animation to 0 immediately for zoom-collapsed IDs so there's no
      // glitchy in-progress transition while the viewport is also moving.
      for (const id of current) {
        if (!derived.includes(id)) {
          expandedOverlayProgressByIdRef.current.delete(id);
        }
      }
      renderedExpandedOverlayIdsRef.current =
        renderedExpandedOverlayIdsRef.current.filter((id) =>
          derived.includes(id),
        );

      return derived;
    });
  }, [
    resolvedOverlayBands,
    expandedOverlayProgressByIdRef,
    renderedExpandedOverlayIdsRef,
  ]);

  useEffect(() => {
    return () => {
      if (drawFrameRef.current) {
        cancelAnimationFrame(drawFrameRef.current);
      }
    };
  }, []);

  useCanvasBackingStore(canvasRef, width, height);

  useEffect(() => {
    const nextSceneDiagnostics: TimelineSceneDiagnosticsSnapshot = {
      width,
      height,
      centerYear: viewport.centerYear,
      zoom: viewport.zoom,
      activeEraId: activeEra.id,
      visibleMarkerCount: visibleMarkers.length,
      overlayCount: resolvedOverlayBands.length,
      overlayLaneCount,
      axisTickCount: axisTickTargets.length,
    };

    if (perfModeRef.current === "verbose") {
      const stats = verbosePerfStatsRef.current;
      const previousScene = lastSceneDiagnosticsRef.current;
      const reasons: string[] = [];

      stats.scenePublishCount += 1;

      if (!previousScene) {
        reasons.push("initial");
      } else {
        if (
          previousScene.width !== nextSceneDiagnostics.width ||
          previousScene.height !== nextSceneDiagnostics.height
        ) {
          reasons.push("layout");
        }

        if (
          Math.abs(previousScene.centerYear - nextSceneDiagnostics.centerYear) >
            1e-6 ||
          Math.abs(previousScene.zoom - nextSceneDiagnostics.zoom) > 1e-6
        ) {
          reasons.push("viewport");
        }

        if (previousScene.activeEraId !== nextSceneDiagnostics.activeEraId) {
          reasons.push("active-era");
        }

        if (
          previousScene.visibleMarkerCount !==
          nextSceneDiagnostics.visibleMarkerCount
        ) {
          reasons.push("visible-markers");
        }

        if (
          previousScene.overlayCount !== nextSceneDiagnostics.overlayCount ||
          previousScene.overlayLaneCount !==
            nextSceneDiagnostics.overlayLaneCount
        ) {
          reasons.push("overlays");
        }

        if (
          previousScene.axisTickCount !== nextSceneDiagnostics.axisTickCount
        ) {
          reasons.push("axis");
        }
      }

      for (const reason of reasons.length > 0
        ? reasons
        : ["stable-reference"]) {
        incrementCounter(stats.scenePublishReasonCounts, reason);
      }
    }

    lastSceneDiagnosticsRef.current = nextSceneDiagnostics;

    sceneRef.current = {
      width,
      height,
      viewport,
      activeEra,
      activeChain,
      siblingEras,
      parentEra,
      visibleMarkers,
      resolvedOverlayBands,
      overlayLaneCount,
    };

    if (drawFrameRef.current) {
      cancelAnimationFrame(drawFrameRef.current);
      drawFrameRef.current = 0;
    }

    drawCanvas(["scene-publish"]);
  }, [
    activeChain,
    activeEra,
    axisTickTargets,
    drawCanvas,
    height,
    overlayLaneCount,
    parentEra,
    resolvedOverlayBands,
    siblingEras,
    viewport,
    visibleMarkers,
    width,
  ]);

  useTouchGestures({
    applyTouchZoomDelta,
    canvasRef,
    commitHoveredTooltip,
    dragStateRef,
    dualEdgeTouchZoomRef,
    lastPointerRef,
    markViewportInteraction,
    onViewportChange,
    pad,
    pinchZoomRef,
    recordVerboseInteractionEvent,
    shellRef,
    stopDualEdgeTouchZoom,
    stopEdgeRailInteraction,
    stopPinchZoom,
    viewportRef,
    width,
  });

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stopEdgeRailInteraction();
    recordVerboseInteractionEvent("pointer-down");
    isTouchTooltipPinnedRef.current = false;
    lastPointerRef.current = null;
    commitHoveredTooltip(null);
    dragStateRef.current = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      lastX: event.clientX,
      lastY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      mode: "pending",
    };

    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !width) return;

    markViewportInteraction("pointer-drag");
    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    const totalDeltaX = event.clientX - dragState.startX;
    const totalDeltaY = event.clientY - dragState.startY;
    const dragDistance = Math.hypot(totalDeltaX, totalDeltaY);
    const clickThreshold =
      dragState.pointerType === "touch"
        ? TOUCH_CLICK_DRAG_THRESHOLD
        : CLICK_DRAG_THRESHOLD;

    if (dragState.mode === "pending") {
      if (dragDistance <= clickThreshold) {
        dragStateRef.current = {
          ...dragState,
          lastX: event.clientX,
          lastY: event.clientY,
        };
        return;
      }

      const startedInOverlayWindow =
        dragState.startY >= overlayInteractionLayout.overlayClipTop &&
        dragState.startY <= overlayInteractionLayout.overlayClipBottom;
      const hasVerticalOverlayIntent =
        dragState.pointerType === "touch" &&
        overlayInteractionLayout.overlayScrollMax > 0 &&
        startedInOverlayWindow &&
        Math.abs(totalDeltaY) >= OVERLAY_SCROLL_TOUCH_THRESHOLD_PX &&
        Math.abs(totalDeltaY) > Math.abs(totalDeltaX) * 1.15;

      dragState.mode = hasVerticalOverlayIntent ? "overlay-scroll" : "pan";
    }

    if (!dragState.moved && dragDistance > clickThreshold) {
      dragState.moved = true;
    }

    dragStateRef.current = {
      ...dragState,
      lastX: event.clientX,
      lastY: event.clientY,
    };

    if (dragState.mode === "overlay-scroll") {
      adjustOverlayScrollOffset(deltaY);
      return;
    }

    onRecordDragSample(deltaX);
    const innerW = width - pad * 2;
    onViewportChange((current) => panByPixels(current, deltaX, innerW));
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      recordVerboseInteractionEvent("pointer-up");
      const dragState = dragStateRef.current;
      const wasClick =
        !dragState.moved &&
        Math.hypot(
          event.clientX - dragState.startX,
          event.clientY - dragState.startY,
        ) <=
          (dragState.pointerType === "touch"
            ? TOUCH_CLICK_DRAG_THRESHOLD
            : CLICK_DRAG_THRESHOLD);

      dragStateRef.current = null;
      onReleaseMomentum();

      if (wasClick) {
        recordVerboseInteractionEvent("pointer-click");
        const rect = event.currentTarget.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const clickedRegion = resolveOverlayInteractionRegion(localX, localY);
        const resolvedTouchTooltip =
          event.pointerType === "touch"
            ? resolveTooltipAtPoint(localX, localY, {
                allowTouch: true,
                hitSlopPx: TOUCH_TOOLTIP_HIT_SLOP_PX,
              })
            : null;
        const childBandTouchTooltip =
          event.pointerType === "touch" &&
          clickedRegion?.role === "child" &&
          clickedRegion.tooltip
            ? ({
                id: clickedRegion.id,
                anchorX: Math.min(
                  Math.max(localX, clickedRegion.left),
                  clickedRegion.right,
                ),
                anchorY: clickedRegion.top,
                placement: "above",
                tooltip: clickedRegion.tooltip,
              } satisfies HoveredTooltipState)
            : null;
        const tappedTooltip = resolvedTouchTooltip ?? childBandTouchTooltip;

        if (clickedRegion?.role === "parent") {
          isTouchTooltipPinnedRef.current = false;
          setExpandedOverlayIds((current) =>
            current.includes(clickedRegion.id)
              ? current.filter((id) => id !== clickedRegion.id)
              : [...current, clickedRegion.id],
          );
        } else if (clickedRegion?.role === "child" && tappedTooltip) {
          isTouchTooltipPinnedRef.current = true;
          lastPointerRef.current = null;
          commitHoveredTooltip(tappedTooltip);
        } else if (clickedRegion?.role === "child") {
          isTouchTooltipPinnedRef.current = false;
          setExpandedOverlayIds((current) => {
            const parentId = clickedRegion.parentId ?? clickedRegion.id;

            return current.includes(parentId)
              ? current
              : [...current, parentId];
          });
        } else if (clickedRegion?.role === "panel") {
          isTouchTooltipPinnedRef.current = false;
          setExpandedOverlayIds((current) => {
            const parentId = clickedRegion.parentId ?? clickedRegion.id;

            return current.includes(parentId)
              ? current
              : [...current, parentId];
          });
        } else if (tappedTooltip) {
          isTouchTooltipPinnedRef.current = true;
          lastPointerRef.current = null;
          commitHoveredTooltip(tappedTooltip);
        } else {
          isTouchTooltipPinnedRef.current = false;
          setExpandedOverlayIds([]);
          commitHoveredTooltip(null);
        }
      }
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleShellPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    isTouchTooltipPinnedRef.current = false;

    if (suppressTooltipUntilMoveRef.current) {
      suppressTooltipUntilMoveRef.current = false;
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const currentTooltip = hoveredTooltipRef.current;
    const stickyRect =
      tooltipInteractiveContentRef.current?.getBoundingClientRect() ?? null;

    lastPointerRef.current = {
      x,
      y,
      pointerType: event.pointerType,
    };

    if (dragStateRef.current?.pointerId === event.pointerId) {
      commitHoveredTooltip(null);
      return;
    }

    if (
      currentTooltip &&
      shouldPrioritizeTooltipRetention(currentTooltip) &&
      shouldRetainTooltipAtPoint(
        x,
        y,
        rect,
        stickyRect,
        currentTooltip,
        TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
      )
    ) {
      commitHoveredTooltip(currentTooltip);
      return;
    }

    const resolvedTooltip = resolveHoveredTooltip(x, y, event.pointerType);

    if (resolvedTooltip) {
      commitHoveredTooltip(resolvedTooltip);
      return;
    }

    if (currentTooltip) {
      if (
        shouldRetainTooltipAtPoint(
          x,
          y,
          rect,
          stickyRect,
          currentTooltip,
          TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
        )
      ) {
        commitHoveredTooltip(currentTooltip);
        return;
      }
    }

    commitHoveredTooltip(null);
  };

  const handleShellPointerLeave = () => {
    if (isTouchTooltipPinnedRef.current) {
      return;
    }

    lastPointerRef.current = null;
    commitHoveredTooltip(null);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!width) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left - pad;
    const innerW = width - pad * 2;
    const clickYear = screenToWorld(clickX, viewport, innerW);
    // Check visible child layers first, then siblings
    const era =
      findEraAtYear(interactiveChildErasRef.current, clickYear) ??
      findEraAtYear(siblingEras, clickYear);

    if (era) {
      if (era.children && era.children.length > 0) {
        onDrillIntoEra(era);
      } else {
        onAnimateToRange(era.startYear, era.endYear);
      }
    }
  };

  return (
    <div
      className="relative w-full h-full"
      ref={shellRef}
      onPointerLeave={handleShellPointerLeave}
      onPointerMove={handleShellPointerMove}
    >
      <canvas
        aria-label="Interactive timeline canvas"
        className="absolute inset-0 w-full h-full block border-0 outline-none touch-none cursor-grab overscroll-none active:cursor-grabbing"
        onKeyDown={(event) => {
          if (!width) return;

          if (event.key === "h" || event.key === "H") {
            event.preventDefault();
            onNavigateUp();
            return;
          }

          if (event.key === "Escape" || event.key === "Backspace") {
            event.preventDefault();
            onNavigateUp();
            return;
          }

          if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            const innerW = width - pad * 2;
            onAnimateZoom(1, innerW / 2);
          }

          if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            const innerW = width - pad * 2;
            onAnimateZoom(-1, innerW / 2);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            const innerW = width - pad * 2;
            onViewportChange((current) => panByPixels(current, 120, innerW));
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            const innerW = width - pad * 2;
            onViewportChange((current) => panByPixels(current, -120, innerW));
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        ref={canvasRef}
        tabIndex={0}
      />
      <EdgeZoomZones
        draggingSide={draggingEdgeZoomSide}
        glow={edgeZoomGlow}
        hoveredSide={hoveredEdgeZoomSide}
        onHoveredSideChange={setHoveredEdgeZoomSide}
        onLostPointerCapture={stopEdgeRailInteraction}
        onPointerCancel={handleEdgeRailPointerUp}
        onPointerDown={handleEdgeRailPointerDown}
        onPointerMove={handleEdgeRailPointerMove}
        onPointerUp={handleEdgeRailPointerUp}
        pressedSide={pressedEdgeZoomSide}
        zoneWidth={pad}
      />
      {renderedTooltip ? (
        <TimelineTooltip
          height={height}
          interactiveContentRef={tooltipInteractiveContentRef}
          renderedTooltip={renderedTooltip}
          width={width}
        />
      ) : null}
    </div>
  );
}
