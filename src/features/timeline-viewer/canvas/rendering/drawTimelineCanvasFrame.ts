import type { MutableRefObject, RefObject } from "react";

import { compareEraPriorityAscending, type Era } from "@/lib/catalog/eras";
import type { AnimatedAxisTickState } from "@/lib/rendering/animation/axisTickState";
import type { MarkerPriorityBoostState } from "@/lib/rendering/animation/markerPriorityBoost";
import type { AnimatedOverlayBandState } from "@/lib/rendering/animation/overlayBand";
import {
  getMaxZoomForTimelineViewport,
  screenToWorldPrecise,
  worldToScreen,
} from "@/lib/core/viewport";
import type { AnimatedEraChildState } from "../animation/useEraChildAnimation";
import { resolveExpandedOverlayLayout } from "@/lib/rendering/expandedOverlayLayout";
import { drawBackground } from "@/lib/rendering/canvas/draw/drawBackground";
import { drawEras } from "@/lib/rendering/canvas/draw/drawEras";
import { drawOverlays } from "@/lib/rendering/canvas/draw/drawOverlays";
import { drawAxis } from "@/lib/rendering/canvas/draw/drawAxis";
import { drawMarkers } from "@/lib/rendering/canvas/draw/drawMarkers";
import type {
  CanvasDrawContext,
  HoverRegion,
  OverlayInteractionRegion,
} from "@/lib/rendering/canvas/draw/drawContext";
import {
  OVERLAY_LANE_GAP,
  OVERLAY_LANE_HEIGHT,
  TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
} from "@/lib/rendering/canvas/constants";
import {
  compareOverlayBands,
  getExpandedOverlayPanelHeight,
  getOverlayLaneY,
  getTimelineLayout,
  resolveExpandedOverlayDetails,
} from "@/lib/rendering/canvas/overlayLayout";
import {
  PRIMORDIAL_DETAIL_STRIP_FADE_DURATION_MS,
  PRIMORDIAL_SYNTHETIC_DETAIL_MAX_ZOOM_WINDOW,
  resolveEraScreenSpanMap,
  resolvePrimordialDetailStripSegments,
  type PrimordialDetailStripSegment,
} from "@/lib/rendering/canvas/primordial";
import type { TimelineCanvasTheme } from "@/lib/rendering/canvas/theme";
import {
  createTimelinePerfBreakdown,
  recordTimelinePerf,
  recordTimelineVerboseSample,
  type TimelinePerfBreakdown,
  type TimelinePerfMode,
  type TimelinePerfStats,
  type TimelineVerboseStats,
} from "@/lib/rendering/canvas/perf";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "@/lib/rendering/tooltipRetention";
import type { HoveredTooltipState } from "@/lib/rendering/canvas/tooltip";
import type { TimelineCanvasScene } from "../model/TimelineCanvas.types";
import {
  getInteractiveDescendantEras,
  getPreviewFocusChain,
  resolveTimelineEraLayersFromOpacityMap,
} from "@/lib/rendering/childLayers";

type LastPointerState = {
  x: number;
  y: number;
  pointerType: string;
};

type PrimordialDetailStripAnimationState = {
  opacity: number;
  target: number;
  lastTime: number;
  segments: PrimordialDetailStripSegment[];
};

export type TimelineCanvasFrameRefs = {
  axisTickAnimationRef: RefObject<Map<string, AnimatedAxisTickState>>;
  eraChildAnimationRef: RefObject<Map<string, AnimatedEraChildState>>;
  expandedOverlayProgressByIdRef: RefObject<Map<string, number>>;
  hoverRegionsRef: MutableRefObject<HoverRegion[]>;
  interactiveChildErasRef: MutableRefObject<Era[]>;
  markerPriorityBoostRef: RefObject<Map<string, MarkerPriorityBoostState>>;
  overlayBandAnimationRef: RefObject<Map<string, AnimatedOverlayBandState>>;
  overlayInteractionRegionsRef: MutableRefObject<OverlayInteractionRegion[]>;
  preferredAxisLabelStepRef: MutableRefObject<number | undefined>;
  primordialDetailStripAnimationRef: MutableRefObject<PrimordialDetailStripAnimationState>;
  renderedExpandedOverlayIdsRef: RefObject<string[]>;
};

