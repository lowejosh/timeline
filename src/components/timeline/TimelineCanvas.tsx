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
  formatTimelineElapsedAxisLabel,
  formatTimelineElapsedAxisLabelLines,
  getDominantTimelineDateReference,
  formatTimelineYear,
} from "../../lib/rendering/bands";
import {
  compareEraPriorityAscending,
  type Era,
  type TimelineMarker,
  type TimelineOverlayBand,
} from "../../lib/domain/eras";
import {
  getEraTooltipContent,
  getMarkerTooltipContent,
  getOverlayTooltipContent,
  type TimelineTooltipContent,
} from "../../lib/app/tooltipModel";
import {
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_CHILD_ERA_ORDER,
  EARLY_UNIVERSE_START_YEAR,
} from "../../lib/domain/eraTrees/cosmic";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getMaxZoomForTimelineViewport,
  getViewportCenterYear,
  getZoomAnchorForCanvasX,
  getVisibleRangePrecise,
  type PreciseTimelineYear,
  screenToWorldPrecise,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  panByPixels,
  screenToWorld,
  toApproximateTimelineYear,
  worldToScreen,
  worldPreciseToScreen,
  zoomAtPosition,
  type TimelineViewport,
} from "../../lib/core/viewport";
import {
  getInteractiveDescendantEras,
  getPreviewFocusChain,
  resolveTimelineEraLayersFromOpacityMap,
  shouldHideOverlappedEraLabel,
} from "../../lib/rendering/childLayers";
import {
  getVisibleTimelineMarkers,
  resolveTimelineOverlayTracks,
  type ResolvedTimelineOverlayBand,
} from "../../lib/rendering/overlayTracks";
import {
  getExpandedOverlayPanelBounds,
  resolveExpandedOverlayLayout,
} from "../../lib/rendering/expandedOverlayLayout";
import {
  resolveOverlayLabelHoverBounds,
  resolveTextHoverBounds,
} from "../../lib/rendering/overlayLabelHover";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "../../lib/rendering/tooltipRetention";
import {
  getVisibleMarkerPositions,
  type MarkerTextMeasureInput,
  resolveMarkerRenderStates,
} from "../../lib/rendering/markerGlyphs";
import {
  resolveAxisTickRenderStates,
  type AxisTickRenderState,
} from "../../lib/rendering/axisTickStates";
import {
  isAnimatedContextBandLabelStateActive,
  resolveAnimatedContextBandLabelLayers,
  resolveContextBandLabelVariant,
  resolveContextBandRenderState,
  stepAnimatedContextBandLabelState,
  syncAnimatedContextBandLabelState,
  type AnimatedContextBandLabelState,
} from "../../lib/rendering/contextBands";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import {
  drawOverlayGroupIcon,
  resolveOverlayGroupIconLayout,
} from "../../lib/rendering/overlayGroupIcons";
import { clamp01, smoothstep01 } from "../../lib/core/easing";
import {
  parseColor,
  toCssColor,
  withAlpha,
} from "../../lib/rendering/canvas/colors";
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
  EARLY_UNIVERSE_BAND_EXPANSION_IDS,
  EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_LABELS,
  EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_MIN_CANVAS_HEIGHT_PX,
  EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_RESERVED_HEIGHT_PX,
  EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX,
  EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX,
  EARLY_UNIVERSE_INLINE_LABELS,
  FORCED_PRIMORDIAL_LABEL_IDS,
  PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS,
  PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW,
  resolveEraScreenSpanMap,
  resolvePrimordialDetailStripSegments,
  type PrimordialDetailStripSegment,
} from "../../lib/rendering/canvas/primordial";
import {
  type AxisLabelCandidate,
  getAllowedAxisLabelSteps,
  getCalendarAxisLabelText,
  getCalendarEdgeAxisLabelText,
  getPreferredAxisEdgeLabelStep,
  getPrimaryAxisLabelStepFromResolvedLabels,
  getTickScaleProgress,
  measureAxisLabelWidth,
  resolveAxisLabelCandidates,
  resolveAxisLabelCandidatesWithFallback,
  resolveAxisTickYear,
} from "../../lib/rendering/canvas/axisLabels";
import {
  getEraBackdropResetAlpha,
  getEraBandAlphaMultiplier,
  getEraInlineLabelVisibility,
  getExpandedOverlayChildRevealProgress,
  getExpandedOverlayChromeRailRevealProgress,
  getExpandedOverlayChromeStemRevealProgress,
  getExpandedOverlayLabelRevealProgress,
} from "../../lib/rendering/canvas/eraAnimation";
import {
  compareOverlayBands,
  findEraAtYear,
  getExpandedOverlayPanelHeight,
  getOverlayLaneY,
  getTimelineLayout,
  resolveExpandedOverlayConnectorGeometry,
  resolveExpandedOverlayDetails,
} from "../../lib/rendering/canvas/overlayLayout";
import {
  clipCanvasOutsideOcclusionRects,
  drawPaperOverlayBand,
  getOverlayLabelPaint,
  pushCanvasOcclusionRect,
  resolveOverlayBandLabelInsets,
  type CanvasOcclusionRect,
} from "../../lib/rendering/canvas/drawing";
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

type HoverRegion = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  anchorX: number;
  anchorY: number;
  anchorMode?: "fixed" | "follow-x";
  placement: "above" | "below";
  tooltip: TimelineTooltipContent;
};

