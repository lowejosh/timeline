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
} from "../../lib/domain/eras";
import {
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_START_YEAR,
} from "../../lib/domain/eraTrees/cosmic";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getMaxZoomForTimelineViewport,
  getViewportCenterYear,
  getZoomAnchorForCanvasX,
  getVisibleRangePrecise,
  screenToWorldPrecise,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  panByPixels,
  screenToWorld,
  toApproximateTimelineYear,
  worldToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "../../lib/core/viewport";
import {
  getInteractiveDescendantEras,
  getPreviewFocusChain,
  resolveTimelineEraLayersFromOpacityMap,
} from "../../lib/rendering/childLayers";
import {
  resolveTimelineOverlayTracks,
  type ResolvedTimelineOverlayBand,
} from "../../lib/rendering/overlayTracks";
import { getVisibleTimelineMarkers } from "../../lib/rendering/queries/markers";
import { resolveExpandedOverlayLayout } from "../../lib/rendering/expandedOverlayLayout";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "../../lib/rendering/tooltipRetention";
import {
  resolveAxisTickRenderStates,
  type AxisTickRenderState,
} from "../../lib/rendering/axisTickStates";
import type { AnimatedContextBandLabelState } from "../../lib/rendering/contextBands";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import {
  DEFAULT_TIMELINE_THEME,
  readTimelineCanvasTheme,
  type TimelineCanvasTheme,
} from "../../lib/rendering/canvas/theme";
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
} from "../../lib/rendering/canvas/perf";
import {
  PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS,
  PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW,
  resolveEraScreenSpanMap,
  resolvePrimordialDetailStripSegments,
  type PrimordialDetailStripSegment,
} from "../../lib/rendering/canvas/primordial";
import {
  compareOverlayBands,
  findEraAtYear,
  getExpandedOverlayPanelHeight,
  getOverlayLaneY,
  getTimelineLayout,
  resolveExpandedOverlayDetails,
} from "../../lib/rendering/canvas/overlayLayout";
import {
  isEquivalentHoveredTooltip,
  type HoveredTooltipState,
  type RenderedTooltipState,
} from "../../lib/rendering/canvas/tooltip";
import { useWheelZoomPan } from "../../hooks/useWheelZoomPan";
import { useMarkerPriorityBoost } from "../../hooks/useMarkerPriorityBoost";
import { useEraChildAnimation } from "../../hooks/useEraChildAnimation";
import { useOverlayBandAnimation } from "../../hooks/useOverlayBandAnimation";
import { useAxisTickAnimation } from "../../hooks/useAxisTickAnimation";
import { useExpandedOverlayAnimation } from "../../hooks/useExpandedOverlayAnimation";
import { drawBackground } from "../../lib/rendering/canvas/draw/drawBackground";
import { drawEras } from "../../lib/rendering/canvas/draw/drawEras";
import { drawOverlays } from "../../lib/rendering/canvas/draw/drawOverlays";
import { drawAxis } from "../../lib/rendering/canvas/draw/drawAxis";
import { drawMarkers } from "../../lib/rendering/canvas/draw/drawMarkers";
import { drawNowIndicator } from "../../lib/rendering/canvas/draw/drawNowIndicator";
import type {
  CanvasDrawContext,
  HoverRegion,
  OverlayInteractionRegion,
} from "../../lib/rendering/canvas/draw/drawContext";

type TimelineCanvasProps = {
  width: number;
  height: number;
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
  startX: number;
  startY: number;
  lastX: number;
  moved: boolean;
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
  PAD,
  TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
  TOOLTIP_EXIT_DURATION_MS,
  TOOLTIP_MAX_WIDTH,
  TOOLTIP_OFFSET,
  VIEWPORT_INTERACTION_SETTLE_MS,
} from "../../lib/rendering/canvas/constants";

