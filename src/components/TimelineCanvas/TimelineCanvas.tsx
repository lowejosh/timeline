import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  compareEraPriorityAscending,
  type Era,
  type TimelineMarker,
  type TimelineOverlayBand,
} from "@/lib/catalog/eras";
import {
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_START_YEAR,
} from "@/lib/catalog/sets/cosmic/index";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getMaxZoomForTimelineViewport,
  getViewportCenterYear,
  getZoomAnchorForCanvasX,
  getVisibleRangePrecise,
  screenToWorld,
  screenToWorldPrecise,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  panByPixels,
  toApproximateTimelineYear,
  worldToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "@/lib/core/viewport";
import {
  getInteractiveDescendantEras,
  getPreviewFocusChain,
  resolveTimelineEraLayersFromOpacityMap,
} from "@/lib/rendering/childLayers";
import {
  resolveTimelineOverlayTracks,
  type ResolvedTimelineOverlayBand,
} from "@/lib/rendering/overlayTracks";
import { getVisibleTimelineMarkers } from "@/lib/rendering/queries/markers";
import { resolveExpandedOverlayLayout } from "@/lib/rendering/expandedOverlayLayout";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "@/lib/rendering/tooltipRetention";
import {
  resolveAxisTickRenderStates,
  type AxisTickRenderState,
} from "@/lib/rendering/axisTickStates";
import type { AnimatedContextBandLabelState } from "@/lib/rendering/contextBands";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import {
  getEdgeRailGlowIntensity,
  getEdgeRailPanPixelsPerFrame,
  getEdgeRailZoomDelta,
  hasEdgeRailVerticalIntent,
  shouldPanEdgeRail,
  shouldShowEdgeRailZoomState,
  type EdgeRailSide,
} from "./TimelineCanvas.edgeInteraction";
import { getPinchZoomDeltaFromScale } from "./TimelineCanvas.pinch";
import {
  DEFAULT_TIMELINE_THEME,
  readTimelineCanvasTheme,
  type TimelineCanvasTheme,
} from "@/lib/rendering/canvas/theme";
import {
  createTimelinePerfBreakdown,
  createTimelinePerfStats,
  createTimelineVerboseStats,
  getTimelinePerfMode,
  incrementCounter,
  recordTimelinePerf,
  recordTimelineVerboseSample,
  type TimelinePerfBreakdown,
  type TimelinePerfMode,
  type TimelinePerfStats,
  type TimelineVerboseStats,
} from "@/lib/rendering/canvas/perf";
import {
  PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS,
  PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW,
  resolveEraScreenSpanMap,
  resolvePrimordialDetailStripSegments,
  type PrimordialDetailStripSegment,
} from "@/lib/rendering/canvas/primordial";
import {
  compareOverlayBands,
  findEraAtYear,
  getExpandedOverlayPanelHeight,
  getOverlayLaneY,
  getTimelineLayout,
  resolveExpandedOverlayDetails,
} from "@/lib/rendering/canvas/overlayLayout";
import {
  isEquivalentHoveredTooltip,
  type HoveredTooltipState,
  type RenderedTooltipState,
} from "@/lib/rendering/canvas/tooltip";
import { useWheelZoomPan } from "@/hooks/useWheelZoomPan";
import { useMarkerPriorityBoost } from "@/hooks/useMarkerPriorityBoost";
import { useEraChildAnimation } from "@/hooks/useEraChildAnimation";
import { useOverlayBandAnimation } from "@/hooks/useOverlayBandAnimation";
import { useAxisTickAnimation } from "@/hooks/useAxisTickAnimation";
import { useExpandedOverlayAnimation } from "@/hooks/useExpandedOverlayAnimation";
import { drawBackground } from "@/lib/rendering/canvas/draw/drawBackground";
import { drawEras } from "@/lib/rendering/canvas/draw/drawEras";
import { drawOverlays } from "@/lib/rendering/canvas/draw/drawOverlays";
import { drawAxis } from "@/lib/rendering/canvas/draw/drawAxis";
import { drawMarkers } from "@/lib/rendering/canvas/draw/drawMarkers";
import { drawNowIndicator } from "@/lib/rendering/canvas/draw/drawNowIndicator";
import "./TimelineCanvas.styles.css";
import type {
  CanvasDrawContext,
  HoverRegion,
  OverlayInteractionRegion,
} from "@/lib/rendering/canvas/draw/drawContext";

type TimelineCanvasProps = {
  width: number;
  height: number;
  pad: number;
  viewport: TimelineViewport;
  /** The currently drilled-into era (or root) */
  activeEra: Era;
  activeChain: Era[];
  /** Children of the active era's parent (the "base" layer, always visible) */
  siblingEras: Era[];
  markers: TimelineMarker[];
  overlayBands: TimelineOverlayBand[];
  enabledGroupIds: ReadonlySet<string>;
  overlayVisibilityTransitionKey: string;
  parentEra: Era | null;
  isCosmicCalendarMode: boolean;
  isAnimating: boolean;
  onViewportChange: (
    updater: (current: TimelineViewport) => TimelineViewport,
  ) => void;
  onAnimateZoom: (zoomDelta: number, anchorX: number) => void;
  onAnimateToRange: (startYear: number, endYear: number) => void;
  onDrillIntoEra: (era: Era) => void;
  onNavigateUp: () => void;
  onRecordDragSample: (dx: number) => void;
  onReleaseMomentum: () => void;
};

type DragState = {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
  mode: "pending" | "pan" | "overlay-scroll";
};

type EdgeRailInteractionState = {
  pointerId: number;
  side: EdgeRailSide;
  startY: number;
  lastY: number;
  startedAt: number;
  lastFrameTime: number;
  lastEventTime: number;
  lastVerticalIntentTime: number;
  lastZoomIntentTime: number | null;
  currentMode: "idle" | "zoom" | "pan";
  hasEngagedZoom: boolean;
  element: HTMLDivElement;
};

type DualEdgeTouchZoomState = {
  leftTouchId: number;
  rightTouchId: number;
  lastAverageY: number;
};

type TimelineCanvasScene = {
  width: number;
  height: number;
  viewport: TimelineViewport;
  activeEra: Era;
  activeChain: Era[];
  siblingEras: Era[];
  parentEra: Era | null;
  visibleMarkers: TimelineMarker[];
  resolvedOverlayBands: ResolvedTimelineOverlayBand[];
  overlayLaneCount: number;
  axisTickTargets: AxisTickRenderState[];
};

type TimelineSceneDiagnosticsSnapshot = {
  width: number;
  height: number;
  centerYear: number;
  zoom: number;
  activeEraId: string;
  visibleMarkerCount: number;
  overlayCount: number;
  overlayLaneCount: number;
  axisTickCount: number;
};

import {
  AXIS_TICK_OVERSCAN_PX,
  CLICK_DRAG_THRESHOLD,
  OVERLAY_LANE_GAP,
  OVERLAY_LANE_HEIGHT,
  TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
  TOOLTIP_EXIT_DURATION_MS,
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_OFFSET,
  VIEWPORT_INTERACTION_SETTLE_MS,
} from "@/lib/rendering/canvas/constants";