type OverlayInteractionRegion = {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  role: "parent" | "child" | "panel";
  parentId?: string;
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
  AXIS_LABEL_OCCUPIED_PADDING,
  AXIS_TICK_OVERSCAN_PX,
  CALENDAR_DAY_STEP,
  canExpandOverlayParent,
  CLICK_DRAG_THRESHOLD,
  CONTEXT_BAND_LABEL_TRANSITION_DURATION_MS,
  EDGE_AXIS_LABEL_SNAP_TOLERANCE_PX,
  ERA_BAND_ALPHA,
  EXPANDED_OVERLAY_CHILD_BORDER_ALPHA,
  EXPANDED_OVERLAY_CHILD_SLIDE_PX,
  EXPANDED_OVERLAY_CONNECTOR_ALPHA,
  EXPANDED_OVERLAY_CONNECTOR_LINE_WIDTH,
  EXPANDED_OVERLAY_INTERACTION_REVEAL_THRESHOLD,
  EXPANDED_OVERLAY_TOP_PADDING,
  MIN_VISIBLE_OVERLAY_CHILD_WIDTH,
  OVERLAY_BAND_ALPHA,
  OVERLAY_BAND_ENTER_SLIDE_PX,
  OVERLAY_BAND_EXIT_SLIDE_PX,
  OVERLAY_GROUP_ICON_CHILD_ALPHA,
  OVERLAY_GROUP_ICON_PARENT_ALPHA,
  OVERLAY_LANE_GAP,
  OVERLAY_LANE_HEIGHT,
  PAD,
  PARENT_ERA_TINT_ALPHA,
  SUBYEAR_PRIMARY_FONT,
  SUBYEAR_SECONDARY_FONT,
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
      const axisY = layout.axisY;
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
      const overlayLabelAnimationStates = overlayLabelAnimationRef.current;
      const activeOverlayLabelKeys = new Set<string>();
      let hasActiveOverlayLabelAnimation = false;
      const hoverRegions: HoverRegion[] = [];
      const overlayInteractionRegions: OverlayInteractionRegion[] = [];
      const overlayOcclusionRects: CanvasOcclusionRect[] = [];
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

      const background = context.createLinearGradient(0, 0, 0, sceneHeight);
      background.addColorStop(0, paper);
      background.addColorStop(1, paperDeep);
      context.clearRect(0, 0, sceneWidth, sceneHeight);
      context.fillStyle = background;
      context.fillRect(0, 0, sceneWidth, sceneHeight);
      markPerf("setupMs");

      const parentTintColor = sceneParentEra
        ? parseColor(sceneParentEra.color)
        : null;

      if (parentTintColor && parentTintColor.a > 0.001) {
        context.fillStyle = toCssColor(
          withAlpha(parentTintColor, PARENT_ERA_TINT_ALPHA),
        );
        context.fillRect(pad, 0, innerWidth, sceneHeight);
      }

      const renderEra = (layer: (typeof visibleEraLayers)[number]) => {
        const { era, opacity } = layer;

        if (opacity < 0.01) return;

        const screenSpan = eraScreenSpanById.get(era.id);
        const x0 = screenSpan?.x0 ?? toX(era.startYear);
        const x1 = screenSpan?.x1 ?? toX(era.endYear);
        const eraWidth = x1 - x0;
        const renderState = resolveContextBandRenderState({
          x0,
          x1,
          minX: pad,
          maxX: sceneWidth - pad,
          devicePixelRatio,
        });

        if (!renderState) return;

        context.save();
        const backdropResetAlpha =
          getEraBackdropResetAlpha(layer.depth, opacity) *
          renderState.alphaMultiplier;

        if (backdropResetAlpha > 0.001) {
          context.globalAlpha = backdropResetAlpha;
          context.fillStyle = background;
          context.fillRect(
            renderState.renderLeft,
            0,
            renderState.renderWidth,
            sceneHeight,
          );
        }
        context.globalAlpha =
          opacity *
          ERA_BAND_ALPHA *
          getEraBandAlphaMultiplier(era, layer.depth) *
          renderState.alphaMultiplier;
        context.fillStyle = era.color;
        context.fillRect(
          renderState.renderLeft,
          0,
          renderState.renderWidth,
          sceneHeight,
        );
        context.restore();

        const shouldHideInlineLabel = breadcrumbChainIds.has(era.id);
        const isPrimordialEra = EARLY_UNIVERSE_BAND_EXPANSION_IDS.has(era.id);
        const visibleEraWidth = Math.max(
          Math.min(x1, sceneWidth - pad) - Math.max(x0, pad),
          0,
        );
        const allowsNormalPrimordialLabelBypass =
          FORCED_PRIMORDIAL_LABEL_IDS.has(era.id) && visibleEraWidth >= 44;
        const usesForcedPrimordialLabel =
          allowPrimordialSyntheticDetail &&
          FORCED_PRIMORDIAL_LABEL_IDS.has(era.id) &&
          visibleEraWidth < 44;
        const usesExpandedPrimordialLabel =
          allowPrimordialSyntheticDetail &&
          screenSpan?.usesVisualExpansion === true;
        const usesCompactPrimordialLabel =
          allowPrimordialSyntheticDetail &&
          isPrimordialEra &&
          !usesExpandedPrimordialLabel &&
          eraWidth < 60;
        const labelText =
          usesExpandedPrimordialLabel || usesCompactPrimordialLabel
            ? (EARLY_UNIVERSE_INLINE_LABELS[era.id] ?? era.name)
            : era.name;
        const labelMinWidth = usesForcedPrimordialLabel
          ? 8
          : usesExpandedPrimordialLabel
            ? EARLY_UNIVERSE_EXPANDED_LABEL_MIN_WIDTH_PX
            : usesCompactPrimordialLabel
              ? EARLY_UNIVERSE_COMPACT_LABEL_MIN_WIDTH_PX
              : 60;
        const labelFadeWidth = usesForcedPrimordialLabel
          ? 18
          : usesExpandedPrimordialLabel
            ? EARLY_UNIVERSE_EXPANDED_LABEL_FADE_WIDTH_PX
            : usesCompactPrimordialLabel
              ? EARLY_UNIVERSE_COMPACT_LABEL_FADE_WIDTH_PX
              : 120;
        const labelFont = usesForcedPrimordialLabel
          ? "9px var(--font-sans)"
          : usesExpandedPrimordialLabel || usesCompactPrimordialLabel
            ? "10px var(--font-sans)"
            : "11px var(--font-sans)";

        if (
          visibleEraWidth > labelMinWidth &&
          (!shouldHideInlineLabel || allowsNormalPrimordialLabelBypass)
        ) {
          const labelX =
            Math.max(x0, pad) / 2 + Math.min(x1, sceneWidth - pad) / 2;
          const labelBaselineY = axisY - 44;
          const labelVisibility = getEraInlineLabelVisibility(
            layer.childOpacity,
          );
          const labelAlpha =
            Math.min((visibleEraWidth - labelMinWidth) / labelFadeWidth, 1) *
            labelVisibility *
            (usesForcedPrimordialLabel
              ? 0.68
              : 0.28 + Math.min(opacity, 1) * 0.22);

          context.save();
          context.font = labelFont;
          const labelMetrics = context.measureText(labelText);
          context.restore();

          const shouldHideForPriorityOverlap = shouldHideOverlappedEraLabel(
            layer,
            visibleEraLayers,
            sceneViewport,
            sceneWidth,
            PAD,
            labelMetrics.width,
          );

          if (
            shouldHideForPriorityOverlap &&
            !screenSpan?.usesVisualExpansion &&
            !usesCompactPrimordialLabel &&
            !usesForcedPrimordialLabel &&
            !allowsNormalPrimordialLabelBypass
          ) {
            return;
          }

          context.save();
          context.globalAlpha = labelAlpha;
          context.font = labelFont;
          context.fillStyle = labelColor;
          context.textAlign = "center";
          context.textBaseline = "bottom";
          context.fillText(labelText, labelX, labelBaselineY);
          context.restore();

          if (labelAlpha > 0.01) {
            const labelTop =
              labelBaselineY -
              Math.max(labelMetrics.actualBoundingBoxAscent, 8);
            const labelBottom =
              labelBaselineY +
              Math.max(labelMetrics.actualBoundingBoxDescent, 2);
            const hoverBounds = resolveTextHoverBounds({
              centerX: labelX,
              labelWidth: labelMetrics.width,
              boxTop: labelTop,
              boxBottom: labelBottom,
              paddingX: 8,
              paddingY: 4,
            });

            hoverRegions.push({
              id: `era:${era.id}`,
              left: hoverBounds.left,
              right: hoverBounds.right,
              top: hoverBounds.top,
              bottom: hoverBounds.bottom,
              anchorX: labelX,
              anchorY: labelTop - 2,
              anchorMode: "fixed",
              placement: "above",
              tooltip: getEraTooltipContent(era),
            });
          }
        }
      };

      const drawAnimatedOverlayLabel = ({
        key,
        fullLabel,
        shortLabel,
        renderX,
        renderWidth,
        labelLeftInset = 0,
        labelRightInset = 0,
        y,
        fillStyle,
        alpha,
        hoverId,
        tooltip,
      }: {
        key: string;
        fullLabel: string;
        shortLabel: string;
        renderX: number;
        renderWidth: number;
        labelLeftInset?: number;
        labelRightInset?: number;
        y: number;
        fillStyle: string;
        alpha: number;
        hoverId?: string;
        tooltip?: TimelineTooltipContent;
      }) => {
        const contentLeft = renderX + labelLeftInset;
        const contentRight = renderX + renderWidth - labelRightInset;
        const contentWidth = Math.max(contentRight - contentLeft, 0);

        context.font = "11px var(--font-sans)";
        const fullLabelWidth = context.measureText(fullLabel).width;
        const hasDistinctShortLabel = shortLabel !== fullLabel;
        const shortLabelWidth = !hasDistinctShortLabel
          ? fullLabelWidth
          : context.measureText(shortLabel).width;
        const existingState = overlayLabelAnimationStates.get(key);
        const steppedExistingState = existingState
          ? stepAnimatedContextBandLabelState(existingState, drawNow)
          : undefined;
        const currentVariant = steppedExistingState?.toVariant ?? "hidden";
        const nextVariant = resolveContextBandLabelVariant({
          availableWidth: contentWidth,
          fullLabelWidth,
          shortLabelWidth,
          currentVariant,
          hasDistinctShortLabel,
        });
        const nextState = syncAnimatedContextBandLabelState({
          existing: steppedExistingState,
          nextVariant,
          now: drawNow,
          duration: CONTEXT_BAND_LABEL_TRANSITION_DURATION_MS,
          hasInitialized: overlayLabelAnimationInitializedRef.current,
        });
        const layers = resolveAnimatedContextBandLabelLayers(nextState, drawNow)
          .map((layer) => ({
            ...layer,
            text: layer.variant === "full" ? fullLabel : shortLabel,
            width: layer.variant === "full" ? fullLabelWidth : shortLabelWidth,
          }))
          .filter((layer) => layer.opacity > 0.01);

        overlayLabelAnimationStates.set(key, nextState);
        activeOverlayLabelKeys.add(key);

        if (isAnimatedContextBandLabelStateActive(nextState, drawNow)) {
          hasActiveOverlayLabelAnimation = true;
        }

        const dominantLayer = layers.reduce<{
          variant: "short" | "full";
          opacity: number;
          text: string;
          width: number;
        } | null>(
          (best, layer) =>
            !best || layer.opacity > best.opacity ? layer : best,
          null,
        );

        if (dominantLayer && hoverId && tooltip) {
          const hoverBounds = resolveOverlayLabelHoverBounds({
            centerX: contentLeft + contentWidth / 2,
            labelWidth: dominantLayer.width,
            bandLeft: contentLeft,
            bandRight: contentRight,
            bandTop: y,
            bandBottom: y + OVERLAY_LANE_HEIGHT,
          });

          hoverRegions.push({
            id: hoverId,
            left: hoverBounds.left,
            right: hoverBounds.right,
            top: hoverBounds.top,
            bottom: hoverBounds.bottom,
            anchorX: contentLeft + contentWidth / 2,
            anchorY: y + 2,
            anchorMode: "follow-x",
            placement: "above",
            tooltip,
          });
        }

        for (const layer of layers) {
          context.save();
          context.fillStyle = fillStyle;
          context.globalAlpha = alpha * layer.opacity;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            layer.text,
            contentLeft + contentWidth / 2,
            y + OVERLAY_LANE_HEIGHT / 2,
          );
          context.restore();
        }
      };

      const drawAnimatedOverlayDisclosureIndicator = ({
        centerX,
        centerY,
        strokeStyle,
        alpha,
        progress,
      }: {
        centerX: number;
        centerY: number;
        strokeStyle: string;
        alpha: number;
        progress: number;
      }) => {
        const easedProgress = smoothstep01(progress);

        context.save();
        context.translate(centerX, centerY);
        context.rotate(Math.PI * easedProgress);
        context.strokeStyle = strokeStyle;
        context.globalAlpha = alpha;
        context.lineWidth = 1.4;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(-3.5, -1.5);
        context.lineTo(0, 1.5);
        context.lineTo(3.5, -1.5);
        context.stroke();
        context.restore();
      };

      for (const layer of paintOrderedEraLayers) {
        renderEra(layer);
      }

      if (
        renderedPrimordialDetailStripSegments.length > 0 &&
        primordialDetailStripOpacity > 0.01
      ) {
        const stripPanelPaddingTop = 14;
        const stripPanelPaddingBottom = 6;
        const overviewReservedHeight =
          sceneHeight >=
          EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_MIN_CANVAS_HEIGHT_PX
            ? EARLY_UNIVERSE_DETAIL_STRIP_OVERVIEW_RESERVED_HEIGHT_PX
            : 0;
        const stripPanelTop =
          sceneHeight -
          overviewReservedHeight -
          (EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX +
            stripPanelPaddingTop +
            stripPanelPaddingBottom);
        const stripPanelHeight =
          EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX +
          stripPanelPaddingTop +
          stripPanelPaddingBottom;
        const stripBottomY =
          stripPanelTop + stripPanelHeight - stripPanelPaddingBottom;
        const stripTopY = stripBottomY - EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX;
        const stripLabelBaselineY = stripTopY - 3;

        for (const segment of renderedPrimordialDetailStripSegments) {
          const segmentWidth = segment.x1 - segment.x0;
          const labelText =
            EARLY_UNIVERSE_DETAIL_STRIP_LABELS[segment.era.id] ??
            EARLY_UNIVERSE_INLINE_LABELS[segment.era.id] ??
            segment.era.name;

          context.save();
          context.globalAlpha = 0.92 * primordialDetailStripOpacity;
          context.fillStyle = segment.era.color;
          context.fillRect(
            segment.x0,
            stripTopY,
            segmentWidth,
            EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX,
          );
          context.strokeStyle = lineSoft;
          context.globalAlpha = 0.55 * primordialDetailStripOpacity;
          context.strokeRect(
            segment.x0 + 0.5,
            stripTopY + 0.5,
            Math.max(segmentWidth - 1, 0),
            Math.max(EARLY_UNIVERSE_DETAIL_STRIP_HEIGHT_PX - 1, 0),
          );
          context.restore();

          context.save();
          context.font = "8px var(--font-sans)";
          const labelWidth = context.measureText(labelText).width;
          context.restore();

          if (labelWidth + 6 <= segmentWidth) {
            context.save();
            context.globalAlpha = 0.82 * primordialDetailStripOpacity;
            context.font = "8px var(--font-sans)";
            context.fillStyle = labelColor;
            context.textAlign = "center";
            context.textBaseline = "bottom";
            context.fillText(
              labelText,
              segment.x0 + segmentWidth / 2,
              stripLabelBaselineY,
            );
            context.restore();
          }

          if (primordialDetailStripOpacity >= 0.35) {
            hoverRegions.push({
              id: `era:detail-strip:${segment.era.id}`,
              left: segment.x0,
              right: segment.x1,
              top: stripPanelTop,
              bottom: stripBottomY + 4,
              anchorX: segment.x0 + segmentWidth / 2,
              anchorY: stripTopY - 2,
              anchorMode: "fixed",
              placement: "above",
              tooltip: getEraTooltipContent(segment.era),
            });
          }
        }
      }
      markPerf("eraMs");

      if (animatedOverlayBands.length > 0) {
        for (const overlayState of animatedOverlayBands) {
          const overlay = overlayState.overlay;
          const bandWidth = overlay.renderWidth;
          const isVisibleOverlay = visibleOverlayIds.has(overlay.band.id);
          const canExpandParent = canExpandOverlayParent(
            bandWidth,
            overlay.band.children?.length ?? 0,
          );
          const expandedShift = isVisibleOverlay
            ? (resolvedOverlayLayout.yById.get(overlay.band.id) ??
                getOverlayLaneY(layout, overlay.laneIndex)) -
              getOverlayLaneY(layout, overlay.laneIndex)
            : 0;
          const motionOffset =
            overlayState.targetOpacity > overlayState.currentOpacity
              ? (1 - overlayState.currentOpacity) * OVERLAY_BAND_ENTER_SLIDE_PX
              : -(1 - overlayState.currentOpacity) * OVERLAY_BAND_EXIT_SLIDE_PX;
          const y = overlayState.currentY + expandedShift + motionOffset;

          if (isVisibleOverlay && canExpandParent) {
            overlayInteractionRegions.push({
              id: overlay.band.id,
              left: overlay.renderX,
              right: overlay.renderX + bandWidth,
              top: y - 4,
              bottom: y + OVERLAY_LANE_HEIGHT + 4,
              role: "parent",
            });
          }

          pushCanvasOcclusionRect(overlayOcclusionRects, {
            left: overlay.renderX,
            right: overlay.renderX + bandWidth,
            top: y,
            bottom: y + OVERLAY_LANE_HEIGHT,
          });

          context.save();
          const overlayBandOpacity = OVERLAY_BAND_ALPHA;
          const overlayLabelPaint = getOverlayLabelPaint(
            overlay.band.color,
            overlayBandOpacity,
            labelColor,
            paper,
          );

          drawPaperOverlayBand({
            context,
            x: overlay.renderX,
            y,
            width: bandWidth,
            height: OVERLAY_LANE_HEIGHT,
            bandColor: overlay.band.color,
            alpha:
              overlayBandOpacity *
              overlay.renderAlphaMultiplier *
              overlayState.currentOpacity,
            borderStyle: lineSoft,
            drawBorder: !overlay.isHairline,
          });

          const iconLayout = resolveOverlayGroupIconLayout({
            groupId: overlay.band.groupId,
            bandLeft: overlay.renderX,
            bandTop: y,
            bandWidth,
            bandHeight: OVERLAY_LANE_HEIGHT,
          });
          const labelInsets = resolveOverlayBandLabelInsets({
            iconReservedWidth: iconLayout?.reservedWidth ?? 0,
            hasDisclosure: isVisibleOverlay && canExpandParent,
          });

          if (iconLayout) {
            drawOverlayGroupIcon({
              context,
              layout: iconLayout,
              strokeStyle: overlayLabelPaint.fillStyle,
              alpha:
                OVERLAY_GROUP_ICON_PARENT_ALPHA * overlayState.currentOpacity,
            });
          }

          const fullLabel = overlay.band.label;
          const shortLabel = overlay.band.shortLabel ?? fullLabel;
          drawAnimatedOverlayLabel({
            key: `overlay:${overlay.band.id}`,
            fullLabel,
            shortLabel,
            renderX: overlay.renderX,
            renderWidth: bandWidth,
            labelLeftInset: labelInsets.left,
            labelRightInset: labelInsets.right,
            y,
            fillStyle: overlayLabelPaint.fillStyle,
            alpha: 0.82 * overlayState.currentOpacity,
            hoverId: isVisibleOverlay ? overlay.band.id : undefined,
            tooltip: isVisibleOverlay
              ? getOverlayTooltipContent(overlay.band)
              : undefined,
          });

          if (isVisibleOverlay && canExpandParent) {
            const indicatorOpacity = clamp01((bandWidth - 26) / 18);

            if (indicatorOpacity > 0.01) {
              const indicatorCenterX = overlay.renderX + bandWidth - 10;
              const indicatorCenterY = y + OVERLAY_LANE_HEIGHT / 2;
              const indicatorProgress =
                expandedOverlayProgressByIdRef.current.get(overlay.band.id) ??
                0;

              drawAnimatedOverlayDisclosureIndicator({
                centerX: indicatorCenterX,
                centerY: indicatorCenterY,
                strokeStyle: overlayLabelPaint.fillStyle,
                alpha: 0.74 * indicatorOpacity,
                progress: indicatorProgress,
              });
            }
          }

          context.restore();
        }
      }

      for (const {
        detail: expandedOverlayDetail,
        progress: expandedOverlayProgress,
        animatedHeight: expandedOverlayAnimatedHeight,
      } of expandedOverlayExpansionStates) {
        if (expandedOverlayAnimatedHeight <= 0.5) {
          continue;
        }

        const panelHeight = expandedOverlayAnimatedHeight;
        const parentY =
          resolvedOverlayLayout.yById.get(
            expandedOverlayDetail.parent.band.id,
          ) ?? getOverlayLaneY(layout, expandedOverlayDetail.parent.laneIndex);
        const { panelTop } = getExpandedOverlayPanelBounds(
          parentY,
          panelHeight,
          OVERLAY_LANE_HEIGHT,
        );
        const panelLeft = expandedOverlayDetail.parent.renderX;
        const panelRight = panelLeft + expandedOverlayDetail.panelWidth;
        const panelInnerLeft = panelLeft;
        const panelInnerRight = panelRight;
        const parentCenterX = panelLeft + expandedOverlayDetail.panelWidth / 2;
        const parentColor = parseColor(
          expandedOverlayDetail.parent.band.color,
        ) ?? {
          r: 180,
          g: 120,
          b: 70,
          a: 1,
        };
        const connectorStroke = toCssColor(
          withAlpha(parentColor, EXPANDED_OVERLAY_CONNECTOR_ALPHA),
        );
        const childBorder = toCssColor(
          withAlpha(parentColor, EXPANDED_OVERLAY_CHILD_BORDER_ALPHA),
        );
        const connectorGeometry = resolveExpandedOverlayConnectorGeometry(
          expandedOverlayDetail.children,
          panelLeft,
          panelRight,
          parentCenterX,
          parentY + OVERLAY_LANE_HEIGHT,
          panelTop,
        );
        const chromeStemReveal = getExpandedOverlayChromeStemRevealProgress(
          expandedOverlayProgress,
        );
        const chromeRailReveal = getExpandedOverlayChromeRailRevealProgress(
          expandedOverlayProgress,
        );
        const revealedStemBottom =
          connectorGeometry.stemTop +
          (connectorGeometry.stemBottom - connectorGeometry.stemTop) *
            chromeStemReveal;
        const revealedRailLeft =
          connectorGeometry.stemX +
          (connectorGeometry.railLeft - connectorGeometry.stemX) *
            chromeRailReveal;
        const revealedRailRight =
          connectorGeometry.stemX +
          (connectorGeometry.railRight - connectorGeometry.stemX) *
            chromeRailReveal;

        overlayInteractionRegions.push({
          id: expandedOverlayDetail.parent.band.id,
          left: connectorGeometry.railLeft - 6,
          right: connectorGeometry.railRight + 6,
          top: parentY + OVERLAY_LANE_HEIGHT - 4,
          bottom: panelTop + EXPANDED_OVERLAY_TOP_PADDING + 6,
          role: "panel",
          parentId: expandedOverlayDetail.parent.band.id,
        });

        context.save();
        clipCanvasOutsideOcclusionRects(
          context,
          width,
          height,
          overlayOcclusionRects,
        );
        context.strokeStyle = connectorStroke;
        context.lineWidth = EXPANDED_OVERLAY_CONNECTOR_LINE_WIDTH;
        context.lineCap = "round";

        if (chromeStemReveal > 0.01) {
          context.globalAlpha = chromeStemReveal;
          context.beginPath();
          context.moveTo(connectorGeometry.stemX, connectorGeometry.stemTop);
          context.lineTo(connectorGeometry.stemX, revealedStemBottom);
          context.stroke();
        }

        if (chromeRailReveal > 0.01) {
          context.globalAlpha = chromeRailReveal;
          context.beginPath();
          context.moveTo(revealedRailLeft, connectorGeometry.railY);
          context.lineTo(revealedRailRight, connectorGeometry.railY);
          context.stroke();
        }

        context.restore();

        for (const child of expandedOverlayDetail.children) {
          const clippedX0 = Math.max(child.x0, panelInnerLeft);
          const clippedX1 = Math.min(child.x1, panelInnerRight);
          const clippedWidth = Math.max(clippedX1 - clippedX0, 0);

          if (clippedWidth < MIN_VISIBLE_OVERLAY_CHILD_WIDTH) {
            continue;
          }

          const renderWidth = clippedWidth;
          const renderX = clippedX0;
          const childY =
            panelTop +
            EXPANDED_OVERLAY_TOP_PADDING +
            child.laneIndex * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP);
          const childReveal = getExpandedOverlayChildRevealProgress(
            expandedOverlayProgress,
            child.laneIndex,
          );

          if (childReveal <= 0.01) {
            continue;
          }

          const childLabelReveal = getExpandedOverlayLabelRevealProgress(
            expandedOverlayProgress,
            child.laneIndex,
          );
          const childRenderY =
            childY - (1 - childReveal) * EXPANDED_OVERLAY_CHILD_SLIDE_PX;
          const childConnectorX = renderX + renderWidth / 2;
          const childBandOpacity = OVERLAY_BAND_ALPHA;
          const childLabelPaint = getOverlayLabelPaint(
            child.band.color,
            childBandOpacity,
            labelColor,
            paper,
          );

          pushCanvasOcclusionRect(overlayOcclusionRects, {
            left: renderX,
            right: renderX + renderWidth,
            top: childRenderY,
            bottom: childRenderY + OVERLAY_LANE_HEIGHT,
          });

          if (childReveal >= EXPANDED_OVERLAY_INTERACTION_REVEAL_THRESHOLD) {
            overlayInteractionRegions.push({
              id: child.band.id,
              left: renderX,
              right: renderX + renderWidth,
              top: childRenderY - 3,
              bottom: childRenderY + OVERLAY_LANE_HEIGHT + 3,
              role: "child",
              parentId: expandedOverlayDetail.parent.band.id,
            });
          }

          context.save();
          clipCanvasOutsideOcclusionRects(
            context,
            width,
            height,
            overlayOcclusionRects,
          );
          context.strokeStyle = connectorStroke;
          context.lineWidth = 1;
          context.lineCap = "round";
          context.globalAlpha = childReveal;
          context.beginPath();
          context.moveTo(childConnectorX, connectorGeometry.railY);
          context.lineTo(
            childConnectorX,
            connectorGeometry.railY +
              (childRenderY - connectorGeometry.railY) * childReveal,
          );
          context.stroke();
          context.restore();

          context.save();
          drawPaperOverlayBand({
            context,
            x: renderX,
            y: childRenderY,
            width: renderWidth,
            height: OVERLAY_LANE_HEIGHT,
            bandColor: child.band.color,
            alpha: childBandOpacity * childReveal,
            borderStyle: childBorder,
            drawBorder: true,
          });

          const childIconLayout = resolveOverlayGroupIconLayout({
            groupId: child.band.groupId,
            bandLeft: renderX,
            bandTop: childRenderY,
            bandWidth: renderWidth,
            bandHeight: OVERLAY_LANE_HEIGHT,
          });
          const childLabelInsets = resolveOverlayBandLabelInsets({
            iconReservedWidth: childIconLayout?.reservedWidth ?? 0,
          });

          if (childIconLayout) {
            drawOverlayGroupIcon({
              context,
              layout: childIconLayout,
              strokeStyle: childLabelPaint.fillStyle,
              alpha: OVERLAY_GROUP_ICON_CHILD_ALPHA * childReveal,
            });
          }

          const fullLabel = child.band.label;
          const shortLabel = child.band.shortLabel ?? fullLabel;

          if (childLabelReveal > 0.01) {
            drawAnimatedOverlayLabel({
              key: `overlay:${child.band.id}`,
              fullLabel,
              shortLabel,
              renderX,
              renderWidth,
              labelLeftInset: childLabelInsets.left,
              labelRightInset: childLabelInsets.right,
              y: childRenderY,
              fillStyle: childLabelPaint.fillStyle,
              alpha: 0.8 * childReveal * childLabelReveal,
              hoverId: child.band.id,
              tooltip: getOverlayTooltipContent(child.band),
            });
          }

          context.restore();
        }
      }

      markPerf("overlayMs");

      {
        const rootLabel = breadcrumbChain[0]?.name ?? sceneActiveEra.name;
        const trailLabel = breadcrumbChain
          .slice(1)
          .map((era) => era.name)
          .join(" • ");
        const trailText = trailLabel ? ` • ${trailLabel}` : "";
        const breadcrumbFont =
          breadcrumbChain.length > 1
            ? "600 14px var(--font-sans)"
            : "500 13px var(--font-sans)";
        context.save();
        context.font = breadcrumbFont;
        context.fillStyle = labelColor;
        context.textAlign = "left";
        context.textBaseline = "top";
        const rootWidth = context.measureText(rootLabel).width;
        const trailWidth = trailText ? context.measureText(trailText).width : 0;
        const startX = sceneWidth / 2 - (rootWidth + trailWidth) / 2;

        context.globalAlpha = breadcrumbChain.length > 1 ? 0.9 : 0.76;
        context.fillText(rootLabel, startX, layout.breadcrumbY);

        if (trailText) {
          context.globalAlpha = 0.8;
          context.fillText(trailText, startX + rootWidth, layout.breadcrumbY);
        }

        context.restore();
      }

      context.strokeStyle = line;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(pad, axisY);
      context.lineTo(sceneWidth - pad, axisY);
      context.stroke();

      const fromX = (px: number) =>
        screenToWorldPrecise(px - pad, sceneViewport, innerWidth);
      const edgeLeftPreciseYear = fromX(pad);
      const edgeRightPreciseYear = fromX(sceneWidth - pad);
      const edgeLeftYear = toApproximateTimelineYear(edgeLeftPreciseYear);
      const edgeRightYear = toApproximateTimelineYear(edgeRightPreciseYear);
      const edgeLeftSnapToleranceYears = Math.max(
        Math.abs(
          subtractPreciseTimelineYears(
            fromX(pad + EDGE_AXIS_LABEL_SNAP_TOLERANCE_PX),
            edgeLeftPreciseYear,
          ),
        ),
        1e-18,
      );
      const edgeLeftX = pad;
      const edgeRightX = sceneWidth - pad;
      const edgeLabelStep = (() => {
        const preferredStep = getPreferredAxisEdgeLabelStep(
          resolvedAxisTickStates,
        );

        if (preferredStep !== undefined) {
          return preferredStep;
        }

        const visibleSpan = Math.max(
          Math.abs(
            subtractPreciseTimelineYears(
              edgeRightPreciseYear,
              edgeLeftPreciseYear,
            ),
          ),
          1e-18,
        );
        const approximateMajorCount = Math.max(2, Math.floor(innerWidth / 280));

        return Math.max(visibleSpan / approximateMajorCount, 1e-18);
      })();
      const fineGrainedAxisMode =
        edgeLabelStep < 1
          ? (() => {
              const dominantReference = getDominantTimelineDateReference(
                edgeLeftPreciseYear,
                edgeRightPreciseYear,
              );

              if (dominantReference !== null) {
                return dominantReference === "elapsed" ? "elapsed" : "calendar";
              }

              return null;
            })()
          : null;
      const visibleSpan = Math.max(
        Math.abs(
          subtractPreciseTimelineYears(
            edgeRightPreciseYear,
            edgeLeftPreciseYear,
          ),
        ),
        1e-18,
      );
      const earlyUniverseOverlapStart = Math.max(
        edgeLeftYear,
        EARLY_UNIVERSE_START_YEAR,
      );
      const earlyUniverseOverlapEnd = Math.min(
        edgeRightYear,
        EARLY_UNIVERSE_END_YEAR,
      );
      const earlyUniverseOverlap = Math.max(
        0,
        earlyUniverseOverlapEnd - earlyUniverseOverlapStart,
      );
      const startsAtBigBang =
        comparePreciseTimelineYears(
          edgeLeftPreciseYear,
          splitTimelineYear(TIMELINE_MIN_YEAR),
        ) === 0;
      const viewportFullyInEarlyUniverse =
        edgeLeftPreciseYear.wholeYear >=
          Math.floor(EARLY_UNIVERSE_START_YEAR) &&
        edgeRightPreciseYear.wholeYear <= Math.ceil(EARLY_UNIVERSE_END_YEAR);
      const isFullyZoomedOut =
        sceneViewport.zoom <= getMinZoomForWidth(innerWidth) + 0.001;
      const useBigBangElapsedLabels =
        !isFullyZoomedOut &&
        (startsAtBigBang ||
          viewportFullyInEarlyUniverse ||
          earlyUniverseOverlap / visibleSpan >= 0.75);
      const [debugVisibleStart, debugVisibleEnd] = getVisibleRangePrecise(
        sceneViewport,
        innerWidth,
      );
      const debugEarlyUniverseOverlapStart = Math.max(
        toApproximateTimelineYear(debugVisibleStart),
        EARLY_UNIVERSE_START_YEAR,
      );
      const debugEarlyUniverseOverlapEnd = Math.min(
        toApproximateTimelineYear(debugVisibleEnd),
        EARLY_UNIVERSE_END_YEAR,
      );
      const debugFloatOverlapRatio =
        Math.max(
          0,
          debugEarlyUniverseOverlapEnd - debugEarlyUniverseOverlapStart,
        ) / visibleSpan;
      const visiblePrimordialLayerIds = visibleEraLayers
        .filter((layer) => EARLY_UNIVERSE_BAND_EXPANSION_IDS.has(layer.era.id))
        .map((layer) => layer.era.id);
      const primordialSpanDebug = EARLY_UNIVERSE_CHILD_ERA_ORDER.map(
        (eraId) => {
          const span = eraScreenSpanById.get(eraId);

          return {
            id: eraId,
            width: span ? Number((span.x1 - span.x0).toFixed(2)) : null,
            expanded: span?.usesVisualExpansion === true,
          };
        },
      );
      const primordialDetailStripDebug = primordialDetailStripSegments.map(
        (segment) => ({
          id: segment.era.id,
          width: Number((segment.x1 - segment.x0).toFixed(2)),
        }),
      );
      const renderedPrimordialDetailStripDebug =
        renderedPrimordialDetailStripSegments.map((segment) => ({
          id: segment.era.id,
          width: Number((segment.x1 - segment.x0).toFixed(2)),
        }));
      const primordialDebugActive =
        allowPrimordialSyntheticDetail ||
        viewportFullyInEarlyUniverse ||
        sceneViewport.zoom >= sceneMaxZoom - 0.01;

      if (primordialDebugActive) {
        const debugSnapshot = {
          activeEraId: sceneActiveEra.id,
          breadcrumbIds: breadcrumbChain.map((era) => era.id),
          zoom: Number(sceneViewport.zoom.toFixed(6)),
          sceneMaxZoom: Number(sceneMaxZoom.toFixed(6)),
          zoomDeltaToMax: Number(
            (sceneMaxZoom - sceneViewport.zoom).toFixed(6),
          ),
          allowPrimordialSyntheticDetail,
          startsAtBigBang,
          viewportFullyInEarlyUniverse,
          useBigBangElapsedLabels,
          edgeLabelStep,
          fineGrainedAxisMode,
          visibleSpanYears: Number(visibleSpan.toExponential(6)),
          floatOverlapRatio: Number(debugFloatOverlapRatio.toFixed(6)),
          visibleStart: {
            wholeYear: debugVisibleStart.wholeYear,
            fraction: Number(debugVisibleStart.fraction.toFixed(12)),
          },
          visibleEnd: {
            wholeYear: debugVisibleEnd.wholeYear,
            fraction: Number(debugVisibleEnd.fraction.toFixed(12)),
          },
          visiblePrimordialLayerIds,
          primordialSpanDebug,
          primordialDetailStripDebug,
          renderedPrimordialDetailStripDebug,
          primordialDetailStripOpacity: Number(
            primordialDetailStripOpacity.toFixed(3),
          ),
          axisTickSteps: [
            ...new Set(resolvedAxisTickStates.map((tick) => tick.step)),
          ]
            .slice(0, 8)
            .map((step) => Number(step.toExponential(6))),
        };
        const nextSignature = JSON.stringify(debugSnapshot);

        if (primordialDebugSignatureRef.current !== nextSignature) {
          primordialDebugSignatureRef.current = nextSignature;
          console.info("[timeline primordial debug]", debugSnapshot);
        }
      } else if (primordialDebugSignatureRef.current !== null) {
        primordialDebugSignatureRef.current = null;
      }
      const useSubYearAxis = fineGrainedAxisMode !== null;
      const useCalendarSubYearAxis = fineGrainedAxisMode === "calendar";
      const useElapsedSubYearAxis = fineGrainedAxisMode === "elapsed";
      const formatAxisLabel = (
        year: number | PreciseTimelineYear,
        step: number,
      ) =>
        useBigBangElapsedLabels
          ? formatTimelineElapsedAxisLabel(year, step, "after-big-bang")
          : formatTimelineYear(year, step, { mode: "axis" });
      const formatElapsedAxisLabel = (
        year: number | PreciseTimelineYear,
        step: number,
        options?: {
          snapToReferenceStartWithinYears?: number;
        },
      ) =>
        formatTimelineElapsedAxisLabelLines(
          year,
          step,
          useBigBangElapsedLabels ? "after-big-bang" : "ago",
          options,
        );

      if (resolvedAxisTickStates.length > 0) {
        context.save();
        context.lineWidth = 1;
        const majorExtraAbove = axisY - 10 - layout.majorTickTop;
        const majorExtraBelow = axisY + 28 - (axisY + 10);

        for (const tick of resolvedAxisTickStates) {
          const x =
            pad +
            (tick.wholeYear !== undefined && tick.yearFraction !== undefined
              ? worldPreciseToScreen(
                  {
                    wholeYear: tick.wholeYear,
                    fraction: tick.yearFraction,
                  },
                  sceneViewport,
                  innerWidth,
                )
              : worldToScreen(tick.year, sceneViewport, innerWidth));

          if (x < pad - 32 || x > sceneWidth - pad + 32) continue;

          const edgeFade = Math.min(
            Math.max(0, (x - pad) / 60),
            Math.max(0, (sceneWidth - pad - x) / 60),
            1,
          );

          if (edgeFade <= 0.01) {
            continue;
          }

          const distToMin = Math.abs(x - edgeLeftX);
          const distToMax = Math.abs(x - edgeRightX);
          const distToBound = Math.min(distToMin, distToMax);
          const boundaryFade =
            distToBound < 40 ? Math.max(0, (distToBound - 4) / 36) : 1;
          const scaleProgress = getTickScaleProgress(tick.pixelsPerStep);
          const emphasisProgress = Math.max(
            tick.majorProgress * 0.92,
            tick.labelOpacity * 0.7,
          );
          const baseFade =
            edgeFade * (1 - emphasisProgress + emphasisProgress * boundaryFade);
          const overlayFade = edgeFade * boundaryFade;
          const baseMinorExtent = 2.4 + 10.4 * Math.pow(scaleProgress, 0.88);
          const minorExtent =
            baseMinorExtent * (0.42 + tick.visibleProgress * 0.58);
          const top = axisY - minorExtent - majorExtraAbove * emphasisProgress;
          const bottom =
            axisY + minorExtent + majorExtraBelow * emphasisProgress;

          if (baseFade > 0.01) {
            context.strokeStyle = lineSoft;
            const minorOpacity =
              0.16 +
              0.24 * Math.pow(scaleProgress, 0.82) +
              tick.visibleProgress * 0.08;
            context.globalAlpha =
              (minorOpacity + emphasisProgress * 0.08) * baseFade;
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, bottom);
            context.stroke();
          }

          if (emphasisProgress > 0.01 && overlayFade > 0.01) {
            context.strokeStyle = line;
            context.globalAlpha =
              (0.3 + tick.labelOpacity * 0.24) * emphasisProgress * overlayFade;
            context.beginPath();
            context.moveTo(x, top);
            context.lineTo(x, bottom);
            context.stroke();
          }
        }

        context.restore();
      }

      const edgeTickData = [
        { year: edgeLeftPreciseYear, x: pad, align: "left" as const },
        {
          year: edgeRightPreciseYear,
          x: sceneWidth - pad,
          align: "right" as const,
        },
      ];

      for (const { year, x, align } of edgeTickData) {
        context.save();
        context.globalAlpha = 1;
        context.strokeStyle = line;
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(x, layout.majorTickTop);
        context.lineTo(x, axisY + 28);
        context.stroke();

        context.fillStyle = labelColor;
        context.textAlign = align;
        context.textBaseline = "top";

        if (useCalendarSubYearAxis) {
          const edgeLabel = getCalendarEdgeAxisLabelText(year, edgeLabelStep);

          context.globalAlpha = 0.9;
          context.font = SUBYEAR_PRIMARY_FONT;
          context.fillText(edgeLabel.text, x, layout.dateLabelY);
          context.globalAlpha = 0.72;
          context.font = SUBYEAR_SECONDARY_FONT;
          context.fillText(edgeLabel.secondaryText, x, layout.yearLabelY);
        } else if (useElapsedSubYearAxis) {
          const edgeLabel = formatElapsedAxisLabel(
            year,
            edgeLabelStep,
            x === pad
              ? {
                  snapToReferenceStartWithinYears: edgeLeftSnapToleranceYears,
                }
              : undefined,
          );

          if (!edgeLabel) {
            context.restore();
            continue;
          }

          if (edgeLabel.secondaryText) {
            context.globalAlpha = 0.9;
            context.font = SUBYEAR_PRIMARY_FONT;
            context.fillText(edgeLabel.primaryText, x, layout.dateLabelY);
            context.globalAlpha = 0.72;
            context.font = SUBYEAR_SECONDARY_FONT;
            context.fillText(edgeLabel.secondaryText, x, layout.yearLabelY);
          } else {
            context.globalAlpha = 0.86;
            context.font = SUBYEAR_PRIMARY_FONT;
            context.fillText(edgeLabel.primaryText, x, layout.yearLabelY);
          }
        } else {
          context.globalAlpha = 1;
          context.font = "11px var(--font-sans)";
          context.fillText(
            formatAxisLabel(year, edgeLabelStep),
            x,
            layout.yearLabelY,
          );
        }

        context.restore();
      }

      const edgeLabelLeftX = pad;
      const edgeLabelRightX = sceneWidth - pad;
      context.fillStyle = labelColor;
      context.textAlign = "center";
      context.textBaseline = "top";

      const axisLabelCandidates: AxisLabelCandidate[] = [];
      const yearBoundaryCandidates: AxisLabelCandidate[] = [];

      for (const tick of resolvedAxisTickStates) {
        if (tick.labelOpacity <= 0.01) {
          continue;
        }

        const tickYear = resolveAxisTickYear(tick);

        const resolvedX =
          pad +
          (tick.wholeYear !== undefined && tick.yearFraction !== undefined
            ? worldPreciseToScreen(
                {
                  wholeYear: tick.wholeYear,
                  fraction: tick.yearFraction,
                },
                sceneViewport,
                innerWidth,
              )
            : worldToScreen(tick.year, sceneViewport, innerWidth));

        if (resolvedX < pad - 80 || resolvedX > sceneWidth - pad + 80) continue;

        if (useSubYearAxis && tick.labelStep >= 1) {
          continue;
        }

        const calendarLabel = useCalendarSubYearAxis
          ? getCalendarAxisLabelText(tickYear, tick.labelStep)
          : null;
        const elapsedLabel = useElapsedSubYearAxis
          ? formatElapsedAxisLabel(tickYear, tick.labelStep)
          : null;
        const labelText = calendarLabel
          ? calendarLabel.text
          : (elapsedLabel?.primaryText ??
            formatAxisLabel(tickYear, tick.labelStep));
        const secondaryText =
          calendarLabel?.secondaryText ?? elapsedLabel?.secondaryText;

        if (!labelText) {
          continue;
        }

        const labelWidth = secondaryText
          ? measureAxisLabelWidth(
              context,
              labelText,
              SUBYEAR_PRIMARY_FONT,
              secondaryText,
              SUBYEAR_SECONDARY_FONT,
            )
          : (() => {
              context.font = useCalendarSubYearAxis
                ? SUBYEAR_PRIMARY_FONT
                : "13px var(--font-sans)";

              return context.measureText(labelText).width;
            })();

        const distToMin = Math.abs(resolvedX - edgeLabelLeftX);
        const distToMax = Math.abs(resolvedX - edgeLabelRightX);
        const distToBoundary = Math.min(distToMin, distToMax);
        const boundaryFade =
          distToBoundary < 100 ? Math.max(0, (distToBoundary - 20) / 80) : 1;
        const labelEdgeFade = Math.min(
          Math.max(0, (resolvedX - pad) / 60),
          Math.max(0, (sceneWidth - pad - resolvedX) / 60),
          1,
        );
        const labelAlpha = tick.labelOpacity * boundaryFade * labelEdgeFade;

        if (labelAlpha > 0.01) {
          axisLabelCandidates.push({
            x: resolvedX,
            text: labelText,
            secondaryText,
            width: labelWidth,
            alpha: labelAlpha,
            step: tick.labelStep,
            pixelsPerStep: tick.pixelsPerStep,
          });
        }
      }

      const {
        allowedSteps: allowedLabelSteps,
        primaryStep: primaryAllowedStep,
      } = getAllowedAxisLabelSteps(axisLabelCandidates, useSubYearAxis, {
        preferredStep: preferredAxisLabelStepRef.current,
      });

      const primaryEdgeLabelEntries = [
        {
          x: pad,
          ...(() => {
            if (useCalendarSubYearAxis) {
              return getCalendarEdgeAxisLabelText(
                edgeLeftPreciseYear,
                edgeLabelStep,
              );
            }

            if (useElapsedSubYearAxis) {
              const edgeLabel = formatElapsedAxisLabel(
                edgeLeftPreciseYear,
                edgeLabelStep,
                {
                  snapToReferenceStartWithinYears: edgeLeftSnapToleranceYears,
                },
              );

              return {
                text: edgeLabel?.primaryText ?? "",
                secondaryText: edgeLabel?.secondaryText,
              };
            }

            return {
              text: formatAxisLabel(edgeLeftYear, edgeLabelStep),
              secondaryText: undefined,
            };
          })(),
          align: "left" as const,
        },
        {
          x: sceneWidth - pad,
          ...(() => {
            if (useCalendarSubYearAxis) {
              return getCalendarEdgeAxisLabelText(
                edgeRightPreciseYear,
                edgeLabelStep,
              );
            }

            if (useElapsedSubYearAxis) {
              const edgeLabel = formatElapsedAxisLabel(
                edgeRightPreciseYear,
                edgeLabelStep,
              );

              return {
                text: edgeLabel?.primaryText ?? "",
                secondaryText: edgeLabel?.secondaryText,
              };
            }

            return {
              text: formatAxisLabel(edgeRightYear, edgeLabelStep),
              secondaryText: undefined,
            };
          })(),
          align: "right" as const,
        },
      ];
      const primaryOccupiedBounds: Array<{ left: number; right: number }> = [];

      for (const edgeLabel of primaryEdgeLabelEntries) {
        const labelWidth = edgeLabel.secondaryText
          ? measureAxisLabelWidth(
              context,
              edgeLabel.text,
              SUBYEAR_PRIMARY_FONT,
              edgeLabel.secondaryText,
              SUBYEAR_SECONDARY_FONT,
            )
          : (() => {
              context.font = useCalendarSubYearAxis
                ? SUBYEAR_PRIMARY_FONT
                : "13px var(--font-sans)";

              return context.measureText(edgeLabel.text).width;
            })();
        const left =
          edgeLabel.align === "left"
            ? edgeLabel.x - AXIS_LABEL_OCCUPIED_PADDING
            : edgeLabel.x - labelWidth - AXIS_LABEL_OCCUPIED_PADDING;
        const right =
          edgeLabel.align === "left"
            ? edgeLabel.x + labelWidth + AXIS_LABEL_OCCUPIED_PADDING
            : edgeLabel.x + AXIS_LABEL_OCCUPIED_PADDING;

        primaryOccupiedBounds.push({ left, right });
      }

      const resolvedAxisLabels = resolveAxisLabelCandidatesWithFallback(
        axisLabelCandidates.filter(
          (candidate) =>
            allowedLabelSteps.size === 0 ||
            allowedLabelSteps.has(candidate.step),
        ),
        primaryOccupiedBounds,
        {
          dedupeByTextOnly: useSubYearAxis,
          relaxedSpacing: useSubYearAxis,
          centerX: sceneWidth / 2,
        },
      );

      preferredAxisLabelStepRef.current =
        getPrimaryAxisLabelStepFromResolvedLabels(
          resolvedAxisLabels,
          primaryAllowedStep,
        );

      for (const label of resolvedAxisLabels.sort(
        (left, right) => left.x - right.x,
      )) {
        context.save();
        context.globalAlpha = label.alpha;

        if (useCalendarSubYearAxis) {
          context.font = SUBYEAR_PRIMARY_FONT;
          context.fillText(label.text, label.x, layout.dateLabelY);

          if (label.secondaryText) {
            context.font = SUBYEAR_SECONDARY_FONT;
            context.fillText(label.secondaryText, label.x, layout.yearLabelY);
          }
        } else if (useElapsedSubYearAxis) {
          if (label.secondaryText) {
            context.font = SUBYEAR_PRIMARY_FONT;
            context.fillText(label.text, label.x, layout.dateLabelY);
            context.font = SUBYEAR_SECONDARY_FONT;
            context.fillText(label.secondaryText, label.x, layout.yearLabelY);
          } else {
            context.font = SUBYEAR_PRIMARY_FONT;
            context.fillText(label.text, label.x, layout.yearLabelY);
          }
        } else {
          context.font = "13px var(--font-sans)";
          context.fillText(label.text, label.x, layout.yearLabelY);
        }

        context.restore();
      }

      if (useCalendarSubYearAxis && edgeLabelStep >= CALENDAR_DAY_STEP) {
        context.font = "11px var(--font-sans)";

        const firstVisibleYear = Math.ceil(edgeLeftYear);
        const lastVisibleYear = Math.floor(edgeRightYear);

        for (let year = firstVisibleYear; year <= lastVisibleYear; year += 1) {
          if (year === 0) {
            continue;
          }

          const x = toX(year);

          if (x < pad - 80 || x > sceneWidth - pad + 80) {
            continue;
          }

          const labelText = formatTimelineYear(year, 1);
          const labelWidth = context.measureText(labelText).width;
          const boundaryFade =
            Math.min(
              Math.max(0, (x - pad) / 60),
              Math.max(0, (sceneWidth - pad - x) / 60),
              1,
            ) *
            (Math.min(Math.abs(x - edgeLeftX), Math.abs(x - edgeRightX)) < 100
              ? Math.max(
                  0,
                  (Math.min(Math.abs(x - edgeLeftX), Math.abs(x - edgeRightX)) -
                    20) /
                    80,
                )
              : 1);

          if (boundaryFade <= 0.01) {
            continue;
          }

          yearBoundaryCandidates.push({
            x,
            text: labelText,
            width: labelWidth,
            alpha: 0.7 * boundaryFade,
            step: 1,
            pixelsPerStep: Math.abs(toX(year === -1 ? 1 : year + 1) - x),
          });
        }

        const yearEdgeLabelEntries = [
          {
            x: pad,
            text: formatTimelineYear(edgeLeftYear, 1),
            align: "left" as const,
          },
          {
            x: sceneWidth - pad,
            text: formatTimelineYear(edgeRightYear, 1),
            align: "right" as const,
          },
        ];
        const yearOccupiedBounds: Array<{ left: number; right: number }> = [];

        for (const edgeLabel of yearEdgeLabelEntries) {
          const labelWidth = context.measureText(edgeLabel.text).width;
          const left =
            edgeLabel.align === "left"
              ? edgeLabel.x - AXIS_LABEL_OCCUPIED_PADDING
              : edgeLabel.x - labelWidth - AXIS_LABEL_OCCUPIED_PADDING;
          const right =
            edgeLabel.align === "left"
              ? edgeLabel.x + labelWidth + AXIS_LABEL_OCCUPIED_PADDING
              : edgeLabel.x + AXIS_LABEL_OCCUPIED_PADDING;

          yearOccupiedBounds.push({ left, right });
        }

        const resolvedYearLabels = resolveAxisLabelCandidates(
          yearBoundaryCandidates,
          yearOccupiedBounds,
          { dedupeByTextOnly: true },
        );

        for (const label of resolvedYearLabels.sort(
          (left, right) => left.x - right.x,
        )) {
          context.save();
          context.globalAlpha = label.alpha;
          context.font = "11px var(--font-sans)";
          context.fillText(label.text, label.x, layout.yearLabelY);
          context.restore();
        }
      }

      markPerf("axisMs");

      const visibleMarkerPositions = getVisibleMarkerPositions(
        sceneVisibleMarkers,
        sceneWidth,
        pad,
        toX,
      );
      const measureMarkerText = (
        _marker: TimelineMarker,
        { fullLabel, shortLabel, dateLabel }: MarkerTextMeasureInput,
      ) => {
        context.font = "12px var(--font-sans)";
        const fullLabelWidth = context.measureText(fullLabel).width;
        const shortLabelWidth =
          shortLabel === fullLabel
            ? fullLabelWidth
            : context.measureText(shortLabel).width;
        context.font = "10px var(--font-sans)";

        return {
          fullLabelWidth,
          shortLabelWidth,
          dateLabelWidth: context.measureText(dateLabel).width,
        };
      };
      const baseMarkerRenderStates = resolveMarkerRenderStates(
        visibleMarkerPositions,
        sceneWidth,
        pad,
        measureMarkerText,
      );
      const activeMarkerBoosts = [...markerPriorityBoostRef.current.entries()]
        .filter(([, state]) => state.current > 0.001)
        .sort((left, right) => right[1].current - left[1].current);
      const resolvedMarkerStates = (() => {
        if (activeMarkerBoosts.length === 0) {
          return baseMarkerRenderStates;
        }

        const finalStatesById = new Map(
          baseMarkerRenderStates.map((state) => [
            state.marker.id,
            { ...state },
          ]),
        );

        for (const [boostedMarkerId, boostState] of activeMarkerBoosts) {
          const boostedStates = resolveMarkerRenderStates(
            visibleMarkerPositions,
            sceneWidth,
            pad,
            measureMarkerText,
            { highlightedMarkerId: boostedMarkerId },
          );

          for (const boostedState of boostedStates) {
            const currentState = finalStatesById.get(boostedState.marker.id);

            if (!currentState) {
              continue;
            }

            currentState.labelOpacity +=
              (boostedState.labelOpacity - currentState.labelOpacity) *
              boostState.current;
            currentState.stemProgress +=
              (boostedState.stemProgress - currentState.stemProgress) *
              boostState.current;
            currentState.intrinsicLabelOpacity +=
              (boostedState.intrinsicLabelOpacity -
                currentState.intrinsicLabelOpacity) *
              boostState.current;
            currentState.revealProgress +=
              (boostedState.revealProgress - currentState.revealProgress) *
              boostState.current;
            currentState.timingProgress +=
              (boostedState.timingProgress - currentState.timingProgress) *
              boostState.current;
            currentState.dotProgress +=
              (boostedState.dotProgress - currentState.dotProgress) *
              boostState.current;
          }
        }

        return baseMarkerRenderStates.map(
          (state) => finalStatesById.get(state.marker.id) ?? state,
        );
      })();
      for (const {
        marker,
        x,
        dotProgress,
        stemProgress,
      } of resolvedMarkerStates) {
        const markerDotColor = marker.color ?? line;
        const stemStartY = axisY + 2;
        const stemY =
          stemStartY + (layout.markerStemBottom - stemStartY) * stemProgress;

        context.save();
        context.strokeStyle = line;
        context.globalAlpha = 0.18 + stemProgress * 0.72;
        context.lineWidth = 1.5;

        if (stemProgress > 0.001) {
          context.beginPath();
          context.moveTo(x, stemStartY);
          context.lineTo(x, stemY);
          context.stroke();
        }

        const dotRadius = dotProgress > 0.01 ? 0.9 + 1.7 * dotProgress : 0;

        if (dotRadius > 0.001) {
          context.fillStyle = markerDotColor;
          context.globalAlpha = 1;
          context.beginPath();
          context.arc(x, axisY, dotRadius, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
      }

      for (const {
        x,
        label,
        dateLabel,
        labelOpacity,
      } of resolvedMarkerStates) {
        if (labelOpacity <= 0.01) {
          continue;
        }

        context.save();
        context.font = "12px var(--font-sans)";
        context.fillStyle = labelColor;
        context.globalAlpha = 0.78 * labelOpacity;
        context.textAlign = "center";
        context.textBaseline = "top";
        context.fillText(label, x, layout.markerLabelY);
        context.font = "10px var(--font-sans)";
        context.globalAlpha = 0.62 * labelOpacity;
        context.fillText(dateLabel, x, layout.markerDateY);
        context.restore();
      }

      for (const state of resolvedMarkerStates) {
        const markerHoverHalfWidth =
          state.labelOpacity > 0.01
            ? Math.max(14, Math.min(state.width * 0.22, 26))
            : 12;
        const markerHoverBottom =
          state.labelOpacity > 0.01 ? layout.markerDateY + 20 : axisY + 18;

        hoverRegions.push({
          id: state.marker.id,
          left: state.x - markerHoverHalfWidth,
          right: state.x + markerHoverHalfWidth,
          top: layout.majorTickTop - 10,
          bottom: markerHoverBottom,
          anchorX: state.x,
          anchorY: axisY - 14,
          anchorMode: "fixed",
          placement: "above",
          tooltip: getMarkerTooltipContent(state.marker),
        });
      }

      markPerf("markerMs");

      const rawNowX = toX(TIMELINE_MAX_YEAR);
      const nowX =
        edgeRightYear === TIMELINE_MAX_YEAR ? sceneWidth - pad : rawNowX;

      if (nowX >= pad - 20 && nowX <= sceneWidth - pad + 20) {
        context.save();
        context.strokeStyle = "rgba(180, 80, 40, 0.5)";
        context.lineWidth = 2;
        context.setLineDash([4, 4]);
        context.beginPath();
        context.moveTo(nowX, layout.nowTop);
        context.lineTo(nowX, axisY + 40);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = "rgba(180, 80, 40, 0.7)";
        context.font = "10px var(--font-sans)";
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.fillText("now", nowX, layout.nowTop - 4);
        context.restore();
      }

      for (const key of [...overlayLabelAnimationStates.keys()]) {
        if (!activeOverlayLabelKeys.has(key)) {
          overlayLabelAnimationStates.delete(key);
        }
      }

      overlayLabelAnimationInitializedRef.current = true;

      hoverRegionsRef.current = hoverRegions;
      overlayInteractionRegionsRef.current = overlayInteractionRegions;

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
        (hasActiveOverlayLabelAnimation ||
          hasActivePrimordialDetailStripAnimation) &&
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