export function TimelineCanvas({
  width,
  height,
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
  const interactionSettleTimeoutRef = useRef<number | null>(null);
  const hoverRegionsRef = useRef<HoverRegion[]>([]);
  const overlayInteractionRegionsRef = useRef<OverlayInteractionRegion[]>([]);
  const hoveredTooltipRef = useRef<HoveredTooltipState | null>(null);
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
  const [isViewportInteractionActive, setIsViewportInteractionActive] =
    useState(false);
  useEffect(() => {
    hoveredTooltipRef.current = hoveredTooltip;
  }, [hoveredTooltip]);
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
  const resolveHoveredTooltipForCanvasDraw = useCallback(
    (x: number, y: number, pointerType: string) => {
      if (pointerType !== "mouse" && pointerType !== "pen") {
        return null;
      }

      const previousTooltip = hoveredTooltipRef.current;
      let selectedRegion: HoverRegion | null = null;
      let selectedKindPriority = Number.POSITIVE_INFINITY;
      let selectedDistance = Number.POSITIVE_INFINITY;
      let selectedBias = Number.POSITIVE_INFINITY;

      for (const region of hoverRegionsRef.current) {
        if (
          x < region.left ||
          x > region.right ||
          y < region.top ||
          y > region.bottom
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
        PAD,
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
        PAD,
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
      const pad = PAD;
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
      const layout = getTimelineLayout(sceneHeight, animatedOverlayLaneCount);
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
      } else if (!lastPointerRef.current) {
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
    [
      commitHoveredTooltip,
      height,
      isCosmicCalendarMode,
      isViewportInteractionActive,
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

  useWheelZoomPan({
    canvasRef,
    width,
    onViewportChange,
    recordVerboseInteractionEvent,
    markViewportInteraction,
  });

  function resolveHoveredTooltip(x: number, y: number, pointerType: string) {
    if (pointerType !== "mouse" && pointerType !== "pen") {
      return null;
    }

    const previousTooltip = hoveredTooltipRef.current;
    let selectedRegion: HoverRegion | null = null;
    let selectedKindPriority = Number.POSITIVE_INFINITY;
    let selectedDistance = Number.POSITIVE_INFINITY;
    let selectedBias = Number.POSITIVE_INFINITY;

    for (const region of hoverRegionsRef.current) {
      if (
        x < region.left ||
        x > region.right ||
        y < region.top ||
        y > region.bottom
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
      getVisibleTimelineMarkers(markers, viewport, width, PAD, enabledGroupIds),
    [enabledGroupIds, markers, viewport, width],
  );
  const resolvedOverlayBands = useMemo(
    () =>
      resolveTimelineOverlayTracks(
        overlayBands,
        viewport,
        width,
        PAD,
        typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
        enabledGroupIds,
      ),
    [enabledGroupIds, overlayBands, viewport, width],
  );
  const overlayLaneCount = resolvedOverlayBands[0]?.laneCount ?? 0;

  const axisTickTargets = useMemo(() => {
    if (width <= PAD * 2) {
      return [] as AxisTickRenderState[];
    }

    const innerWidth = width - PAD * 2;
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
  }, [viewport, width]);

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
    drawCanvas,
    axisTickTargets,
    height,
    overlayLaneCount,
    parentEra,
    resolvedOverlayBands,
    siblingEras,
    viewport,
    visibleMarkers,
    width,
  ]);

  // Pinch-to-zoom via native gesture events (Safari) and touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;

    // Safari gesture events
    const handleGestureChange = (event: Event) => {
      event.preventDefault();
      markViewportInteraction("gesture-change");
      const gestureEvent = event as unknown as {
        scale: number;
        clientX: number;
        clientY: number;
      };
      const rect = canvas.getBoundingClientRect();
      const localX = gestureEvent.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
      const zoomDelta = Math.log2(gestureEvent.scale) * 2;
      onAnimateZoom(zoomDelta, anchorX);
    };

    const handleGestureStart = (event: Event) => event.preventDefault();
    const handleGestureEnd = (event: Event) => event.preventDefault();

    // Touch pinch for non-Safari
    let lastTouchDist = 0;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        recordVerboseInteractionEvent("touch-start");
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        markViewportInteraction("touch-pinch");
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        const dist = Math.hypot(dx, dy);

        if (lastTouchDist > 0) {
          const scale = dist / lastTouchDist;
          const zoomDelta = Math.log2(scale) * 3;
          const rect = canvas.getBoundingClientRect();
          const localX =
            (event.touches[0].clientX + event.touches[1].clientX) / 2 -
            rect.left;
          const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
          const innerW = width - PAD * 2;
          onViewportChange((current) =>
            zoomAtPosition(current, current.zoom + zoomDelta, anchorX, innerW),
          );
        }

        lastTouchDist = dist;
      }
    };

    canvas.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    canvas.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    canvas.addEventListener("gestureend", handleGestureEnd, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener("gesturestart", handleGestureStart);
      canvas.removeEventListener("gesturechange", handleGestureChange);
      canvas.removeEventListener("gestureend", handleGestureEnd);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [
    markViewportInteraction,
    onAnimateZoom,
    onViewportChange,
    recordVerboseInteractionEvent,
    width,
  ]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    recordVerboseInteractionEvent("pointer-down");
    lastPointerRef.current = null;
    commitHoveredTooltip(null);
    dragStateRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !width) return;

    markViewportInteraction("pointer-drag");
    const deltaX = event.clientX - dragState.lastX;
    const dragDistance = Math.hypot(
      event.clientX - dragState.startX,
      event.clientY - dragState.startY,
    );

    if (!dragState.moved && dragDistance > CLICK_DRAG_THRESHOLD) {
      dragState.moved = true;
    }

    dragStateRef.current = { ...dragState, lastX: event.clientX };

    onRecordDragSample(deltaX);
    const innerW = width - PAD * 2;
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
        ) <= CLICK_DRAG_THRESHOLD;

      dragStateRef.current = null;
      onReleaseMomentum();

      if (wasClick) {
        recordVerboseInteractionEvent("pointer-click");
        const rect = event.currentTarget.getBoundingClientRect();
        const clickedRegion = resolveOverlayInteractionRegion(
          event.clientX - rect.left,
          event.clientY - rect.top,
        );

        if (clickedRegion?.role === "parent") {
          setExpandedOverlayIds((current) =>
            current.includes(clickedRegion.id)
              ? current.filter((id) => id !== clickedRegion.id)
              : [...current, clickedRegion.id],
          );
        } else if (clickedRegion?.role === "child") {
          setExpandedOverlayIds((current) => {
            const parentId = clickedRegion.parentId ?? clickedRegion.id;

            return current.includes(parentId)
              ? current
              : [...current, parentId];
          });
        } else if (clickedRegion?.role === "panel") {
          setExpandedOverlayIds((current) => {
            const parentId = clickedRegion.parentId ?? clickedRegion.id;

            return current.includes(parentId)
              ? current
              : [...current, parentId];
          });
        } else {
          setExpandedOverlayIds([]);
        }
      }
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleShellPointerMove = (event: PointerEvent<HTMLDivElement>) => {
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
    lastPointerRef.current = null;
    commitHoveredTooltip(null);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!width) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left - PAD;
    const innerW = width - PAD * 2;
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

  const tooltipStyle:
    | (CSSProperties & Record<string, string | number>)
    | undefined = displayedTooltip
    ? {
        left:
          displayedTooltip.anchorX > width - TOOLTIP_MAX_WIDTH * 0.4
            ? displayedTooltip.anchorX - TOOLTIP_OFFSET
            : displayedTooltip.anchorX < TOOLTIP_MAX_WIDTH * 0.4
              ? displayedTooltip.anchorX + TOOLTIP_OFFSET
              : displayedTooltip.anchorX,
        top: displayedTooltip.anchorY,
        maxWidth: `${Math.min(TOOLTIP_MAX_WIDTH, Math.max(width - 32, 220))}px`,
        "--tooltip-translate-x":
          displayedTooltip.anchorX > width - TOOLTIP_MAX_WIDTH * 0.4
            ? "-100%"
            : displayedTooltip.anchorX < TOOLTIP_MAX_WIDTH * 0.4
              ? "0%"
              : "-50%",
        "--tooltip-translate-y":
          displayedTooltip.anchorY < 96 ||
          displayedTooltip.placement === "below"
            ? `${TOOLTIP_OFFSET}px`
            : `calc(-100% - ${TOOLTIP_OFFSET}px)`,
        "--tooltip-origin":
          displayedTooltip.anchorY < 96 ||
          displayedTooltip.placement === "below"
            ? "top center"
            : "bottom center",
        "--tooltip-motion-offset-y":
          displayedTooltip.anchorY < 96 ||
          displayedTooltip.placement === "below"
            ? "-4px"
            : "4px",
      }
    : undefined;

  return (
    <div
      className="timeline-canvas-shell"
      ref={shellRef}
      onPointerLeave={handleShellPointerLeave}
      onPointerMove={handleShellPointerMove}
    >
      <canvas
        aria-label="Interactive timeline canvas"
        className="timeline-canvas"
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
            const innerW = width - PAD * 2;
            onAnimateZoom(1, innerW / 2);
          }

          if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            const innerW = width - PAD * 2;
            onAnimateZoom(-1, innerW / 2);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            const innerW = width - PAD * 2;
            onViewportChange((current) => panByPixels(current, 120, innerW));
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            const innerW = width - PAD * 2;
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