const DUAL_EDGE_CENTER_ZOOM_DELTA_PER_PIXEL = 0.01;
const TOUCH_CLICK_DRAG_THRESHOLD = 12;
const TOUCH_TOOLTIP_HIT_SLOP_PX = 28;
const OVERLAY_SCROLL_TOUCH_THRESHOLD_PX = 8;

export function TimelineCanvas({
  width,
  height,
  pad,
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
  onAnimateZoom,
  onAnimateToRange,
  onDrillIntoEra,
  onNavigateUp,
  onRecordDragSample,
  onReleaseMomentum,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const tooltipSourcesRef = useRef<HTMLDivElement | null>(null);
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
  const pendingInvalidateReasonsRef = useRef<Set<string>>(new Set());
  const interactiveChildErasRef = useRef<Era[]>([]);
  const dragStateRef = useRef<DragState | null>(null);
  const edgeRailInteractionRef = useRef<EdgeRailInteractionState | null>(null);
  const dualEdgeTouchZoomRef = useRef<DualEdgeTouchZoomState | null>(null);
  const edgeRailFrameRef = useRef(0);
  const interactionSettleTimeoutRef = useRef<number | null>(null);
  const hoverRegionsRef = useRef<HoverRegion[]>([]);
  const overlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
  const hoveredTooltipRef = useRef<HoveredTooltipState | null>(null);
  const isTouchTooltipPinnedRef = useRef(false);
  const tooltipExitTimeoutRef = useRef<number | null>(null);
  const tooltipEnterFrameRef = useRef(0);
  const lastPointerRef = useRef<{
    x: number;
    y: number;
    pointerType: string;
  } | null>(null);
  const preferredAxisLabelStepRef = useRef<number | undefined>(undefined);
  const overlayLabelAnimationRef = useRef<
    Map<string, AnimatedContextBandLabelState>
  >(new Map());
  const overlayLabelAnimationInitializedRef = useRef(false);
  const primordialDebugSignatureRef = useRef<string | null>(null);
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
  const [hoveredEdgeZoomSide, setHoveredEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [pressedEdgeZoomSide, setPressedEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [draggingEdgeZoomSide, setDraggingEdgeZoomSide] =
    useState<EdgeRailSide | null>(null);
  const [edgeZoomGlow, setEdgeZoomGlow] = useState<{
    side: EdgeRailSide;
    yPercent: number;
    intensity: number;
  } | null>(null);
  const [overlayScrollOffset, setOverlayScrollOffset] = useState(0);
  const [isViewportInteractionActive, setIsViewportInteractionActive] =
    useState(false);
  const overlayScrollOffsetRef = useRef(0);
  useEffect(() => {
    hoveredTooltipRef.current = hoveredTooltip;
  }, [hoveredTooltip]);
  useEffect(() => {
    overlayScrollOffsetRef.current = overlayScrollOffset;
  }, [overlayScrollOffset]);
  useEffect(() => {
    themeRef.current = readTimelineCanvasTheme();
    perfModeRef.current = getTimelinePerfMode();
  }, []);
  useEffect(() => {
    return () => {
      if (interactionSettleTimeoutRef.current !== null) {
        window.clearTimeout(interactionSettleTimeoutRef.current);
      }

      if (tooltipExitTimeoutRef.current !== null) {
        window.clearTimeout(tooltipExitTimeoutRef.current);
      }

      if (tooltipEnterFrameRef.current) {
        cancelAnimationFrame(tooltipEnterFrameRef.current);
      }

      if (edgeRailFrameRef.current) {
        cancelAnimationFrame(edgeRailFrameRef.current);
      }
    };
  }, []);
  const recordVerboseInteractionEvent = useCallback((eventName: string) => {
    if (perfModeRef.current !== "verbose") {
      return;
    }

    incrementCounter(verbosePerfStatsRef.current.interactionCounts, eventName);
  }, []);
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
      const scene = sceneRef.current;
      const canvas = canvasRef.current;

      if (!scene || !canvas || scene.width <= 0 || scene.height <= 0) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const {
        width: sceneWidth,
        height: sceneHeight,
        viewport: sceneViewport,
        activeEra: sceneActiveEra,
        activeChain: sceneActiveChain,
        siblingEras: sceneSiblingEras,
        parentEra: sceneParentEra,
        visibleMarkers: sceneVisibleMarkers,
        resolvedOverlayBands: sceneResolvedOverlayBands,
        overlayLaneCount: sceneOverlayLaneCount,
      } = scene;
      const animatedEraChildOpacityById = new Map<string, number>();

      for (const [eraId, state] of eraChildAnimationRef.current) {
        animatedEraChildOpacityById.set(eraId, state.current);
      }

      const resolvedEraLayers = resolveTimelineEraLayersFromOpacityMap(
        sceneSiblingEras,
        sceneActiveEra.id,
        sceneViewport,
        sceneWidth,
        pad,
        animatedEraChildOpacityById,
      );
      const visibleEraLayers = resolvedEraLayers.filter(
        (layer) => layer.opacity > 0.01,
      );
      const interactiveChildEras =
        getInteractiveDescendantEras(resolvedEraLayers);
      interactiveChildErasRef.current = interactiveChildEras;
      const previewCandidates = sceneSiblingEras.some(
        (era) => era.id === sceneActiveEra.id,
      )
        ? (sceneActiveEra.children ?? [])
        : sceneSiblingEras;
      const previewFocusChain = getPreviewFocusChain(
        previewCandidates,
        resolvedEraLayers,
      );
      const breadcrumbChain = [...sceneActiveChain];

      for (const era of previewFocusChain) {
        if (!breadcrumbChain.some((entry) => entry.id === era.id)) {
          breadcrumbChain.push(era);
        }
      }

      const visibleExpandedOverlayIds =
        renderedExpandedOverlayIdsRef.current.filter(
          (expandedOverlayId, index, allIds) =>
            allIds.indexOf(expandedOverlayId) === index &&
            sceneResolvedOverlayBands.some(
              ({ band }) =>
                band.id === expandedOverlayId &&
                (band.children?.length ?? 0) > 0,
            ),
        );
      const expandedOverlayDetails = resolveExpandedOverlayDetails(
        visibleExpandedOverlayIds,
        sceneResolvedOverlayBands,
        sceneViewport,
        sceneWidth,
        pad,
      );
      const expandedOverlayExpansionStates = expandedOverlayDetails.map(
        (detail) => {
          const fullHeight = getExpandedOverlayPanelHeight(detail);
          const progress =
            expandedOverlayProgressByIdRef.current.get(detail.parent.band.id) ??
            0;

          return {
            detail,
            fullHeight,
            progress,
            animatedHeight: fullHeight * progress,
          };
        },
      );
      const paper = themeRef.current.paper;
      const paperDeep = themeRef.current.paperDeep;
      const line = themeRef.current.line;
      const lineSoft = themeRef.current.lineSoft;
      const labelColor = themeRef.current.labelColor;
      const fontSans = themeRef.current.fontSans;
      const perfMode = perfModeRef.current;
      const perfEnabled = perfMode !== "off";
      const verbosePerfEnabled = perfMode === "verbose";
      const drawStart = perfEnabled ? performance.now() : 0;
      const drawNow = performance.now();
      const perfSample = perfEnabled
        ? {
            ...createTimelinePerfBreakdown(),
            visibleEraCount: visibleEraLayers.length,
            visibleOverlayCount: sceneResolvedOverlayBands.length,
            visibleMarkerCount: sceneVisibleMarkers.length,
            axisTickCount: axisTickAnimationRef.current.size,
          }
        : null;
      let perfPhaseStart = drawStart;
      const markPerf = (
        key: Exclude<keyof TimelinePerfBreakdown, "totalMs">,
      ) => {
        if (!perfSample) {
          return;
        }

        const now = performance.now();
        perfSample[key] += now - perfPhaseStart;
        perfPhaseStart = now;
      };
      const innerWidth = sceneWidth - pad * 2;
      const devicePixelRatio =
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
      const animatedOverlayBands = [...overlayBandAnimationRef.current.values()]
        .filter((state) => state.currentOpacity > 0.01)
        .sort(
          (left, right) =>
            left.overlay.laneIndex - right.overlay.laneIndex ||
            compareOverlayBands(left.overlay.band, right.overlay.band),
        );
      const animatedOverlayLaneCount = animatedOverlayBands.reduce(
        (maxLaneCount, state) =>
          Math.max(
            maxLaneCount,
            state.overlay.laneCount,
            state.overlay.laneIndex + 1,
          ),
        sceneOverlayLaneCount,
      );
      const layout = getTimelineLayout(
        sceneHeight,
        animatedOverlayLaneCount,
        overlayScrollOffset,
      );
      const overlayBottomY = getOverlayLaneY(layout, 0);
      const resolvedOverlayLayout = resolveExpandedOverlayLayout(
        sceneResolvedOverlayBands.map((overlay) => ({
          id: overlay.band.id,
          laneIndex: overlay.laneIndex,
          renderX: overlay.renderX,
          renderWidth: overlay.renderWidth,
          baseY: getOverlayLaneY(layout, overlay.laneIndex),
        })),
        expandedOverlayExpansionStates.map(
          ({ detail, fullHeight, progress }) => ({
            parentId: detail.parent.band.id,
            panelHeight: fullHeight,
            expansionProgress: progress,
          }),
        ),
        overlayBottomY,
        OVERLAY_LANE_HEIGHT,
        OVERLAY_LANE_GAP,
      );
      const breadcrumbChainIds = new Set(
        breadcrumbChain.slice(1).map((era) => era.id),
      );
      const visibleOverlayIds = new Set(
        sceneResolvedOverlayBands.map(({ band }) => band.id),
      );
      const paintOrderedEraLayers = [...visibleEraLayers].sort(
        (left, right) =>
          compareEraPriorityAscending(left.era, right.era) ||
          left.depth - right.depth,
      );
      const resolvedAxisTickStates = [...axisTickAnimationRef.current.values()]
        .filter(
          (tick) => tick.visibleProgress > 0.01 || tick.labelOpacity > 0.01,
        )
        .sort(
          (left, right) => left.step - right.step || left.year - right.year,
        );
      const sceneMaxZoom = getMaxZoomForTimelineViewport(
        sceneViewport,
        innerWidth,
      );
      const allowPrimordialSyntheticDetail =
        sceneViewport.zoom >=
        sceneMaxZoom - PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW;
      const eraScreenSpanById = resolveEraScreenSpanMap(
        visibleEraLayers,
        sceneViewport,
        sceneWidth,
        pad,
        allowPrimordialSyntheticDetail,
      );
      const primordialDetailStripSegments =
        resolvePrimordialDetailStripSegments(
          visibleEraLayers,
          eraScreenSpanById,
          sceneViewport,
          sceneWidth,
          pad,
        );
      const primordialDetailStripAnimation =
        primordialDetailStripAnimationRef.current;
      const hasPrimordialDetailStripTarget =
        primordialDetailStripSegments.length > 0;

      primordialDetailStripAnimation.target = hasPrimordialDetailStripTarget
        ? 1
        : 0;

      if (hasPrimordialDetailStripTarget) {
        primordialDetailStripAnimation.segments = primordialDetailStripSegments;
      }

      const primordialDetailStripDt = primordialDetailStripAnimation.lastTime
        ? Math.max(drawNow - primordialDetailStripAnimation.lastTime, 0)
        : 16;
      primordialDetailStripAnimation.lastTime = drawNow;
      const primordialDetailStripFactor =
        1 -
        Math.exp(
          -primordialDetailStripDt / PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS,
        );
      primordialDetailStripAnimation.opacity +=
        (primordialDetailStripAnimation.target -
          primordialDetailStripAnimation.opacity) *
        primordialDetailStripFactor;

      let hasActivePrimordialDetailStripAnimation = false;

      if (
        Math.abs(
          primordialDetailStripAnimation.target -
            primordialDetailStripAnimation.opacity,
        ) <= 0.01
      ) {
        primordialDetailStripAnimation.opacity =
          primordialDetailStripAnimation.target;
      } else {
        hasActivePrimordialDetailStripAnimation = true;
      }

      if (
        primordialDetailStripAnimation.target <= 0 &&
        primordialDetailStripAnimation.opacity <= 0.01
      ) {
        primordialDetailStripAnimation.segments = [];
      }

      const renderedPrimordialDetailStripSegments =
        primordialDetailStripAnimation.target > 0
          ? primordialDetailStripSegments
          : primordialDetailStripAnimation.segments;
      const primordialDetailStripOpacity =
        primordialDetailStripAnimation.opacity;

      const toX = (year: number) =>
        pad + worldToScreen(year, sceneViewport, innerWidth);
      const fromX = (px: number) =>
        screenToWorldPrecise(px - pad, sceneViewport, innerWidth);

      const background = context.createLinearGradient(0, 0, 0, sceneHeight);
      background.addColorStop(0, paper);
      background.addColorStop(1, paperDeep);
      context.clearRect(0, 0, sceneWidth, sceneHeight);
      context.fillStyle = background;
      context.fillRect(0, 0, sceneWidth, sceneHeight);
      markPerf("setupMs");

      const cx: CanvasDrawContext = {
        context,
        sceneWidth,
        sceneHeight,
        pad,
        innerWidth,
        devicePixelRatio,
        sceneViewport,
        layout,
        background,
        paper,
        line,
        lineSoft,
        labelColor,
        fontSans,
        drawNow,
        sceneActiveEra,
        sceneActiveChain,
        sceneParentEra,
        sceneVisibleMarkers,
        sceneResolvedOverlayBands,
        visibleEraLayers,
        paintOrderedEraLayers,
        eraScreenSpanById,
        breadcrumbChain,
        breadcrumbChainIds,
        visibleOverlayIds,
        animatedOverlayBands,
        animatedOverlayLaneCount,
        resolvedOverlayLayout,
        expandedOverlayExpansionStates,
        resolvedAxisTickStates,
        primordialDetailStripSegments,
        renderedPrimordialDetailStripSegments,
        primordialDetailStripOpacity,
        allowPrimordialSyntheticDetail,
        sceneMaxZoom,
        overlayLabelAnimationRef,
        overlayLabelAnimationInitializedRef,
        markerPriorityBoostRef,
        expandedOverlayProgressByIdRef,
        hoverRegions: [],
        overlayInteractionRegions: [],
        overlayOcclusionRects: [],
        activeOverlayLabelKeys: new Set(),
        frameFlags: {
          hasActiveOverlayLabelAnimation: false,
          hasActivePrimordialDetailStripAnimation,
        },
        toX,
        fromX,
        markPerf,
        isViewportInteractionActive,
        preferredAxisLabelStepRef,
        primordialDebugSignatureRef,
        isCosmicCalendarMode,
      };

      drawBackground(cx);
      drawEras(cx);
      markPerf("eraMs");
      drawOverlays(cx);
      markPerf("overlayMs");
      drawAxis(cx);
      markPerf("axisMs");
      const resolvedMarkerStates = drawMarkers(cx);
      markPerf("markerMs");
      drawNowIndicator(cx);

      for (const key of [...overlayLabelAnimationRef.current.keys()]) {
        if (!cx.activeOverlayLabelKeys.has(key)) {
          overlayLabelAnimationRef.current.delete(key);
        }
      }

      overlayLabelAnimationInitializedRef.current = true;

      hoverRegionsRef.current = cx.hoverRegions;
      overlayInteractionRegionsRef.current = cx.overlayInteractionRegions;

      if (lastPointerRef.current && !dragStateRef.current) {
        const currentTooltip = hoveredTooltipRef.current;
        const stickyRect =
          tooltipSourcesRef.current?.getBoundingClientRect() ?? null;

        if (
          currentTooltip &&
          shellRef.current &&
          shouldPrioritizeTooltipRetention(currentTooltip) &&
          shouldRetainTooltipAtPoint(
            lastPointerRef.current.x,
            lastPointerRef.current.y,
            shellRef.current.getBoundingClientRect(),
            stickyRect,
            currentTooltip,
            TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
          )
        ) {
          commitHoveredTooltip(currentTooltip);
        } else {
          const resolvedTooltip = resolveHoveredTooltipForCanvasDraw(
            lastPointerRef.current.x,
            lastPointerRef.current.y,
            lastPointerRef.current.pointerType,
          );

          if (resolvedTooltip) {
            commitHoveredTooltip(resolvedTooltip);
          } else if (
            hoveredTooltipRef.current &&
            shellRef.current &&
            shouldRetainTooltipAtPoint(
              lastPointerRef.current.x,
              lastPointerRef.current.y,
              shellRef.current.getBoundingClientRect(),
              stickyRect,
              hoveredTooltipRef.current,
              TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
            )
          ) {
            commitHoveredTooltip(hoveredTooltipRef.current);
          } else {
            commitHoveredTooltip(null);
          }
        }
      } else if (!lastPointerRef.current && !isTouchTooltipPinnedRef.current) {
        commitHoveredTooltip(null);
      }

      if (perfSample) {
        markPerf("interactionMs");
        const perfNow = performance.now();
        perfSample.totalMs = perfNow - drawStart;
        recordTimelinePerf(perfStatsRef.current, perfSample, perfNow);

        if (verbosePerfEnabled) {
          const renderedMarkerStates = resolvedMarkerStates.map((state) => ({
            id: state.marker.id,
            labelVisible: state.labelOpacity > 0.01,
            label: state.label,
            opacityBucket: Math.round(state.labelOpacity * 10),
          }));
          const visibleLabelCount = renderedMarkerStates.filter(
            (state) => state.labelVisible,
          ).length;

          recordTimelineVerboseSample(
            verbosePerfStatsRef.current,
            {
              invalidateReasons,
              interactionActive: isViewportInteractionActive,
              visibleLabelCount,
              markerStates: renderedMarkerStates,
            },
            perfNow,
          );
        }
      }

      if (
        (cx.frameFlags.hasActiveOverlayLabelAnimation ||
          cx.frameFlags.hasActivePrimordialDetailStripAnimation) &&
        !drawFrameRef.current
      ) {
        drawFrameRef.current = requestAnimationFrame(() => {
          drawFrameRef.current = 0;
          drawCanvasRef.current?.(["overlay-label-animation"]);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      commitHoveredTooltip,
      height,
      isCosmicCalendarMode,
      isViewportInteractionActive,
      overlayScrollOffset,
      resolveHoveredTooltipForCanvasDraw,
      width,
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

  const markViewportInteraction = useCallback(
    (eventName: string) => {
      setIsViewportInteractionActive(true);

      if (interactionSettleTimeoutRef.current !== null) {
        window.clearTimeout(interactionSettleTimeoutRef.current);
      }

      interactionSettleTimeoutRef.current = window.setTimeout(() => {
        interactionSettleTimeoutRef.current = null;
        setIsViewportInteractionActive(false);
      }, VIEWPORT_INTERACTION_SETTLE_MS);

      recordVerboseInteractionEvent(eventName);
    },
    [recordVerboseInteractionEvent],
  );

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

  const stopEdgeRailInteraction = useCallback(
    (pointerId?: number) => {
      const edgeRailInteraction = edgeRailInteractionRef.current;

      if (!edgeRailInteraction) {
        return;
      }

      if (
        pointerId !== undefined &&
        edgeRailInteraction.pointerId !== pointerId
      ) {
        return;
      }

      edgeRailInteractionRef.current = null;
      setPressedEdgeZoomSide(null);
      setDraggingEdgeZoomSide(null);
      setEdgeZoomGlow(null);

      if (edgeRailFrameRef.current) {
        cancelAnimationFrame(edgeRailFrameRef.current);
        edgeRailFrameRef.current = 0;
      }

      if (
        edgeRailInteraction.element.hasPointerCapture(
          edgeRailInteraction.pointerId,
        )
      ) {
        edgeRailInteraction.element.releasePointerCapture(
          edgeRailInteraction.pointerId,
        );
      }

      recordVerboseInteractionEvent("edge-rail-stop");
    },
    [recordVerboseInteractionEvent],
  );

  const stepEdgeRailInteraction = useCallback(
    (now: number) => {
      const edgeRailInteraction = edgeRailInteractionRef.current;

      if (!edgeRailInteraction || width <= pad * 2) {
        edgeRailFrameRef.current = 0;
        return;
      }

      const dt = Math.max(now - edgeRailInteraction.lastFrameTime, 8);
      const heldForMs = Math.max(now - edgeRailInteraction.startedAt, 0);
      const idleForMs = Math.max(
        now - edgeRailInteraction.lastVerticalIntentTime,
        0,
      );
      const hasRecentZoomIntent =
        edgeRailInteraction.lastZoomIntentTime !== null;
      const innerWidth = Math.max(width - pad * 2, 1);

      edgeRailInteraction.lastFrameTime = now;

      if (shouldPanEdgeRail({ heldForMs, idleForMs, hasRecentZoomIntent })) {
        const direction = edgeRailInteraction.side === "left" ? 1 : -1;
        const pixelsPerFrame = getEdgeRailPanPixelsPerFrame(heldForMs);

        edgeRailInteraction.currentMode = "pan";
        setDraggingEdgeZoomSide((current) =>
          current === edgeRailInteraction.side ? null : current,
        );
        markViewportInteraction("edge-pan-hold");
        onViewportChange((current) =>
          panByPixels(
            current,
            direction * pixelsPerFrame * (dt / 16),
            innerWidth,
          ),
        );
      } else if (edgeRailInteraction.currentMode === "pan") {
        edgeRailInteraction.currentMode = "idle";
      }

      edgeRailFrameRef.current = requestAnimationFrame(stepEdgeRailInteraction);
    },
    [markViewportInteraction, onViewportChange, pad, width],
  );

  const handleEdgeRailPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>, side: EdgeRailSide) => {
      if (dualEdgeTouchZoomRef.current) {
        return;
      }

      if (width <= pad * 2) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      lastPointerRef.current = null;
      commitHoveredTooltip(null);
      dragStateRef.current = null;
      stopEdgeRailInteraction();
      recordVerboseInteractionEvent("edge-rail-start");

      const zoneRect = event.currentTarget.getBoundingClientRect();
      const now = performance.now();

      edgeRailInteractionRef.current = {
        pointerId: event.pointerId,
        side,
        startY: event.clientY,
        lastY: event.clientY,
        startedAt: now,
        lastFrameTime: now,
        lastEventTime: event.timeStamp,
        lastVerticalIntentTime: now,
        lastZoomIntentTime: null,
        currentMode: "idle",
        hasEngagedZoom: false,
        element: event.currentTarget,
      };
      setPressedEdgeZoomSide(side);
      setEdgeZoomGlow({
        side,
        yPercent: ((event.clientY - zoneRect.top) / zoneRect.height) * 100,
        intensity: 0.22,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      edgeRailFrameRef.current = requestAnimationFrame(stepEdgeRailInteraction);
    },
    [
      commitHoveredTooltip,
      pad,
      recordVerboseInteractionEvent,
      stepEdgeRailInteraction,
      stopEdgeRailInteraction,
      width,
    ],
  );

  const handleEdgeRailPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const edgeRailInteraction = edgeRailInteractionRef.current;

      if (
        !edgeRailInteraction ||
        edgeRailInteraction.pointerId !== event.pointerId ||
        dualEdgeTouchZoomRef.current
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const zoneRect = event.currentTarget.getBoundingClientRect();
      const deltaY = event.clientY - edgeRailInteraction.lastY;
      const totalTravel = Math.abs(event.clientY - edgeRailInteraction.startY);
      const dt = Math.max(
        event.timeStamp - edgeRailInteraction.lastEventTime,
        8,
      );
      const glowIntensity = getEdgeRailGlowIntensity({
        totalTravelPx: totalTravel,
        deltaYPx: deltaY,
        deltaTimeMs: dt,
      });

      edgeRailInteraction.lastY = event.clientY;
      edgeRailInteraction.lastEventTime = event.timeStamp;
      setEdgeZoomGlow({
        side: edgeRailInteraction.side,
        yPercent: ((event.clientY - zoneRect.top) / zoneRect.height) * 100,
        intensity: glowIntensity,
      });

      if (
        !hasEdgeRailVerticalIntent(deltaY, {
          interruptingPan: edgeRailInteraction.currentMode === "pan",
        })
      ) {
        return;
      }

      const zoomIntentTime = performance.now();

      edgeRailInteraction.lastVerticalIntentTime = zoomIntentTime;
      edgeRailInteraction.lastZoomIntentTime = zoomIntentTime;
      edgeRailInteraction.currentMode = "zoom";

      if (shouldShowEdgeRailZoomState(totalTravel)) {
        setDraggingEdgeZoomSide(edgeRailInteraction.side);

        if (!edgeRailInteraction.hasEngagedZoom) {
          edgeRailInteraction.hasEngagedZoom = true;
          recordVerboseInteractionEvent("edge-zoom-engaged");
        }
      }

      const zoomDelta = getEdgeRailZoomDelta({
        deltaYPx: deltaY,
        deltaTimeMs: dt,
      });

      if (zoomDelta === null) {
        return;
      }

      const innerWidth = Math.max(width - pad * 2, 1);
      const anchorX = edgeRailInteraction.side === "left" ? 0 : innerWidth;

      markViewportInteraction("edge-zoom");
      onViewportChange((current) =>
        zoomAtPosition(current, current.zoom + zoomDelta, anchorX, innerWidth),
      );
    },
    [
      markViewportInteraction,
      onViewportChange,
      pad,
      recordVerboseInteractionEvent,
      width,
    ],
  );

  const handleEdgeRailPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      stopEdgeRailInteraction(event.pointerId);
    },
    [stopEdgeRailInteraction],
  );

  useWheelZoomPan({
    surfaceRef: shellRef,
    pad,
    width,
    onViewportChange,
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
  const visibleMarkers = useMemo(
    () =>
      getVisibleTimelineMarkers(markers, viewport, width, pad, enabledGroupIds),
    [enabledGroupIds, markers, pad, viewport, width],
  );
  const resolvedOverlayBands = useMemo(
    () =>
      resolveTimelineOverlayTracks(
        overlayBands,
        viewport,
        width,
        pad,
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        enabledGroupIds,
      ),
    [enabledGroupIds, overlayBands, pad, viewport, width],
  );
  const overlayLaneCount = resolvedOverlayBands[0]?.laneCount ?? 0;
  const overlayInteractionLayout = useMemo(
    () => getTimelineLayout(height, overlayLaneCount, overlayScrollOffset),
    [height, overlayLaneCount, overlayScrollOffset],
  );

  const clampOverlayScrollOffset = useCallback(
    (requestedOffset: number) =>
      getTimelineLayout(height, overlayLaneCount, requestedOffset)
        .overlayScrollOffset,
    [height, overlayLaneCount],
  );

  const adjustOverlayScrollOffset = useCallback(
    (deltaY: number) => {
      if (overlayInteractionLayout.overlayScrollMax <= 0) {
        return;
      }

      setOverlayScrollOffset((current) =>
        clampOverlayScrollOffset(current + deltaY),
      );
    },
    [clampOverlayScrollOffset, overlayInteractionLayout.overlayScrollMax],
  );

  useEffect(() => {
    setOverlayScrollOffset((current) => clampOverlayScrollOffset(current));
  }, [clampOverlayScrollOffset]);

  useEffect(() => {
    const surface = shellRef.current;

    if (!surface || overlayInteractionLayout.overlayScrollMax <= 0) {
      return;
    }

    const handleOverlayWheel = (event: globalThis.WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      const rect = surface.getBoundingClientRect();
      const localY = event.clientY - rect.top;

      if (
        localY < overlayInteractionLayout.overlayClipTop ||
        localY > overlayInteractionLayout.overlayClipBottom
      ) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      recordVerboseInteractionEvent("overlay-wheel-scroll");
      adjustOverlayScrollOffset(-event.deltaY);
    };

    surface.addEventListener("wheel", handleOverlayWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      surface.removeEventListener("wheel", handleOverlayWheel, {
        capture: true,
      });
    };
  }, [
    adjustOverlayScrollOffset,
    overlayInteractionLayout.overlayClipBottom,
    overlayInteractionLayout.overlayClipTop,
    overlayInteractionLayout.overlayScrollMax,
    recordVerboseInteractionEvent,
  ]);

  const axisTickTargets = useMemo(() => {
    if (width <= pad * 2) {
      return [] as AxisTickRenderState[];
    }

    const innerWidth = width - pad * 2;
    const [preciseRangeStart, preciseRangeEnd] = getVisibleRangePrecise(
      viewport,
      innerWidth,
    );
    const tickRangeStart = screenToWorldPrecise(
      -AXIS_TICK_OVERSCAN_PX,
      viewport,
      innerWidth,
    );
    const tickRangeEnd = screenToWorldPrecise(
      innerWidth + AXIS_TICK_OVERSCAN_PX,
      viewport,
      innerWidth,
    );
    const tickStart = Math.max(
      toApproximateTimelineYear(tickRangeStart),
      TIMELINE_MIN_YEAR,
    );
    const tickEnd = Math.min(
      toApproximateTimelineYear(tickRangeEnd),
      TIMELINE_MAX_YEAR,
    );
    const visibleSpan = Math.max(
      Math.abs(
        subtractPreciseTimelineYears(preciseRangeEnd, preciseRangeStart),
      ),
      1e-18,
    );
    const earlyUniverseOverlapStart = Math.max(
      tickStart,
      EARLY_UNIVERSE_START_YEAR,
    );
    const earlyUniverseOverlapEnd = Math.min(tickEnd, EARLY_UNIVERSE_END_YEAR);
    const earlyUniverseOverlap = Math.max(
      0,
      earlyUniverseOverlapEnd - earlyUniverseOverlapStart,
    );
    const startsAtBigBang =
      comparePreciseTimelineYears(
        preciseRangeStart,
        splitTimelineYear(TIMELINE_MIN_YEAR),
      ) === 0;
    const isFullyZoomedOut =
      viewport.zoom <=
      getMinZoomForWidth(innerWidth, viewport.scaleMode ?? "linear") + 0.001;
    const isPrimordialFocused =
      !isFullyZoomedOut &&
      (startsAtBigBang || earlyUniverseOverlap / visibleSpan >= 0.75);

    return resolveAxisTickRenderStates(tickStart, tickEnd, innerWidth, {
      elapsedReference: isPrimordialFocused ? "after-big-bang" : "ago",
      elapsedSubYearReference: isPrimordialFocused ? "after-big-bang" : "ago",
      preciseStartYear: preciseRangeStart,
      preciseEndYear: preciseRangeEnd,
      preciseAnchorYear: getViewportCenterYear(viewport),
      scaleMode: "logarithmic",
    });
  }, [pad, viewport, width]);

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
    isViewportInteractionActive,
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
    return () => {
      if (drawFrameRef.current) {
        cancelAnimationFrame(drawFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || width <= 0 || height <= 0) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const pixelWidth = Math.floor(width * ratio);
    const pixelHeight = Math.floor(height * ratio);

    if (canvas.width !== pixelWidth) {
      canvas.width = pixelWidth;
    }

    if (canvas.height !== pixelHeight) {
      canvas.height = pixelHeight;
    }

    const cssWidth = `${width}px`;
    const cssHeight = `${height}px`;

    if (canvas.style.width !== cssWidth) {
      canvas.style.width = cssWidth;
    }

    if (canvas.style.height !== cssHeight) {
      canvas.style.height = cssHeight;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, [height, width]);

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
      axisTickTargets,
    };

    if (drawFrameRef.current) {
      cancelAnimationFrame(drawFrameRef.current);
      drawFrameRef.current = 0;

      if (perfModeRef.current === "verbose") {
        pendingInvalidateReasonsRef.current.clear();
      }
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

  // Pinch-to-zoom via native gesture events (Safari) and touch events.
  // Safari can emit both paths for one pinch, so we explicitly suppress the
  // touch fallback while a native gesture is active to avoid double zooming.
  useEffect(() => {
    const canvas = canvasRef.current;
    const surface = shellRef.current;

    if (!canvas || !surface || !width) {
      return;
    }

    let lastGestureScale = 1;
    let lastTouchDist = 0;
    let isNativeGestureActive = false;

    const getTouchById = (touches: TouchList, identifier: number) => {
      for (let index = 0; index < touches.length; index += 1) {
        if (touches[index].identifier === identifier) {
          return touches[index];
        }
      }

      return null;
    };

    const resolveLocalTouchPoint = (touch: Touch, rect: DOMRect) => ({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    const tryStartDualEdgeTouchZoom = (touches: TouchList, rect: DOMRect) => {
      if (touches.length !== 2 || width <= pad * 2) {
        stopDualEdgeTouchZoom();
        return false;
      }

      const [firstTouch, secondTouch] = [touches[0], touches[1]];
      const firstPoint = resolveLocalTouchPoint(firstTouch, rect);
      const secondPoint = resolveLocalTouchPoint(secondTouch, rect);
      const leftTouch =
        firstPoint.x <= pad
          ? { touch: firstTouch, point: firstPoint }
          : secondPoint.x <= pad
            ? { touch: secondTouch, point: secondPoint }
            : null;
      const rightTouch =
        firstPoint.x >= width - pad
          ? { touch: firstTouch, point: firstPoint }
          : secondPoint.x >= width - pad
            ? { touch: secondTouch, point: secondPoint }
            : null;

      if (
        !leftTouch ||
        !rightTouch ||
        leftTouch.touch.identifier === rightTouch.touch.identifier
      ) {
        stopDualEdgeTouchZoom();
        return false;
      }

      stopEdgeRailInteraction();
      dragStateRef.current = null;
      lastPointerRef.current = null;
      commitHoveredTooltip(null);
      dualEdgeTouchZoomRef.current = {
        leftTouchId: leftTouch.touch.identifier,
        rightTouchId: rightTouch.touch.identifier,
        lastAverageY: (leftTouch.point.y + rightTouch.point.y) * 0.5,
      };

      return true;
    };

    const clearTouchZoomState = () => {
      lastTouchDist = 0;
      stopDualEdgeTouchZoom();
    };

    const handleGestureStart = (event: Event) => {
      isNativeGestureActive = true;
      lastGestureScale = 1;
      lastTouchDist = 0;
      stopEdgeRailInteraction();
      dragStateRef.current = null;
      stopDualEdgeTouchZoom();
      event.preventDefault();
    };

    const handleGestureChange = (event: Event) => {
      event.preventDefault();
      markViewportInteraction("gesture-change");

      const gestureEvent = event as unknown as {
        scale: number;
        clientX: number;
      };
      const incrementalScale =
        gestureEvent.scale / Math.max(lastGestureScale, 0.001);
      const rect = canvas.getBoundingClientRect();
      const localX = gestureEvent.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, pad);
      const zoomDelta = getPinchZoomDeltaFromScale(incrementalScale);

      lastGestureScale = gestureEvent.scale;

      if (zoomDelta !== null) {
        applyTouchZoomDelta(zoomDelta, anchorX);
      }
    };

    const handleGestureEnd = (event: Event) => {
      isNativeGestureActive = false;
      lastGestureScale = 1;
      clearTouchZoomState();
      event.preventDefault();
    };

    const handleTouchStart = (event: TouchEvent) => {
      const rect = surface.getBoundingClientRect();

      if (tryStartDualEdgeTouchZoom(event.touches, rect)) {
        event.preventDefault();
        recordVerboseInteractionEvent("dual-edge-center-zoom-start");
        return;
      }

      if (isNativeGestureActive || event.touches.length !== 2) {
        if (event.touches.length < 2) {
          lastTouchDist = 0;
        }

        return;
      }

      event.preventDefault();
      stopEdgeRailInteraction();
      dragStateRef.current = null;
      recordVerboseInteractionEvent("touch-start");
      const dx = event.touches[1].clientX - event.touches[0].clientX;
      const dy = event.touches[1].clientY - event.touches[0].clientY;
      lastTouchDist = Math.hypot(dx, dy);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const rect = surface.getBoundingClientRect();
      const dualEdgeTouchZoom = dualEdgeTouchZoomRef.current;

      if (dualEdgeTouchZoom) {
        const leftTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.leftTouchId,
        );
        const rightTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.rightTouchId,
        );

        if (!leftTouch || !rightTouch) {
          clearTouchZoomState();
          return;
        }

        event.preventDefault();
        markViewportInteraction("dual-edge-center-zoom");

        const leftPoint = resolveLocalTouchPoint(leftTouch, rect);
        const rightPoint = resolveLocalTouchPoint(rightTouch, rect);
        const averageY = (leftPoint.y + rightPoint.y) * 0.5;
        const deltaY = averageY - dualEdgeTouchZoom.lastAverageY;
        const innerWidth = Math.max(width - pad * 2, 1);

        dualEdgeTouchZoom.lastAverageY = averageY;
        applyTouchZoomDelta(
          -deltaY * DUAL_EDGE_CENTER_ZOOM_DELTA_PER_PIXEL,
          innerWidth * 0.5,
        );
        return;
      }

      if (isNativeGestureActive || event.touches.length !== 2) {
        return;
      }

      event.preventDefault();
      markViewportInteraction("touch-pinch");

      const dx = event.touches[1].clientX - event.touches[0].clientX;
      const dy = event.touches[1].clientY - event.touches[0].clientY;
      const dist = Math.hypot(dx, dy);

      if (lastTouchDist > 0) {
        const scale = dist / lastTouchDist;
        const localX =
          (event.touches[0].clientX + event.touches[1].clientX) * 0.5 -
          rect.left;
        const anchorX = getZoomAnchorForCanvasX(localX, width, pad);
        const zoomDelta = getPinchZoomDeltaFromScale(scale);

        if (zoomDelta !== null) {
          applyTouchZoomDelta(zoomDelta, anchorX);
        }
      }

      lastTouchDist = dist;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const dualEdgeTouchZoom = dualEdgeTouchZoomRef.current;

      if (dualEdgeTouchZoom) {
        const leftTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.leftTouchId,
        );
        const rightTouch = getTouchById(
          event.touches,
          dualEdgeTouchZoom.rightTouchId,
        );

        if (!leftTouch || !rightTouch) {
          stopDualEdgeTouchZoom();
        }
      }

      if (event.touches.length < 2) {
        lastTouchDist = 0;
      }
    };

    const handleTouchCancel = () => {
      clearTouchZoomState();
    };

    canvas.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    canvas.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    canvas.addEventListener("gestureend", handleGestureEnd, {
      passive: false,
    });
    surface.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    surface.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    surface.addEventListener("touchend", handleTouchEnd, { passive: false });
    surface.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("gesturestart", handleGestureStart);
      canvas.removeEventListener("gesturechange", handleGestureChange);
      canvas.removeEventListener("gestureend", handleGestureEnd);
      surface.removeEventListener("touchstart", handleTouchStart);
      surface.removeEventListener("touchmove", handleTouchMove);
      surface.removeEventListener("touchend", handleTouchEnd);
      surface.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    applyTouchZoomDelta,
    commitHoveredTooltip,
    markViewportInteraction,
    pad,
    recordVerboseInteractionEvent,
    stopEdgeRailInteraction,
    stopDualEdgeTouchZoom,
    width,
  ]);

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
        const tappedTooltip =
          event.pointerType === "touch"
            ? resolveTooltipAtPoint(localX, localY, {
                allowTouch: true,
                hitSlopPx: TOUCH_TOOLTIP_HIT_SLOP_PX,
              })
            : null;

        if (clickedRegion?.role === "parent") {
          isTouchTooltipPinnedRef.current = false;
          setExpandedOverlayIds((current) =>
            current.includes(clickedRegion.id)
              ? current.filter((id) => id !== clickedRegion.id)
              : [...current, clickedRegion.id],
          );
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
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const currentTooltip = hoveredTooltipRef.current;
    const stickyRect =
      tooltipSourcesRef.current?.getBoundingClientRect() ?? null;

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

  const displayedTooltip = renderedTooltip?.tooltipState ?? null;
  const edgeZoomZoneWidth = pad;
  const safeViewportInsets =
    typeof window === "undefined"
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : (() => {
          const rootStyles = getComputedStyle(document.documentElement);
          const readInset = (name: string) => {
            const value = Number.parseFloat(rootStyles.getPropertyValue(name));
            return Number.isFinite(value) ? value : 0;
          };
          const visualViewport = window.visualViewport;
          const viewportTop = visualViewport?.offsetTop ?? 0;
          const viewportLeft = visualViewport?.offsetLeft ?? 0;
          const viewportHeight = visualViewport?.height ?? window.innerHeight;
          const viewportWidth = visualViewport?.width ?? window.innerWidth;

          return {
            top: Math.max(readInset("--safe-area-top"), viewportTop) + 10,
            right:
              Math.max(
                readInset("--safe-area-right"),
                Math.max(window.innerWidth - (viewportLeft + viewportWidth), 0),
              ) + 10,
            bottom:
              Math.max(
                readInset("--safe-area-bottom"),
                Math.max(
                  window.innerHeight - (viewportTop + viewportHeight),
                  0,
                ),
              ) + 10,
            left: Math.max(readInset("--safe-area-left"), viewportLeft) + 10,
          };
        })();

  const tooltipStyle:
    | (CSSProperties & Record<string, string | number>)
    | undefined = displayedTooltip
    ? (() => {
        const tooltipMaxWidth = Math.min(
          TOOLTIP_MAX_WIDTH,
          Math.max(
            width - safeViewportInsets.left - safeViewportInsets.right - 24,
            220,
          ),
        );
        const centeredMinX = safeViewportInsets.left + tooltipMaxWidth * 0.5;
        const centeredMaxX =
          width - safeViewportInsets.right - tooltipMaxWidth * 0.5;
        const shouldPlaceBelow =
          displayedTooltip.anchorY < safeViewportInsets.top + 96 ||
          (displayedTooltip.placement === "below" &&
            displayedTooltip.anchorY <=
              height - safeViewportInsets.bottom - 120);

        return {
          left:
            displayedTooltip.anchorX >= centeredMinX &&
            displayedTooltip.anchorX <= centeredMaxX
              ? displayedTooltip.anchorX
              : displayedTooltip.anchorX > centeredMaxX
                ? width - safeViewportInsets.right - 10
                : safeViewportInsets.left + 10,
          top: Math.min(
            Math.max(displayedTooltip.anchorY, safeViewportInsets.top + 6),
            height - safeViewportInsets.bottom - 6,
          ),
          maxWidth: `${tooltipMaxWidth}px`,
          "--tooltip-translate-x":
            displayedTooltip.anchorX >= centeredMinX &&
            displayedTooltip.anchorX <= centeredMaxX
              ? "-50%"
              : displayedTooltip.anchorX > centeredMaxX
                ? "-100%"
                : "0%",
          "--tooltip-translate-y": shouldPlaceBelow
            ? `${TOOLTIP_OFFSET}px`
            : `calc(-100% - ${TOOLTIP_OFFSET}px)`,
          "--tooltip-origin": shouldPlaceBelow ? "top center" : "bottom center",
          "--tooltip-motion-offset-y": shouldPlaceBelow ? "-4px" : "4px",
        };
      })()
    : undefined;

  return (
    <div
      className="relative w-full h-full"
      ref={shellRef}
      onPointerLeave={handleShellPointerLeave}
      onPointerMove={handleShellPointerMove}
    >
      <canvas
        aria-label="Interactive timeline canvas"
        className="absolute inset-0 w-full h-full block border-0 outline-none touch-none cursor-grab overscroll-none active:cursor-grabbing focus-visible:[box-shadow:inset_0_0_0_2px_var(--focus)]"
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
      {(["left", "right"] as const).map((side) => (
        <div
          aria-hidden="true"
          className="timeline-canvas__edge-zoom-zone"
          data-dragging={draggingEdgeZoomSide === side ? "true" : "false"}
          data-hovered={hoveredEdgeZoomSide === side ? "true" : "false"}
          data-pressed={pressedEdgeZoomSide === side ? "true" : "false"}
          data-side={side}
          key={side}
          onLostPointerCapture={() => {
            stopEdgeRailInteraction();
          }}
          onPointerCancel={handleEdgeRailPointerUp}
          onPointerDown={(event) => {
            handleEdgeRailPointerDown(event, side);
          }}
          onPointerEnter={() => {
            setHoveredEdgeZoomSide(side);
          }}
          onPointerLeave={() => {
            setHoveredEdgeZoomSide((current) =>
              current === side ? null : current,
            );
          }}
          onPointerMove={handleEdgeRailPointerMove}
          onPointerUp={handleEdgeRailPointerUp}
          style={
            {
              width: edgeZoomZoneWidth,
              "--edge-zone-glow-y": `${
                edgeZoomGlow?.side === side ? edgeZoomGlow.yPercent : 50
              }%`,
              "--edge-zone-glow-opacity": `${
                edgeZoomGlow?.side === side ? edgeZoomGlow.intensity : 0.18
              }`,
            } as CSSProperties
          }
        >
          <div className="timeline-canvas__edge-zoom-hint">
            <span className="timeline-canvas__edge-zoom-hint-label timeline-canvas__edge-zoom-hint-label--top">
              Drag to zoom
            </span>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon"
              viewBox="0 0 16 16"
            >
              <path d="M4.5 9 8 5.5 11.5 9" />
            </svg>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon timeline-canvas__edge-zoom-hint-icon--glass"
              viewBox="0 0 16 16"
            >
              <circle cx="7" cy="7" r="3.5" />
              <path d="M9.7 9.7 13 13" />
            </svg>
            <svg
              aria-hidden="true"
              className="timeline-canvas__edge-zoom-hint-icon"
              viewBox="0 0 16 16"
            >
              <path d="M4.5 7 8 10.5 11.5 7" />
            </svg>
            <span className="timeline-canvas__edge-zoom-hint-label">
              Hold to pan
            </span>
          </div>
        </div>
      ))}
      {renderedTooltip ? (
        <div
          className="timeline-tooltip"
          data-phase={renderedTooltip.phase}
          style={tooltipStyle}
        >
          <div className="timeline-tooltip__header">
            <OverlayGroupIconSvg
              className="timeline-tooltip__icon"
              groupId={renderedTooltip.tooltipState.tooltip.iconGroupId}
            />
            <div className="timeline-tooltip__title">
              {renderedTooltip.tooltipState.tooltip.title}
            </div>
          </div>
          {renderedTooltip.tooltipState.tooltip.regionalScopeLabel ? (
            <div className="timeline-tooltip__subtitle">
              {renderedTooltip.tooltipState.tooltip.regionalScopeLabel}
            </div>
          ) : null}
          <div className="timeline-tooltip__time">
            {renderedTooltip.tooltipState.tooltip.timeLabel}
          </div>
          {renderedTooltip.tooltipState.tooltip.description ? (
            <div className="timeline-tooltip__description">
              {renderedTooltip.tooltipState.tooltip.description}
            </div>
          ) : null}
          {renderedTooltip.tooltipState.tooltip.sources.length > 0 ? (
            <div className="timeline-tooltip__sources" ref={tooltipSourcesRef}>
              <div className="timeline-tooltip__sources-label">Sources</div>
              <ul className="timeline-tooltip__source-list">
                {renderedTooltip.tooltipState.tooltip.sources.map((source) => (
                  <li className="timeline-tooltip__source-item" key={source.id}>
                    {source.url ? (
                      <a
                        className="timeline-tooltip__source-link"
                        href={source.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {source.shortTitle}
                      </a>
                    ) : (
                      <span className="timeline-tooltip__source-title">
                        {source.shortTitle}
                      </span>
                    )}
                    <span className="timeline-tooltip__source-org">
                      {source.organization}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