export type DrawTimelineCanvasFrameArgs = {
  canvas: HTMLCanvasElement | null;
  commitHoveredTooltip: (tooltip: HoveredTooltipState | null) => void;
  frameRefs: TimelineCanvasFrameRefs;
  invalidateReasons: string[];
  isCosmicCalendarMode: boolean;
  isTouchTooltipPinned: boolean;
  isViewportInteractionActive: boolean;
  lastPointer: LastPointerState | null;
  overviewReservedHeight: number;
  overlayScrollOffset: number;
  pad: number;
  resolveHoveredTooltipForCanvasDraw: (
    x: number,
    y: number,
    pointerType: string,
  ) => HoveredTooltipState | null;
  reserveAxisDateRow: boolean;
  scene: TimelineCanvasScene | null;
  shellElement: HTMLDivElement | null;
  theme: TimelineCanvasTheme;
  tooltipInteractiveContentElement: HTMLDivElement | null;
  hoveredTooltipRef: MutableRefObject<HoveredTooltipState | null>;
  perfMode: TimelinePerfMode;
  perfStats: TimelinePerfStats;
  verbosePerfStats: TimelineVerboseStats;
};

export function drawTimelineCanvasFrame({
  canvas,
  commitHoveredTooltip,
  frameRefs,
  invalidateReasons,
  isCosmicCalendarMode,
  isTouchTooltipPinned,
  isViewportInteractionActive,
  lastPointer,
  overviewReservedHeight,
  overlayScrollOffset,
  pad,
  resolveHoveredTooltipForCanvasDraw,
  reserveAxisDateRow,
  scene,
  shellElement,
  theme,
  tooltipInteractiveContentElement,
  hoveredTooltipRef,
  perfMode,
  perfStats,
  verbosePerfStats,
}: DrawTimelineCanvasFrameArgs) {
  if (!scene || !canvas || scene.width <= 0 || scene.height <= 0) {
    return { hasActiveFrameAnimation: false };
  }

  const context = canvas.getContext("2d");

  if (!context) {
    return { hasActiveFrameAnimation: false };
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

  for (const [eraId, state] of frameRefs.eraChildAnimationRef.current) {
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
  frameRefs.interactiveChildErasRef.current =
    getInteractiveDescendantEras(resolvedEraLayers);
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
    frameRefs.renderedExpandedOverlayIdsRef.current.filter(
      (expandedOverlayId, index, allIds) =>
        allIds.indexOf(expandedOverlayId) === index &&
        sceneResolvedOverlayBands.some(
          ({ band }) =>
            band.id === expandedOverlayId && (band.children?.length ?? 0) > 0,
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
        frameRefs.expandedOverlayProgressByIdRef.current.get(
          detail.parent.band.id,
        ) ?? 0;

      return {
        detail,
        fullHeight,
        progress,
        animatedHeight: fullHeight * progress,
      };
    },
  );
  const expandedOverlayLayoutExtraHeight = expandedOverlayExpansionStates.reduce(
    (total, state) => total + state.fullHeight,
    0,
  );
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
        axisTickCount: frameRefs.axisTickAnimationRef.current.size,
      }
    : null;
  let perfPhaseStart = drawStart;
  const markPerf = (key: Exclude<keyof TimelinePerfBreakdown, "totalMs">) => {
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
  const animatedOverlayBands = [
    ...frameRefs.overlayBandAnimationRef.current.values(),
  ]
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
    {
      reserveAxisDateRow,
      overviewReservedHeight,
      expandedExtraHeight: expandedOverlayLayoutExtraHeight,
    },
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
    expandedOverlayExpansionStates.map(({ detail, fullHeight, progress }) => ({
      parentId: detail.parent.band.id,
      panelHeight: fullHeight,
      expansionProgress: progress,
    })),
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
  const resolvedAxisTickStates = [
    ...frameRefs.axisTickAnimationRef.current.values(),
  ]
    .filter((tick) => tick.visibleProgress > 0.01 || tick.labelOpacity > 0.01)
    .sort((left, right) => left.step - right.step || left.year - right.year);
  const sceneMaxZoom = getMaxZoomForTimelineViewport(sceneViewport, innerWidth);
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
  const primordialDetailStripSegments = resolvePrimordialDetailStripSegments(
    visibleEraLayers,
    eraScreenSpanById,
    sceneViewport,
    sceneWidth,
    pad,
  );
  const primordialDetailStripAnimation =
    frameRefs.primordialDetailStripAnimationRef.current;
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
  const primordialDetailStripOpacity = primordialDetailStripAnimation.opacity;

  const toX = (year: number) =>
    pad + worldToScreen(year, sceneViewport, innerWidth);
  const fromX = (px: number) =>
    screenToWorldPrecise(px - pad, sceneViewport, innerWidth);

  const background = context.createLinearGradient(0, 0, 0, sceneHeight);
  background.addColorStop(0, theme.paper);
  background.addColorStop(1, theme.paperDeep);
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
    paper: theme.paper,
    line: theme.line,
    lineSoft: theme.lineSoft,
    labelColor: theme.labelColor,
    fontSans: theme.fontSans,
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
    markerPriorityBoostRef: frameRefs.markerPriorityBoostRef,
    expandedOverlayProgressByIdRef: frameRefs.expandedOverlayProgressByIdRef,
    hoverRegions: [],
    overlayInteractionRegions: [],
    overlayOcclusionRects: [],
    frameFlags: {
      hasActivePrimordialDetailStripAnimation,
    },
    toX,
    fromX,
    markPerf,
    isViewportInteractionActive,
    preferredAxisLabelStepRef: frameRefs.preferredAxisLabelStepRef,
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

  frameRefs.hoverRegionsRef.current = cx.hoverRegions;
  frameRefs.overlayInteractionRegionsRef.current = cx.overlayInteractionRegions;

  if (lastPointer && !isTouchTooltipPinned) {
    const currentTooltip = hoveredTooltipRef.current;
    const stickyRect =
      tooltipInteractiveContentElement?.getBoundingClientRect() ?? null;

    if (
      currentTooltip &&
      shellElement &&
      shouldPrioritizeTooltipRetention(currentTooltip) &&
      shouldRetainTooltipAtPoint(
        lastPointer.x,
        lastPointer.y,
        shellElement.getBoundingClientRect(),
        stickyRect,
        currentTooltip,
        TOOLTIP_BRIDGE_BASE_HALF_WIDTH,
      )
    ) {
      commitHoveredTooltip(currentTooltip);
    } else {
      const resolvedTooltip = resolveHoveredTooltipForCanvasDraw(
        lastPointer.x,
        lastPointer.y,
        lastPointer.pointerType,
      );

      if (resolvedTooltip) {
        commitHoveredTooltip(resolvedTooltip);
      } else if (
        hoveredTooltipRef.current &&
        shellElement &&
        shouldRetainTooltipAtPoint(
          lastPointer.x,
          lastPointer.y,
          shellElement.getBoundingClientRect(),
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
  } else if (!lastPointer && !isTouchTooltipPinned) {
    commitHoveredTooltip(null);
  }

  if (perfSample) {
    markPerf("interactionMs");
    const perfNow = performance.now();
    perfSample.totalMs = perfNow - drawStart;
    recordTimelinePerf(perfStats, perfSample, perfNow);

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
        verbosePerfStats,
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

  return {
    hasActiveFrameAnimation:
      cx.frameFlags.hasActivePrimordialDetailStripAnimation,
  };
}
