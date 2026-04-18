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
  formatTimelineDateLabel,
  formatTimelineElapsedAxisLabel,
  formatTimelineElapsedAxisLabelLines,
  getDominantTimelineDateReference,
  formatTimelineYear,
} from "../../lib/time/bands";
import {
  type Era,
  type TimelineMarker,
  type TimelineOverlayBand,
} from "../../lib/data/eras";
import {
  getEraTooltipContent,
  getMarkerTooltipContent,
  getOverlayTooltipContent,
  type TimelineTooltipContent,
} from "../../lib/data/timelineTooltip";
import {
  EARLY_UNIVERSE_END_YEAR,
  EARLY_UNIVERSE_ID,
  EARLY_UNIVERSE_START_YEAR,
} from "../../lib/data/eraTrees/cosmic";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getViewportCenterYear,
  getZoomAnchorForCanvasX,
  getVisibleRange,
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
} from "../../lib/time/viewport";
import {
  getEraChildOpacityTarget,
  getInteractiveDescendantEras,
  getPreviewFocusChain,
  resolveTimelineEraLayersFromOpacityMap,
} from "../../lib/time/childLayers";
import {
  getVisibleTimelineMarkers,
  resolveTimelineOverlayTracks,
  type ResolvedTimelineOverlayBand,
} from "../../lib/time/overlayTracks";
import {
  getExpandedOverlayPanelBounds,
  resolveExpandedOverlayLayout,
} from "../../lib/time/expandedOverlayLayout";
import {
  resolveOverlayLabelHoverBounds,
  resolveTextHoverBounds,
} from "./overlayLabelHover";
import {
  shouldPrioritizeTooltipRetention,
  shouldRetainTooltipAtPoint,
} from "./tooltipRetention";
import {
  getVisibleMarkerPositions,
  type MarkerTextMeasureInput,
  resolveMarkerRenderStates,
} from "../../lib/time/markerGlyphs";
import {
  resolveAxisTickRenderStates,
  type AxisTickRenderState,
} from "../../lib/time/axisTickStates";
import {
  syncAnimatedEraChildState,
  type AnimatedEraChildState,
} from "./eraChildAnimation";
import {
  isAnimatedContextBandLabelStateActive,
  resolveAnimatedContextBandLabelLayers,
  resolveContextBandLabelVariant,
  resolveContextBandRenderState,
  resolveOverlayLabelPaint,
  stepAnimatedContextBandLabelState,
  syncAnimatedContextBandLabelState,
  type AnimatedContextBandLabelState,
} from "./bandRendering";
import { OverlayGroupIconSvg } from "./OverlayGroupIconSvg";
import {
  drawOverlayGroupIcon,
  resolveOverlayGroupIconLayout,
} from "./overlayGroupIcons";

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
  overlayVisibilityTransitionKey: number;
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
  lastX: number;
  startX: number;
  startY: number;
  moved: boolean;
};

type TimelineCanvasLayout = {
  breadcrumbY: number;
  overlayTop: number;
  overlayHeight: number;
  overlayBottom: number;
  axisY: number;
  markerStemBottom: number;
  markerLabelY: number;
  markerDateY: number;
  majorTickTop: number;
  dateLabelY: number;
  yearLabelY: number;
  nowTop: number;
};

type AxisLabelCandidate = {
  x: number;
  text: string;
  secondaryText?: string;
  width: number;
  alpha: number;
  step: number;
  pixelsPerStep: number;
};

type AnimatedAxisTickState = AxisTickRenderState & {
  key: string;
  targetVisibleProgress: number;
  targetMajorProgress: number;
  targetLabelOpacity: number;
  targetGenerationAlpha: number;
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

type HoveredTooltipState = {
  id: string;
  anchorX: number;
  anchorY: number;
  placement: "above" | "below";
  tooltip: TimelineTooltipContent;
};

type RenderedTooltipState = {
  tooltipState: HoveredTooltipState;
  phase: "entering" | "present" | "exiting";
};

type MarkerPriorityBoostState = {
  current: number;
  target: number;
};

type ExpandedOverlayChild = {
  band: TimelineOverlayBand;
  laneIndex: number;
  x0: number;
  x1: number;
};

type ExpandedOverlayDetail = {
  parent: ResolvedTimelineOverlayBand;
  children: ExpandedOverlayChild[];
  laneCount: number;
  panelWidth: number;
  headerText: string;
};

type NestedOverlayLaneAssignment = {
  assigned: Array<{
    band: TimelineOverlayBand;
    laneIndex: number;
  }>;
  laneCount: number;
};

type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type TimelineCanvasTheme = {
  paper: string;
  paperDeep: string;
  line: string;
  lineSoft: string;
  labelColor: string;
};

type TimelinePerfBreakdown = {
  setupMs: number;
  eraMs: number;
  overlayMs: number;
  axisMs: number;
  markerMs: number;
  interactionMs: number;
  totalMs: number;
};

type TimelinePerfSample = TimelinePerfBreakdown & {
  visibleEraCount: number;
  visibleOverlayCount: number;
  visibleMarkerCount: number;
  axisTickCount: number;
};

type TimelinePerfStats = {
  frameCount: number;
  slowFrameCount: number;
  lastLogTime: number;
  lastSlowLogTime: number;
  maxTotalMs: number;
  totals: TimelinePerfBreakdown;
};

type TimelinePerfMode = "off" | "basic" | "verbose";

type TimelineVerboseMarkerSnapshot = {
  labelVisible: boolean;
  label: string;
  opacityBucket: number;
};

type TimelineVerboseMarkerFrameState = TimelineVerboseMarkerSnapshot & {
  id: string;
};

type TimelineVerboseSample = {
  invalidateReasons: string[];
  interactionActive: boolean;
  visibleLabelCount: number;
  markerStates: TimelineVerboseMarkerFrameState[];
};

type TimelineVerboseStats = {
  lastLogTime: number;
  drawCount: number;
  scenePublishCount: number;
  scenePublishReasonCounts: Record<string, number>;
  invalidationCounts: Record<string, number>;
  coalescedInvalidationCounts: Record<string, number>;
  drawReasonCounts: Record<string, number>;
  interactionCounts: Record<string, number>;
  activeInteractionFrameCount: number;
  settledInteractionFrameCount: number;
  visibleLabelTotal: number;
  maxVisibleLabelCount: number;
  markerVisibilityFlipCount: number;
  markerTextChangeCount: number;
  markerOpacityBucketChangeCount: number;
  markerChangedCountTotal: number;
  markerFlipCounts: Record<string, number>;
  recentMarkerChanges: Array<{
    id: string;
    label: string;
    kind: string;
    from: string | number | boolean;
    to: string | number | boolean;
  }>;
  lastMarkerSnapshot: Map<string, TimelineVerboseMarkerSnapshot>;
  lastInteractionActive: boolean | null;
  interactionStateTransitionCount: number;
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

type ExpandedOverlayConnectorGeometry = {
  stemX: number;
  stemTop: number;
  stemBottom: number;
  railLeft: number;
  railRight: number;
  railY: number;
};

type AnimatedOverlayBandState = {
  overlay: ResolvedTimelineOverlayBand;
  currentOpacity: number;
  targetOpacity: number;
  currentY: number;
  targetY: number;
};

export const TIMELINE_CANVAS_PAD = 120;
const PAD = TIMELINE_CANVAS_PAD;
const OVERLAY_LANE_HEIGHT = 16;
const OVERLAY_LANE_GAP = 8;
const OVERLAY_PANEL_GAP = 56;
// Keep breathing room beneath the parent, but avoid bottom padding so child rows
// can still snap to the same vertical rhythm as neighboring overlay lanes.
const EXPANDED_OVERLAY_TOP_PADDING = OVERLAY_LANE_GAP;
const EXPANDED_OVERLAY_BOTTOM_PADDING = 0;
const CALENDAR_DAY_STEP = 1 / 365.2425;
const AXIS_LABEL_OCCUPIED_PADDING = 28;
const AXIS_LABEL_CLEARANCE_FADE_START = -14;
const AXIS_LABEL_CLEARANCE_FADE_END = 40;
const AXIS_DUPLICATE_LABEL_MIN_GAP = 18;
const AXIS_TICK_ANIMATION_SMOOTHING_MS = 120;
const AXIS_TICK_LABEL_FADE_IN_SMOOTHING_MS = 90;
const AXIS_TICK_LABEL_FADE_OUT_SMOOTHING_MS = 185;
const AXIS_TICK_OVERSCAN_PX = 160;
const AXIS_LABEL_HYSTERESIS_KEEP_RATIO = 0.86;
const AXIS_SUBYEAR_SECONDARY_STEP_RATIO = 0.7;
const ERA_CHILD_TRANSITION_DURATION_MS = 220;
const MARKER_PRIORITY_BOOST_SMOOTHING_MS = 130;
const EXPANDED_OVERLAY_ANIMATION_SMOOTHING_MS = 170;
const CONTEXT_BAND_LABEL_TRANSITION_DURATION_MS = 160;
const OVERLAY_BAND_FADE_IN_SMOOTHING_MS = 150;
const OVERLAY_BAND_FADE_OUT_SMOOTHING_MS = 108;
const OVERLAY_BAND_POSITION_SMOOTHING_MS = 170;
const OVERLAY_BAND_ENTER_SLIDE_PX = 8;
const OVERLAY_BAND_EXIT_SLIDE_PX = 10;
const OVERLAY_BAND_REFLOW_START_OPACITY = 0.08;
const MIN_EXPANDED_OVERLAY_PARENT_WIDTH = 220;
const EXPANDED_OVERLAY_CHROME_STEM_REVEAL_END = 0.18;
const EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_START = 0.1;
const EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_END = 0.32;
const EXPANDED_OVERLAY_CHILD_REVEAL_START = 0.16;
const EXPANDED_OVERLAY_CHILD_LANE_STAGGER = 0.1;
const EXPANDED_OVERLAY_CHILD_REVEAL_DURATION = 0.52;
const EXPANDED_OVERLAY_CHILD_SLIDE_PX = 8;
const EXPANDED_OVERLAY_LABEL_REVEAL_DELAY = 0.18;
const EXPANDED_OVERLAY_LABEL_REVEAL_DURATION = 0.28;
const EXPANDED_OVERLAY_INTERACTION_REVEAL_THRESHOLD = 0.35;
const AXIS_LABEL_SECONDARY_STEP_RATIO = 0.82;
const SUBYEAR_EDGE_LABEL_MIN_SPACING_PX = 72;
const SUBYEAR_LABEL_MIN_CLEARANCE_PX = 12;
const SUBYEAR_PRIMARY_FONT = "11px var(--font-sans)";
const SUBYEAR_SECONDARY_FONT = "10px var(--font-sans)";
const ERA_BAND_ALPHA = 0.3;
const OVERLAY_BAND_ALPHA = 1;
const OVERLAY_BAND_SIDE_PADDING = 5;
const OVERLAY_BAND_DISCLOSURE_RESERVED_WIDTH = 18;
const OVERLAY_GROUP_ICON_PARENT_ALPHA = 0.44;
const OVERLAY_GROUP_ICON_CHILD_ALPHA = 0.4;
const EXPANDED_OVERLAY_CONNECTOR_ALPHA = 1;
const EXPANDED_OVERLAY_CONNECTOR_LINE_WIDTH = 1;
const EXPANDED_OVERLAY_CHILD_BORDER_ALPHA = 1;
const PARENT_ERA_TINT_ALPHA = 0.05;
const MIN_VISIBLE_OVERLAY_CHILD_WIDTH = 1;
const TOOLTIP_OFFSET = 3;

const canExpandOverlayParent = (bandWidth: number, childCount: number) =>
  childCount > 0 && bandWidth >= MIN_EXPANDED_OVERLAY_PARENT_WIDTH;

const isOverlayBandStateAnimating = (state: AnimatedOverlayBandState) =>
  Math.abs(state.targetOpacity - state.currentOpacity) > 0.002 ||
  Math.abs(state.targetY - state.currentY) > 0.2;
const TOOLTIP_MAX_WIDTH = 280;
const TOOLTIP_BRIDGE_BASE_HALF_WIDTH = 16;
const TOOLTIP_EXIT_DURATION_MS = 170;
const CLICK_DRAG_THRESHOLD = 6;
const PERF_LOG_INTERVAL_MS = 2000;
const PERF_SLOW_FRAME_MS = 14;
const PERF_SLOW_LOG_INTERVAL_MS = 500;
const VIEWPORT_INTERACTION_SETTLE_MS = 120;
const DEFAULT_TIMELINE_THEME: TimelineCanvasTheme = {
  paper: "#f7f0e2",
  paperDeep: "#efe5d4",
  line: "rgba(74, 57, 43, 0.9)",
  lineSoft: "rgba(74, 57, 43, 0.24)",
  labelColor: "rgba(53, 39, 29, 0.92)",
};

function createTimelinePerfBreakdown(): TimelinePerfBreakdown {
  return {
    setupMs: 0,
    eraMs: 0,
    overlayMs: 0,
    axisMs: 0,
    markerMs: 0,
    interactionMs: 0,
    totalMs: 0,
  };
}

function createTimelinePerfStats(): TimelinePerfStats {
  return {
    frameCount: 0,
    slowFrameCount: 0,
    lastLogTime: 0,
    lastSlowLogTime: 0,
    maxTotalMs: 0,
    totals: createTimelinePerfBreakdown(),
  };
}

function createTimelineVerboseStats(): TimelineVerboseStats {
  return {
    lastLogTime: 0,
    drawCount: 0,
    scenePublishCount: 0,
    scenePublishReasonCounts: {},
    invalidationCounts: {},
    coalescedInvalidationCounts: {},
    drawReasonCounts: {},
    interactionCounts: {},
    activeInteractionFrameCount: 0,
    settledInteractionFrameCount: 0,
    visibleLabelTotal: 0,
    maxVisibleLabelCount: 0,
    markerVisibilityFlipCount: 0,
    markerTextChangeCount: 0,
    markerOpacityBucketChangeCount: 0,
    markerChangedCountTotal: 0,
    markerFlipCounts: {},
    recentMarkerChanges: [],
    lastMarkerSnapshot: new Map(),
    lastInteractionActive: null,
    interactionStateTransitionCount: 0,
  };
}

function incrementCounter(
  counts: Record<string, number>,
  key: string,
  amount = 1,
) {
  counts[key] = (counts[key] ?? 0) + amount;
}

function summarizeCounters(counts: Record<string, number>, limit = 8) {
  return Object.fromEntries(
    Object.entries(counts)
      .sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )
      .slice(0, limit),
  );
}

function roundMetric(value: number) {
  return Number(value.toFixed(2));
}

function areStringArraysEqual(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length && left.every((value, index) => value === right[index])
  );
}

function pushRecentMarkerChange(
  stats: TimelineVerboseStats,
  change: TimelineVerboseStats["recentMarkerChanges"][number],
) {
  stats.recentMarkerChanges.push(change);

  if (stats.recentMarkerChanges.length > 12) {
    stats.recentMarkerChanges.shift();
  }
}

function readTimelineCanvasTheme(): TimelineCanvasTheme {
  if (typeof window === "undefined") {
    return DEFAULT_TIMELINE_THEME;
  }

  const styles = getComputedStyle(document.documentElement);

  return {
    paper:
      styles.getPropertyValue("--timeline-surface").trim() ||
      DEFAULT_TIMELINE_THEME.paper,
    paperDeep:
      styles.getPropertyValue("--timeline-surface-deep").trim() ||
      DEFAULT_TIMELINE_THEME.paperDeep,
    line:
      styles.getPropertyValue("--timeline-line").trim() ||
      DEFAULT_TIMELINE_THEME.line,
    lineSoft:
      styles.getPropertyValue("--timeline-line-soft").trim() ||
      DEFAULT_TIMELINE_THEME.lineSoft,
    labelColor:
      styles.getPropertyValue("--timeline-label").trim() ||
      DEFAULT_TIMELINE_THEME.labelColor,
  };
}

function getTimelinePerfMode(): TimelinePerfMode {
  if (typeof window === "undefined") {
    return "off";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const mode =
    searchParams.get("timelinePerf") ??
    window.localStorage.getItem("timelinePerf");

  if (mode === "2" || mode === "verbose") {
    return "verbose";
  }

  if (mode === "1") {
    return "basic";
  }

  return "off";
}

function recordTimelinePerf(
  stats: TimelinePerfStats,
  sample: TimelinePerfSample,
  now: number,
) {
  stats.frameCount += 1;
  stats.maxTotalMs = Math.max(stats.maxTotalMs, sample.totalMs);
  stats.totals.setupMs += sample.setupMs;
  stats.totals.eraMs += sample.eraMs;
  stats.totals.overlayMs += sample.overlayMs;
  stats.totals.axisMs += sample.axisMs;
  stats.totals.markerMs += sample.markerMs;
  stats.totals.interactionMs += sample.interactionMs;
  stats.totals.totalMs += sample.totalMs;

  if (sample.totalMs >= PERF_SLOW_FRAME_MS) {
    stats.slowFrameCount += 1;

    if (now - stats.lastSlowLogTime >= PERF_SLOW_LOG_INTERVAL_MS) {
      stats.lastSlowLogTime = now;
      console.info("[timeline perf] slow frame", {
        totalMs: Number(sample.totalMs.toFixed(2)),
        setupMs: Number(sample.setupMs.toFixed(2)),
        eraMs: Number(sample.eraMs.toFixed(2)),
        overlayMs: Number(sample.overlayMs.toFixed(2)),
        axisMs: Number(sample.axisMs.toFixed(2)),
        markerMs: Number(sample.markerMs.toFixed(2)),
        interactionMs: Number(sample.interactionMs.toFixed(2)),
        visibleEraCount: sample.visibleEraCount,
        visibleOverlayCount: sample.visibleOverlayCount,
        visibleMarkerCount: sample.visibleMarkerCount,
        axisTickCount: sample.axisTickCount,
      });
    }
  }

  if (stats.lastLogTime === 0) {
    stats.lastLogTime = now;
  }

  if (now - stats.lastLogTime < PERF_LOG_INTERVAL_MS) {
    return;
  }

  const frameCount = Math.max(stats.frameCount, 1);
  console.info("[timeline perf] summary", {
    frames: stats.frameCount,
    slowFrames: stats.slowFrameCount,
    avgTotalMs: Number((stats.totals.totalMs / frameCount).toFixed(2)),
    avgSetupMs: Number((stats.totals.setupMs / frameCount).toFixed(2)),
    avgEraMs: Number((stats.totals.eraMs / frameCount).toFixed(2)),
    avgOverlayMs: Number((stats.totals.overlayMs / frameCount).toFixed(2)),
    avgAxisMs: Number((stats.totals.axisMs / frameCount).toFixed(2)),
    avgMarkerMs: Number((stats.totals.markerMs / frameCount).toFixed(2)),
    avgInteractionMs: Number(
      (stats.totals.interactionMs / frameCount).toFixed(2),
    ),
    maxTotalMs: Number(stats.maxTotalMs.toFixed(2)),
  });

  stats.frameCount = 0;
  stats.slowFrameCount = 0;
  stats.lastLogTime = now;
  stats.maxTotalMs = 0;
  stats.totals = createTimelinePerfBreakdown();
}

function recordTimelineVerboseSample(
  stats: TimelineVerboseStats,
  sample: TimelineVerboseSample,
  now: number,
) {
  stats.drawCount += 1;

  for (const reason of sample.invalidateReasons) {
    incrementCounter(stats.drawReasonCounts, reason);
  }

  if (sample.interactionActive) {
    stats.activeInteractionFrameCount += 1;
  } else {
    stats.settledInteractionFrameCount += 1;
  }

  stats.visibleLabelTotal += sample.visibleLabelCount;
  stats.maxVisibleLabelCount = Math.max(
    stats.maxVisibleLabelCount,
    sample.visibleLabelCount,
  );

  if (
    stats.lastInteractionActive !== null &&
    stats.lastInteractionActive !== sample.interactionActive
  ) {
    stats.interactionStateTransitionCount += 1;
    console.info("[timeline perf] interaction state", {
      active: sample.interactionActive,
      invalidateReasons: sample.invalidateReasons,
      visibleLabelCount: sample.visibleLabelCount,
    });
  }

  stats.lastInteractionActive = sample.interactionActive;

  const nextSnapshot = new Map<string, TimelineVerboseMarkerSnapshot>();
  let changedMarkerCount = 0;

  for (const state of sample.markerStates) {
    nextSnapshot.set(state.id, {
      labelVisible: state.labelVisible,
      label: state.label,
      opacityBucket: state.opacityBucket,
    });

    const previous = stats.lastMarkerSnapshot.get(state.id);
    let changed = false;

    if (previous) {
      if (previous.labelVisible !== state.labelVisible) {
        stats.markerVisibilityFlipCount += 1;
        incrementCounter(stats.markerFlipCounts, state.id);
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "visibility",
          from: previous.labelVisible,
          to: state.labelVisible,
        });
        changed = true;
      }

      if (
        previous.label !== state.label &&
        (previous.labelVisible || state.labelVisible)
      ) {
        stats.markerTextChangeCount += 1;
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "label",
          from: previous.label,
          to: state.label,
        });
        changed = true;
      }

      if (
        previous.opacityBucket !== state.opacityBucket &&
        (previous.labelVisible || state.labelVisible)
      ) {
        stats.markerOpacityBucketChangeCount += 1;
        pushRecentMarkerChange(stats, {
          id: state.id,
          label: state.label,
          kind: "opacity-bucket",
          from: previous.opacityBucket,
          to: state.opacityBucket,
        });
        changed = true;
      }
    }

    if (changed) {
      changedMarkerCount += 1;
    }
  }

  stats.markerChangedCountTotal += changedMarkerCount;
  stats.lastMarkerSnapshot = nextSnapshot;

  if (stats.lastLogTime === 0) {
    stats.lastLogTime = now;
  }

  if (now - stats.lastLogTime < PERF_LOG_INTERVAL_MS) {
    return;
  }

  const drawCount = Math.max(stats.drawCount, 1);
  console.info("[timeline perf] diagnostics", {
    draws: stats.drawCount,
    scenePublishes: stats.scenePublishCount,
    interactionStateTransitions: stats.interactionStateTransitionCount,
    interactionFrames: {
      active: stats.activeInteractionFrameCount,
      settled: stats.settledInteractionFrameCount,
    },
    labels: {
      avgVisible: roundMetric(stats.visibleLabelTotal / drawCount),
      maxVisible: stats.maxVisibleLabelCount,
      visibilityFlips: stats.markerVisibilityFlipCount,
      textChanges: stats.markerTextChangeCount,
      opacityBucketChanges: stats.markerOpacityBucketChangeCount,
      avgChangedMarkersPerDraw: roundMetric(
        stats.markerChangedCountTotal / drawCount,
      ),
      topFlappingMarkers: summarizeCounters(stats.markerFlipCounts, 8),
      recentChanges: stats.recentMarkerChanges,
    },
    invalidateCalls: summarizeCounters(stats.invalidationCounts, 12),
    coalescedInvalidations: summarizeCounters(
      stats.coalescedInvalidationCounts,
      12,
    ),
    drawReasons: summarizeCounters(stats.drawReasonCounts, 12),
    scenePublishReasons: summarizeCounters(stats.scenePublishReasonCounts, 12),
    interactionEvents: summarizeCounters(stats.interactionCounts, 12),
  });

  const lastMarkerSnapshot = stats.lastMarkerSnapshot;
  const lastInteractionActive = stats.lastInteractionActive;
  Object.assign(stats, createTimelineVerboseStats(), {
    lastLogTime: now,
    lastMarkerSnapshot,
    lastInteractionActive,
  });
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function interpolateProgress(progress: number, start: number, end: number) {
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  return smoothstep01((progress - start) / (end - start));
}

function getExpandedOverlayChromeStemRevealProgress(progress: number) {
  return interpolateProgress(
    progress,
    0,
    EXPANDED_OVERLAY_CHROME_STEM_REVEAL_END,
  );
}

function getExpandedOverlayChromeRailRevealProgress(progress: number) {
  return interpolateProgress(
    progress,
    EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_START,
    EXPANDED_OVERLAY_CHROME_RAIL_REVEAL_END,
  );
}

function getExpandedOverlayChildRevealProgress(
  progress: number,
  laneIndex: number,
) {
  const start =
    EXPANDED_OVERLAY_CHILD_REVEAL_START +
    laneIndex * EXPANDED_OVERLAY_CHILD_LANE_STAGGER;

  return interpolateProgress(
    progress,
    start,
    start + EXPANDED_OVERLAY_CHILD_REVEAL_DURATION,
  );
}

function getExpandedOverlayLabelRevealProgress(
  progress: number,
  laneIndex: number,
) {
  const start =
    EXPANDED_OVERLAY_CHILD_REVEAL_START +
    laneIndex * EXPANDED_OVERLAY_CHILD_LANE_STAGGER +
    EXPANDED_OVERLAY_LABEL_REVEAL_DELAY;

  return interpolateProgress(
    progress,
    start,
    start + EXPANDED_OVERLAY_LABEL_REVEAL_DURATION,
  );
}

function resolveAxisTickYear(
  tick: Pick<AxisTickRenderState, "year" | "wholeYear" | "yearFraction">,
) {
  if (tick.wholeYear !== undefined && tick.yearFraction !== undefined) {
    return {
      wholeYear: tick.wholeYear,
      fraction: tick.yearFraction,
    } satisfies PreciseTimelineYear;
  }

  return tick.year;
}

function makeAxisTickKey(
  tick: Pick<
    AxisTickRenderState,
    "step" | "year" | "wholeYear" | "yearFraction"
  >,
) {
  const yearKey =
    tick.wholeYear !== undefined && tick.yearFraction !== undefined
      ? `${tick.wholeYear}:${tick.yearFraction.toPrecision(15)}`
      : tick.year.toPrecision(15);

  return `${tick.step.toPrecision(15)}:${yearKey}`;
}

function getCalendarAxisLabelText(
  year: number | PreciseTimelineYear,
  step: number,
) {
  if (step < CALENDAR_DAY_STEP) {
    return {
      text: formatTimelineDateLabel(year, step),
      secondaryText: formatTimelineDateLabel(year, CALENDAR_DAY_STEP),
    };
  }

  return {
    text: formatTimelineDateLabel(year, step),
    secondaryText: undefined,
  };
}

const TICK_SCALE_LOG_MIN = Math.log(3);
const TICK_SCALE_LOG_RANGE = Math.log(8_000) - TICK_SCALE_LOG_MIN;

function getTickScaleProgress(pixelsPerStep: number) {
  if (pixelsPerStep <= 3) return 0;

  return Math.min(
    1,
    Math.max(
      0,
      (Math.log(pixelsPerStep) - TICK_SCALE_LOG_MIN) / TICK_SCALE_LOG_RANGE,
    ),
  );
}

function getPreferredAxisEdgeLabelStep(ticks: AxisTickRenderState[]) {
  const stepMetrics = new Map<
    number,
    { score: number; minPixelsPerStep: number }
  >();

  for (const tick of ticks) {
    if (tick.labelOpacity <= 0.01) {
      continue;
    }

    const existing = stepMetrics.get(tick.labelStep);

    stepMetrics.set(tick.labelStep, {
      score: (existing?.score ?? 0) + tick.labelOpacity,
      minPixelsPerStep: Math.min(
        existing?.minPixelsPerStep ?? Number.POSITIVE_INFINITY,
        tick.pixelsPerStep,
      ),
    });
  }

  const entries = [...stepMetrics.entries()];

  if (entries.length === 0) {
    return undefined;
  }

  const finestReadableSubYearStep = entries
    .filter(
      ([step, metrics]) =>
        step < 1 &&
        metrics.minPixelsPerStep >= SUBYEAR_EDGE_LABEL_MIN_SPACING_PX,
    )
    .sort(
      (left, right) => left[0] - right[0] || right[1].score - left[1].score,
    )[0]?.[0];

  if (finestReadableSubYearStep !== undefined) {
    return finestReadableSubYearStep;
  }

  return entries.sort(
    (left, right) => right[1].score - left[1].score || right[0] - left[0],
  )[0]?.[0];
}

function getAllowedAxisLabelSteps(
  candidates: AxisLabelCandidate[],
  useSubYearAxis: boolean,
  options: { preferredStep?: number } = {},
) {
  const stepMetrics = new Map<
    number,
    { score: number; maxWidth: number; minPixelsPerStep: number }
  >();

  for (const candidate of candidates) {
    const existing = stepMetrics.get(candidate.step);

    stepMetrics.set(candidate.step, {
      score: (existing?.score ?? 0) + candidate.alpha,
      maxWidth: Math.max(existing?.maxWidth ?? 0, candidate.width),
      minPixelsPerStep: Math.min(
        existing?.minPixelsPerStep ?? Number.POSITIVE_INFINITY,
        candidate.pixelsPerStep,
      ),
    });
  }

  const entries = [...stepMetrics.entries()].map(([step, metrics]) => ({
    step,
    ...metrics,
  }));
  const allowedSteps = new Set<number>();

  if (entries.length === 0) {
    return { allowedSteps, primaryStep: undefined as number | undefined };
  }

  const pickPreferredEntry = (
    candidatesByScore: typeof entries,
    readableSubYearEntries: typeof entries = candidatesByScore,
  ) => {
    const strongestEntry = candidatesByScore[0];
    const preferredEntry =
      options.preferredStep === undefined
        ? undefined
        : entries.find((entry) => entry.step === options.preferredStep);

    if (!preferredEntry) {
      return strongestEntry;
    }

    if (useSubYearAxis) {
      const readablePreferred = readableSubYearEntries.find(
        (entry) => entry.step === preferredEntry.step,
      );
      const strongestReadable = readableSubYearEntries[0] ?? strongestEntry;

      if (
        readablePreferred &&
        readablePreferred.score >=
          strongestReadable.score * AXIS_LABEL_HYSTERESIS_KEEP_RATIO
      ) {
        return readablePreferred;
      }

      return strongestReadable;
    }

    const strongestScaleDistance = Math.abs(
      Math.log(strongestEntry.step / preferredEntry.step),
    );

    if (
      strongestScaleDistance <= Math.log(3) &&
      preferredEntry.score >=
        strongestEntry.score * AXIS_LABEL_HYSTERESIS_KEEP_RATIO
    ) {
      return preferredEntry;
    }

    return strongestEntry;
  };

  if (useSubYearAxis) {
    const readableEntries = entries
      .filter(
        (entry) =>
          entry.step < 1 &&
          entry.minPixelsPerStep >=
            entry.maxWidth + SUBYEAR_LABEL_MIN_CLEARANCE_PX,
      )
      .sort(
        (left, right) => left.step - right.step || right.score - left.score,
      );
    const preferredEntry = pickPreferredEntry(
      entries.sort(
        (left, right) => right.score - left.score || right.step - left.step,
      ),
      readableEntries,
    );

    allowedSteps.add(preferredEntry.step);

    const sortedReadableEntries = [...readableEntries].sort(
      (left, right) => right.score - left.score || right.step - left.step,
    );

    for (const entry of sortedReadableEntries) {
      if (entry.step === preferredEntry.step) {
        continue;
      }

      const ratio = entry.score / preferredEntry.score;
      const isAdjacentScale =
        Math.abs(Math.log(entry.step / preferredEntry.step)) <= Math.log(3);

      if (
        ratio >= AXIS_SUBYEAR_SECONDARY_STEP_RATIO &&
        isAdjacentScale &&
        allowedSteps.size < 2
      ) {
        allowedSteps.add(entry.step);
      }
    }

    return { allowedSteps, primaryStep: preferredEntry.step };
  }

  const sortedEntries = entries.sort(
    (left, right) => right.score - left.score || right.step - left.step,
  );
  const primaryEntry = pickPreferredEntry(sortedEntries);

  allowedSteps.add(primaryEntry.step);

  for (const entry of sortedEntries.slice(1)) {
    const ratio = entry.score / primaryEntry.score;
    const isAdjacentScale =
      Math.abs(Math.log(entry.step / primaryEntry.step)) <= Math.log(3);

    if (
      ratio >= AXIS_LABEL_SECONDARY_STEP_RATIO &&
      isAdjacentScale &&
      allowedSteps.size < 2
    ) {
      allowedSteps.add(entry.step);
    }
  }

  return { allowedSteps, primaryStep: primaryEntry.step };
}

function getPrimaryAxisLabelStepFromResolvedLabels(
  labels: AxisLabelCandidate[],
  preferredStep?: number,
) {
  if (labels.length === 0) {
    return preferredStep;
  }

  const scores = new Map<number, number>();

  for (const label of labels) {
    scores.set(label.step, (scores.get(label.step) ?? 0) + label.alpha);
  }

  return [...scores.entries()].sort(
    (left, right) =>
      right[1] - left[1] ||
      (preferredStep !== undefined && left[0] === preferredStep ? -1 : 0) ||
      right[0] - left[0],
  )[0]?.[0];
}

function getIntervalClearance(
  left: number,
  right: number,
  bounds: { left: number; right: number },
) {
  if (right < bounds.left) {
    return bounds.left - right;
  }

  if (left > bounds.right) {
    return left - bounds.right;
  }

  return -Math.min(right - bounds.left, bounds.right - left);
}

function resolveAxisLabelCandidates(
  candidates: AxisLabelCandidate[],
  occupiedSeed: Array<{ left: number; right: number }> = [],
  options: { dedupeByTextOnly?: boolean; relaxedSpacing?: boolean } = {},
) {
  const occupiedLabelBounds = [...occupiedSeed];
  const resolvedAxisLabels: AxisLabelCandidate[] = [];

  for (const candidate of [...candidates].sort((left, right) => {
    return (
      right.alpha - left.alpha || right.step - left.step || left.x - right.x
    );
  })) {
    const minPadding =
      candidate.step < 1
        ? options.relaxedSpacing
          ? 2
          : 6
        : AXIS_LABEL_OCCUPIED_PADDING;
    const dynamicPadding = Math.max(
      minPadding,
      Math.min(options.relaxedSpacing ? 8 : 24, candidate.pixelsPerStep * 0.12),
    );
    const left = candidate.x - candidate.width / 2 - dynamicPadding;
    const right = candidate.x + candidate.width / 2 + dynamicPadding;
    const nearestClearance = occupiedLabelBounds.reduce(
      (closest, bounds) =>
        Math.min(closest, getIntervalClearance(left, right, bounds)),
      Number.POSITIVE_INFINITY,
    );
    const spacingOpacity =
      nearestClearance === Number.POSITIVE_INFINITY
        ? 1
        : clamp01(
            (nearestClearance - AXIS_LABEL_CLEARANCE_FADE_START) /
              (AXIS_LABEL_CLEARANCE_FADE_END - AXIS_LABEL_CLEARANCE_FADE_START),
          );
    const resolvedAlpha = candidate.alpha * spacingOpacity;

    if (resolvedAlpha <= 0.01) {
      continue;
    }

    const hasNearbyDuplicateLabel = resolvedAxisLabels.some((existing) => {
      if (
        existing.text !== candidate.text ||
        existing.secondaryText !== candidate.secondaryText
      ) {
        return false;
      }

      const duplicateGap =
        Math.max(existing.width, candidate.width) +
        (options.relaxedSpacing ? 6 : AXIS_DUPLICATE_LABEL_MIN_GAP);

      return (
        Math.abs(existing.x - candidate.x) <
        (options.dedupeByTextOnly ? duplicateGap * 0.65 : duplicateGap)
      );
    });

    if (hasNearbyDuplicateLabel) {
      continue;
    }

    occupiedLabelBounds.push({ left, right });
    resolvedAxisLabels.push({
      ...candidate,
      alpha: resolvedAlpha,
    });
  }

  return resolvedAxisLabels;
}

function relaxOccupiedBounds(
  bounds: Array<{ left: number; right: number }>,
  inset: number,
) {
  return bounds.flatMap((bound) => {
    const left = bound.left + inset;
    const right = bound.right - inset;

    return left < right ? [{ left, right }] : [];
  });
}

function resolveAxisLabelCandidatesWithFallback(
  candidates: AxisLabelCandidate[],
  occupiedSeed: Array<{ left: number; right: number }> = [],
  options: {
    dedupeByTextOnly?: boolean;
    relaxedSpacing?: boolean;
    centerX?: number;
  } = {},
) {
  const resolved = resolveAxisLabelCandidates(
    candidates,
    occupiedSeed,
    options,
  );

  if (resolved.length > 0 || candidates.length === 0) {
    return resolved;
  }

  const relaxedResolved = resolveAxisLabelCandidates(
    candidates,
    relaxOccupiedBounds(occupiedSeed, 18),
    { ...options, relaxedSpacing: true },
  );

  if (relaxedResolved.length > 0) {
    return relaxedResolved;
  }

  const fallbackCandidate = [...candidates].sort(
    (left, right) =>
      right.alpha - left.alpha ||
      Math.abs(left.x - (options.centerX ?? 0)) -
        Math.abs(right.x - (options.centerX ?? 0)) ||
      left.x - right.x,
  )[0];

  return fallbackCandidate
    ? [{ ...fallbackCandidate, alpha: fallbackCandidate.alpha * 0.9 }]
    : [];
}

function measureAxisLabelWidth(
  context: CanvasRenderingContext2D,
  primaryText: string,
  primaryFont: string,
  secondaryText?: string,
  secondaryFont = primaryFont,
) {
  const previousFont = context.font;

  context.font = primaryFont;
  const primaryWidth = primaryText ? context.measureText(primaryText).width : 0;

  let secondaryWidth = 0;

  if (secondaryText) {
    context.font = secondaryFont;
    secondaryWidth = context.measureText(secondaryText).width;
  }

  context.font = previousFont;

  return Math.max(primaryWidth, secondaryWidth);
}

function findEraAtYear(eras: Era[], year: number): Era | undefined {
  return eras.find((era) => year >= era.startYear && year <= era.endYear);
}

function getTimelineLayout(
  height: number,
  overlayLaneCount: number,
): TimelineCanvasLayout {
  const overlayHeight =
    overlayLaneCount > 0
      ? overlayLaneCount * OVERLAY_LANE_HEIGHT +
        Math.max(overlayLaneCount - 1, 0) * OVERLAY_LANE_GAP
      : 0;
  const axisY = Math.max(
    128 + overlayHeight,
    Math.min(height * 0.62, height - 96),
  );
  const majorTickTop = axisY - 28;
  const overlayTop =
    overlayLaneCount > 0
      ? Math.max(44, majorTickTop - OVERLAY_PANEL_GAP - overlayHeight)
      : majorTickTop;
  const overlayBottom = overlayTop + overlayHeight;

  return {
    breadcrumbY: 14,
    overlayTop,
    overlayHeight,
    overlayBottom,
    axisY,
    markerStemBottom: axisY + 14,
    markerLabelY: axisY + 18,
    markerDateY: axisY + 34,
    majorTickTop,
    dateLabelY: axisY + 50,
    yearLabelY: axisY + 68,
    nowTop: majorTickTop - 18,
  };
}

function getOverlayLaneY(layout: TimelineCanvasLayout, laneIndex: number) {
  return (
    layout.overlayBottom -
    OVERLAY_LANE_HEIGHT -
    laneIndex * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP)
  );
}

function getExpandedOverlayPanelHeight(detail: ExpandedOverlayDetail | null) {
  if (!detail) {
    return 0;
  }

  return (
    EXPANDED_OVERLAY_TOP_PADDING +
    EXPANDED_OVERLAY_BOTTOM_PADDING +
    detail.laneCount * OVERLAY_LANE_HEIGHT +
    Math.max(detail.laneCount - 1, 0) * OVERLAY_LANE_GAP
  );
}

function compareOverlayBands(
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

const nestedOverlayLaneAssignmentCache = new WeakMap<
  TimelineOverlayBand[],
  NestedOverlayLaneAssignment
>();

function assignNestedOverlayLanes(
  overlays: TimelineOverlayBand[],
): NestedOverlayLaneAssignment {
  const cached = nestedOverlayLaneAssignmentCache.get(overlays);

  if (cached) {
    return cached;
  }

  const laneEndYears: number[] = [];
  const assigned = [...overlays].sort(compareOverlayBands).map((band) => {
    let laneIndex = laneEndYears.findIndex(
      (laneEndYear) => band.startYear >= laneEndYear,
    );

    if (laneIndex === -1) {
      laneIndex = laneEndYears.length;
      laneEndYears.push(band.endYear);
    } else {
      laneEndYears[laneIndex] = band.endYear;
    }

    return {
      band,
      laneIndex,
    };
  });

  const computed = {
    assigned,
    laneCount: Math.max(laneEndYears.length, 1),
  };

  nestedOverlayLaneAssignmentCache.set(overlays, computed);
  return computed;
}

function resolveExpandedOverlayDetail(
  expandedOverlayId: string | null,
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
): ExpandedOverlayDetail | null {
  if (!expandedOverlayId || width <= pad * 2) {
    return null;
  }

  const parent = resolvedOverlayBands.find(
    ({ band }) =>
      band.id === expandedOverlayId && (band.children?.length ?? 0) > 0,
  );

  if (!parent?.band.children?.length) {
    return null;
  }

  const innerWidth = width - pad * 2;
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const { assigned, laneCount } = assignNestedOverlayLanes(
    parent.band.children,
  );
  const children = assigned
    .filter(
      ({ band }) =>
        band.endYear >= visibleStart && band.startYear <= visibleEnd,
    )
    .map(({ band, laneIndex }) => ({
      band,
      laneIndex,
      x0: pad + worldToScreen(band.startYear, viewport, innerWidth),
      x1: pad + worldToScreen(band.endYear, viewport, innerWidth),
    }));

  if (children.length === 0) {
    return null;
  }

  const panelWidth = Math.min(Math.max(parent.renderWidth, 1), width - pad * 2);

  return {
    parent,
    children,
    laneCount,
    panelWidth,
    headerText: `${parent.band.label} · major polities`,
  };
}

function resolveExpandedOverlayDetails(
  expandedOverlayIds: readonly string[],
  resolvedOverlayBands: ResolvedTimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  return expandedOverlayIds
    .map((expandedOverlayId) =>
      resolveExpandedOverlayDetail(
        expandedOverlayId,
        resolvedOverlayBands,
        viewport,
        width,
        pad,
      ),
    )
    .filter((detail): detail is ExpandedOverlayDetail => detail !== null);
}

function resolveExpandedOverlayConnectorGeometry(
  children: ExpandedOverlayChild[],
  panelLeft: number,
  panelRight: number,
  parentCenterX: number,
  parentBandBottom: number,
  panelTop: number,
): ExpandedOverlayConnectorGeometry {
  let childConnectorLeft = Number.POSITIVE_INFINITY;
  let childConnectorRight = Number.NEGATIVE_INFINITY;

  for (const child of children) {
    const clippedLeft = Math.max(child.x0, panelLeft);
    const clippedRight = Math.min(child.x1, panelRight);

    if (clippedRight - clippedLeft < MIN_VISIBLE_OVERLAY_CHILD_WIDTH) {
      continue;
    }

    const childConnectorX = clippedLeft + (clippedRight - clippedLeft) / 2;
    childConnectorLeft = Math.min(childConnectorLeft, childConnectorX);
    childConnectorRight = Math.max(childConnectorRight, childConnectorX);
  }

  const railY = panelTop + Math.max(3, EXPANDED_OVERLAY_TOP_PADDING * 0.45);
  const fallbackLeft = Math.max(panelLeft, parentCenterX - 12);
  const fallbackRight = Math.min(panelRight, parentCenterX + 12);
  const railLeft = Number.isFinite(childConnectorLeft)
    ? Math.min(childConnectorLeft, parentCenterX)
    : fallbackLeft;
  const railRight = Number.isFinite(childConnectorRight)
    ? Math.max(childConnectorRight, parentCenterX)
    : fallbackRight;

  return {
    stemX: Math.min(Math.max(parentCenterX, railLeft), railRight),
    stemTop: parentBandBottom,
    stemBottom: railY,
    railLeft,
    railRight,
    railY,
  };
}

function isEquivalentHoveredTooltip(
  left: HoveredTooltipState | null,
  right: HoveredTooltipState | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.id === right.id &&
    left.placement === right.placement &&
    Math.abs(left.anchorX - right.anchorX) < 0.1 &&
    Math.abs(left.anchorY - right.anchorY) < 0.1
  );
}

function parseHexColor(color: string): RgbaColor | null {
  const hex = color.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b, a = "f"] = hex.split("");

    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
      a: Number.parseInt(`${a}${a}`, 16) / 255,
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  return null;
}

function parseRgbColor(color: string): RgbaColor | null {
  const match = color.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const parts = match[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const [r, g, b, alpha = "1"] = parts;

  return {
    r: Number.parseFloat(r),
    g: Number.parseFloat(g),
    b: Number.parseFloat(b),
    a: Number.parseFloat(alpha),
  };
}

function parseColor(color: string): RgbaColor | null {
  const normalized = color.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("#")) {
    return parseHexColor(normalized);
  }

  if (normalized.startsWith("rgb")) {
    return parseRgbColor(normalized);
  }

  return null;
}

function withAlpha(color: RgbaColor, alpha: number): RgbaColor {
  return {
    ...color,
    a: clamp01(alpha),
  };
}

function toCssColor(color: RgbaColor) {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${color.a})`;
}

function getOverlayLabelPaint(
  bandColor: string,
  bandOpacity: number,
  fallbackLabelColor: string,
  backgroundColor: string,
) {
  return resolveOverlayLabelPaint({
    bandColor,
    bandOpacity,
    fallbackLabelColor,
    backgroundColor,
  });
}

function drawPaperOverlayBand({
  context,
  x,
  y,
  width,
  height,
  bandColor,
  alpha,
  borderStyle,
  drawBorder,
}: {
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  bandColor: string;
  alpha: number;
  borderStyle: string;
  drawBorder: boolean;
}) {
  context.save();
  context.globalAlpha = alpha;
  context.shadowColor = "rgba(64, 46, 31, 0.2)";
  context.shadowBlur = 5;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 1;
  context.fillStyle = bandColor;
  context.fillRect(x, y, width, height);

  if (drawBorder) {
    context.shadowColor = "rgba(0, 0, 0, 0)";
    context.shadowBlur = 0;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.globalAlpha = Math.min(alpha * 0.72 + 0.08, 0.86);
    context.strokeStyle = borderStyle;
    context.lineWidth = 1;
    context.strokeRect(x, y, width, height);
  }

  context.restore();
}

function resolveOverlayBandLabelInsets({
  iconReservedWidth = 0,
  hasDisclosure = false,
}: {
  iconReservedWidth?: number;
  hasDisclosure?: boolean;
}) {
  return {
    left:
      OVERLAY_BAND_SIDE_PADDING + Math.max(iconReservedWidth, 0),
    right:
      OVERLAY_BAND_SIDE_PADDING +
      (hasDisclosure ? OVERLAY_BAND_DISCLOSURE_RESERVED_WIDTH : 0),
  };
}

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
  const axisTickAnimationRef = useRef<Map<string, AnimatedAxisTickState>>(
    new Map(),
  );
  const axisTickAnimationLastTimeRef = useRef(0);
  const axisTickAnimationFrameRef = useRef(0);
  const axisTickAnimationInitializedRef = useRef(false);
  const preferredAxisLabelStepRef = useRef<number | undefined>(undefined);
  const eraChildAnimationRef = useRef<Map<string, AnimatedEraChildState>>(
    new Map(),
  );
  const eraChildAnimationFrameRef = useRef(0);
  const eraChildAnimationInitializedRef = useRef(false);
  const markerPriorityBoostRef = useRef<Map<string, MarkerPriorityBoostState>>(
    new Map(),
  );
  const overlayBandAnimationRef = useRef<Map<string, AnimatedOverlayBandState>>(
    new Map(),
  );
  const overlayLabelAnimationRef = useRef<
    Map<string, AnimatedContextBandLabelState>
  >(new Map());
  const overlayLabelAnimationInitializedRef = useRef(false);
  const overlayBandAnimationInitializedRef = useRef(false);
  const markerPriorityBoostFrameRef = useRef(0);
  const markerPriorityBoostLastTimeRef = useRef(0);
  const overlayBandAnimationFrameRef = useRef(0);
  const overlayBandAnimationLastTimeRef = useRef(0);
  const previousOverlayVisibilityTransitionKeyRef = useRef(
    overlayVisibilityTransitionKey,
  );
  const expandedOverlayAnimationFrameRef = useRef(0);
  const expandedOverlayAnimationLastTimeRef = useRef(0);
  const expandedOverlayProgressByIdRef = useRef<Map<string, number>>(new Map());
  const renderedExpandedOverlayIdsRef = useRef<string[]>([]);
  const wheelFrameRef = useRef(0);
  const pendingWheelPanRef = useRef(0);
  const pendingWheelZoomRef = useRef(0);
  const pendingWheelAnchorRef = useRef(0);
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

      const visibleExpandedOverlayIds = renderedExpandedOverlayIdsRef.current.filter(
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
        PAD,
      );
      const expandedOverlayExpansionStates = expandedOverlayDetails.map(
        (detail) => {
          const fullHeight = getExpandedOverlayPanelHeight(detail);
          const progress =
            expandedOverlayProgressByIdRef.current.get(detail.parent.band.id) ?? 0;

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
      const overlayLabelAnimationStates = overlayLabelAnimationRef.current;
      const activeOverlayLabelKeys = new Set<string>();
      let hasActiveOverlayLabelAnimation = false;
      const hoverRegions: HoverRegion[] = [];
      const overlayInteractionRegions: OverlayInteractionRegion[] = [];
      const resolvedAxisTickStates = [...axisTickAnimationRef.current.values()]
        .filter(
          (tick) => tick.visibleProgress > 0.01 || tick.labelOpacity > 0.01,
        )
        .sort(
          (left, right) => left.step - right.step || left.year - right.year,
        );

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

      const renderEra = (era: Era, opacity: number) => {
        if (opacity < 0.01) return;

        const x0 = toX(era.startYear);
        const x1 = toX(era.endYear);
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
        context.globalAlpha =
          opacity * ERA_BAND_ALPHA * renderState.alphaMultiplier;
        context.fillStyle = era.color;
        context.fillRect(
          renderState.renderLeft,
          0,
          renderState.renderWidth,
          sceneHeight,
        );
        context.restore();

        const shouldHideInlineLabel = breadcrumbChainIds.has(era.id);

        if (eraWidth > 60 && !shouldHideInlineLabel) {
          const labelX =
            Math.max(x0, pad) / 2 + Math.min(x1, sceneWidth - pad) / 2;
          const labelBaselineY = axisY - 44;
          const labelAlpha =
            Math.min((eraWidth - 60) / 120, 1) *
            (0.28 + Math.min(opacity, 1) * 0.22);

          context.save();
          context.globalAlpha = labelAlpha;
          context.font = "11px var(--font-sans)";
          context.fillStyle = labelColor;
          context.textAlign = "center";
          context.textBaseline = "bottom";
          const labelMetrics = context.measureText(era.name);
          context.fillText(era.name, labelX, labelBaselineY);
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

      for (const layer of visibleEraLayers) {
        renderEra(layer.era, layer.opacity);
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
              alpha: OVERLAY_GROUP_ICON_PARENT_ALPHA * overlayState.currentOpacity,
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
                expandedOverlayProgressByIdRef.current.get(overlay.band.id) ?? 0;

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
      const isFullyZoomedOut =
        sceneViewport.zoom <= getMinZoomForWidth(innerWidth) + 0.001;
      const useBigBangElapsedLabels =
        !isFullyZoomedOut &&
        (sceneActiveEra.id === EARLY_UNIVERSE_ID ||
          startsAtBigBang ||
          earlyUniverseOverlap / visibleSpan >= 0.75);
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
      const formatAxisDate = (
        year: number | PreciseTimelineYear,
        step: number,
      ) => formatTimelineDateLabel(year, step);
      const formatElapsedAxisLabel = (
        year: number | PreciseTimelineYear,
        step: number,
      ) =>
        formatTimelineElapsedAxisLabelLines(
          year,
          step,
          useBigBangElapsedLabels ? "after-big-bang" : "ago",
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
          context.globalAlpha = 0.9;
          context.font = SUBYEAR_PRIMARY_FONT;
          context.fillText(
            formatAxisDate(year, edgeLabelStep),
            x,
            layout.dateLabelY,
          );
          context.globalAlpha = 0.72;
          context.font = SUBYEAR_SECONDARY_FONT;
          context.fillText(formatTimelineYear(year, 1), x, layout.yearLabelY);
        } else if (useElapsedSubYearAxis) {
          const edgeLabel = formatElapsedAxisLabel(year, edgeLabelStep);

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
              return getCalendarAxisLabelText(
                edgeLeftPreciseYear,
                edgeLabelStep,
              );
            }

            if (useElapsedSubYearAxis) {
              const edgeLabel = formatElapsedAxisLabel(
                edgeLeftPreciseYear,
                edgeLabelStep,
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
              return getCalendarAxisLabelText(
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

      if (hasActiveOverlayLabelAnimation && !drawFrameRef.current) {
        drawFrameRef.current = requestAnimationFrame(() => {
          drawFrameRef.current = 0;
          drawCanvasRef.current?.(["overlay-label-animation"]);
        });
      }
    },
    [
      commitHoveredTooltip,
      isViewportInteractionActive,
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

  const invalidateCanvas = useCallback(
    (reason = "unspecified") => {
      if (perfModeRef.current === "verbose") {
        incrementCounter(
          verbosePerfStatsRef.current.invalidationCounts,
          reason,
        );
        pendingInvalidateReasonsRef.current.add(reason);

        if (drawFrameRef.current) {
          incrementCounter(
            verbosePerfStatsRef.current.coalescedInvalidationCounts,
            reason,
          );
        }
      }

      if (drawFrameRef.current) {
        return;
      }

      drawFrameRef.current = requestAnimationFrame(() => {
        const reasons =
          perfModeRef.current === "verbose"
            ? [...pendingInvalidateReasonsRef.current]
            : [reason];

        if (perfModeRef.current === "verbose") {
          pendingInvalidateReasonsRef.current.clear();
        }

        drawFrameRef.current = 0;
        drawCanvas(reasons.length > 0 ? reasons : [reason]);
      });
    },
    [drawCanvas],
  );

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

  useEffect(() => {
    const boostStates = markerPriorityBoostRef.current;

    for (const [markerId, state] of [...boostStates.entries()]) {
      boostStates.set(markerId, {
        ...state,
        target: markerId === highlightedMarkerId ? 1 : 0,
      });
    }

    if (highlightedMarkerId && !boostStates.has(highlightedMarkerId)) {
      boostStates.set(highlightedMarkerId, {
        current: 0,
        target: 1,
      });
    }

    const stepAnimation = (now: number) => {
      const lastTime = markerPriorityBoostLastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      markerPriorityBoostLastTimeRef.current = now;
      const factor = 1 - Math.exp(-dt / MARKER_PRIORITY_BOOST_SMOOTHING_MS);
      let hasActiveAnimation = false;

      for (const [markerId, state] of [...boostStates.entries()]) {
        let nextCurrent =
          state.current + (state.target - state.current) * factor;

        if (Math.abs(state.target - nextCurrent) > 0.002) {
          hasActiveAnimation = true;
        } else {
          nextCurrent = state.target;
        }

        if (state.target <= 0.001 && nextCurrent <= 0.003) {
          boostStates.delete(markerId);
        } else {
          boostStates.set(markerId, {
            ...state,
            current: nextCurrent,
          });
        }
      }

      invalidateCanvas("marker-boost-animation");

      if (hasActiveAnimation) {
        markerPriorityBoostFrameRef.current =
          requestAnimationFrame(stepAnimation);
      } else {
        markerPriorityBoostFrameRef.current = 0;
      }
    };

    if (markerPriorityBoostFrameRef.current) {
      cancelAnimationFrame(markerPriorityBoostFrameRef.current);
    }

    markerPriorityBoostLastTimeRef.current = performance.now();
    markerPriorityBoostFrameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (markerPriorityBoostFrameRef.current) {
        cancelAnimationFrame(markerPriorityBoostFrameRef.current);
        markerPriorityBoostFrameRef.current = 0;
      }
    };
  }, [highlightedMarkerId, invalidateCanvas]);
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

  useEffect(() => {
    const animationStates = overlayBandAnimationRef.current;
    const activeIds = new Set<string>();
    const baseLayout = getTimelineLayout(height, overlayLaneCount);
    const shouldAnimateVisibilityChange =
      overlayBandAnimationInitializedRef.current &&
      overlayVisibilityTransitionKey !==
        previousOverlayVisibilityTransitionKeyRef.current;
    const hasInFlightAnimation = [...animationStates.values()].some(
      isOverlayBandStateAnimating,
    );
    const shouldPreserveAnimatedState =
      shouldAnimateVisibilityChange || hasInFlightAnimation;

    previousOverlayVisibilityTransitionKeyRef.current =
      overlayVisibilityTransitionKey;
    const targetYById = new Map(
      resolvedOverlayBands.map((overlay) => [
        overlay.band.id,
        getOverlayLaneY(baseLayout, overlay.laneIndex),
      ]),
    );

    for (const overlay of resolvedOverlayBands) {
      activeIds.add(overlay.band.id);
      const targetY = targetYById.get(overlay.band.id) ?? 0;

      const existing = animationStates.get(overlay.band.id);

      if (existing) {
        animationStates.set(overlay.band.id, {
          ...existing,
          overlay,
          currentOpacity: shouldPreserveAnimatedState
            ? existing.currentOpacity
            : 1,
          targetOpacity: 1,
          currentY: shouldPreserveAnimatedState ? existing.currentY : targetY,
          targetY,
        });
        continue;
      }

      animationStates.set(overlay.band.id, {
        overlay,
        currentOpacity:
          shouldAnimateVisibilityChange &&
          overlayBandAnimationInitializedRef.current
            ? 0
            : 1,
        targetOpacity: 1,
        currentY: targetY,
        targetY,
      });
    }

    for (const [overlayId, state] of [...animationStates.entries()]) {
      if (!activeIds.has(overlayId)) {
        const shouldKeepAnimatingExit =
          state.targetOpacity < 0.999 || isOverlayBandStateAnimating(state);

        if (!shouldAnimateVisibilityChange && !shouldKeepAnimatingExit) {
          animationStates.delete(overlayId);
          continue;
        }

        animationStates.set(overlayId, {
          ...state,
          targetOpacity: 0,
        });
      }
    }

    overlayBandAnimationInitializedRef.current = true;

    if (!shouldPreserveAnimatedState) {
      if (overlayBandAnimationFrameRef.current) {
        cancelAnimationFrame(overlayBandAnimationFrameRef.current);
        overlayBandAnimationFrameRef.current = 0;
      }

      invalidateCanvas("overlay-band-static-sync");

      return () => {
        if (overlayBandAnimationFrameRef.current) {
          cancelAnimationFrame(overlayBandAnimationFrameRef.current);
          overlayBandAnimationFrameRef.current = 0;
        }
      };
    }

    const hasPendingAnimation = [...animationStates.values()].some(
      isOverlayBandStateAnimating,
    );

    if (!hasPendingAnimation) {
      if (overlayBandAnimationFrameRef.current) {
        cancelAnimationFrame(overlayBandAnimationFrameRef.current);
        overlayBandAnimationFrameRef.current = 0;
      }

      invalidateCanvas("overlay-band-animation");

      return () => {
        if (overlayBandAnimationFrameRef.current) {
          cancelAnimationFrame(overlayBandAnimationFrameRef.current);
          overlayBandAnimationFrameRef.current = 0;
        }
      };
    }

    const stepAnimation = (now: number) => {
      const lastTime = overlayBandAnimationLastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      overlayBandAnimationLastTimeRef.current = now;
      const positionFactor =
        1 - Math.exp(-dt / OVERLAY_BAND_POSITION_SMOOTHING_MS);
      const hasVisibleExitingOverlays = [...animationStates.values()].some(
        (state) =>
          state.targetOpacity < state.currentOpacity - 0.001 &&
          state.currentOpacity > OVERLAY_BAND_REFLOW_START_OPACITY,
      );
      let hasActiveAnimation = false;
      let didChange = false;

      for (const [overlayId, state] of [...animationStates.entries()]) {
        const fadeSmoothingMs =
          state.targetOpacity < state.currentOpacity
            ? OVERLAY_BAND_FADE_OUT_SMOOTHING_MS
            : OVERLAY_BAND_FADE_IN_SMOOTHING_MS;
        const opacityFactor = 1 - Math.exp(-dt / fadeSmoothingMs);
        const nextOpacity =
          state.currentOpacity +
          (state.targetOpacity - state.currentOpacity) * opacityFactor;
        const nextY = hasVisibleExitingOverlays
          ? state.currentY
          : state.currentY + (state.targetY - state.currentY) * positionFactor;
        const settled = Math.abs(state.targetOpacity - nextOpacity) < 0.002;
        const settledY = hasVisibleExitingOverlays
          ? Math.abs(state.targetY - state.currentY) < 0.2
          : Math.abs(state.targetY - nextY) < 0.2;

        if (!settled || !settledY) {
          hasActiveAnimation = true;
        }

        if (Math.abs(nextOpacity - state.currentOpacity) > 0.0005) {
          didChange = true;
        }

        if (Math.abs(nextY - state.currentY) > 0.05) {
          didChange = true;
        }

        if (state.targetOpacity <= 0.001 && nextOpacity <= 0.003) {
          animationStates.delete(overlayId);
          continue;
        }

        animationStates.set(overlayId, {
          ...state,
          currentOpacity: settled ? state.targetOpacity : nextOpacity,
          currentY: settledY ? state.targetY : nextY,
        });
      }

      if (didChange) {
        invalidateCanvas("overlay-band-animation");
      }

      if (hasActiveAnimation) {
        overlayBandAnimationFrameRef.current =
          requestAnimationFrame(stepAnimation);
      } else {
        overlayBandAnimationFrameRef.current = 0;
      }
    };

    if (overlayBandAnimationFrameRef.current) {
      cancelAnimationFrame(overlayBandAnimationFrameRef.current);
    }

    overlayBandAnimationLastTimeRef.current = performance.now();
    overlayBandAnimationFrameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (overlayBandAnimationFrameRef.current) {
        cancelAnimationFrame(overlayBandAnimationFrameRef.current);
        overlayBandAnimationFrameRef.current = 0;
      }
    };
  }, [
    height,
    invalidateCanvas,
    overlayLaneCount,
    overlayVisibilityTransitionKey,
    resolvedOverlayBands,
  ]);

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
    const earlyUniverseOverlapEnd = Math.min(
      tickEnd,
      EARLY_UNIVERSE_END_YEAR,
    );
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
      (activeEra.id === EARLY_UNIVERSE_ID ||
        startsAtBigBang ||
        earlyUniverseOverlap / visibleSpan >= 0.75);

    return resolveAxisTickRenderStates(tickStart, tickEnd, innerWidth, {
      elapsedReference: isPrimordialFocused ? "after-big-bang" : "ago",
      elapsedSubYearReference: isPrimordialFocused ? "after-big-bang" : "ago",
      preciseStartYear: preciseRangeStart,
      preciseEndYear: preciseRangeEnd,
      preciseAnchorYear: getViewportCenterYear(viewport),
      scaleMode: "logarithmic",
    });
  }, [activeEra.id, viewport, width]);

  useEffect(() => {
    const animationStates = eraChildAnimationRef.current;
    const activeIds = new Set<string>();
    const now = performance.now();
    const visit = (eras: Era[]) => {
      for (const era of eras) {
        if (era.children?.length) {
          activeIds.add(era.id);
          const nextTarget = getEraChildOpacityTarget(
            era,
            activeEra.id,
            viewport,
            width,
            PAD,
            isAnimating,
            animationStates.get(era.id)?.target ?? 0,
          );

          const nextState = syncAnimatedEraChildState({
            existing: animationStates.get(era.id),
            nextTarget,
            now,
            duration: ERA_CHILD_TRANSITION_DURATION_MS,
            hasInitialized: eraChildAnimationInitializedRef.current,
          });
          animationStates.set(era.id, nextState);
          const shouldVisitDescendants =
            nextState.target > 0 || nextState.current > 0.001;

          if (shouldVisitDescendants) {
            visit(era.children);
          }
        }
      }
    };

    visit(siblingEras);

    for (const [eraId, state] of [...animationStates.entries()]) {
      if (!activeIds.has(eraId) && isViewportInteractionActive) {
        animationStates.delete(eraId);
      } else if (!activeIds.has(eraId) && state.target !== 0) {
        animationStates.set(eraId, {
          ...state,
          from: state.current,
          target: 0,
          startTime: now,
          duration: ERA_CHILD_TRANSITION_DURATION_MS,
        });
      }
    }

    eraChildAnimationInitializedRef.current = true;

    const hasPendingAnimation = [...animationStates.values()].some(
      (state) => Math.abs(state.target - state.current) > 0.001,
    );

    if (!hasPendingAnimation) {
      if (eraChildAnimationFrameRef.current) {
        cancelAnimationFrame(eraChildAnimationFrameRef.current);
        eraChildAnimationFrameRef.current = 0;
      }

      return;
    }

    const stepAnimation = (frameTime: number) => {
      let hasActiveAnimation = false;
      let didChange = false;

      for (const [eraId, state] of [...animationStates.entries()]) {
        const delta = state.target - state.current;
        let nextState = state;

        if (Math.abs(delta) <= 0.001) {
          nextState = {
            ...state,
            current: state.target,
          };
        } else {
          const rawT = Math.min(
            Math.max((frameTime - state.startTime) / state.duration, 0),
            1,
          );
          const t = smoothstep01(rawT);
          const nextCurrent = state.from + (state.target - state.from) * t;
          nextState = {
            ...state,
            current: rawT < 1 ? nextCurrent : state.target,
          };

          if (rawT < 1) {
            hasActiveAnimation = true;
          }
        }

        if (Math.abs(nextState.current - state.current) > 0.0005) {
          didChange = true;
        }

        if (
          !activeIds.has(eraId) &&
          nextState.target <= 0.001 &&
          nextState.current <= 0.001
        ) {
          animationStates.delete(eraId);
        } else {
          animationStates.set(eraId, nextState);
        }
      }

      if (didChange) {
        invalidateCanvas("era-child-animation");
      }

      if (hasActiveAnimation) {
        eraChildAnimationFrameRef.current =
          requestAnimationFrame(stepAnimation);
      } else {
        eraChildAnimationFrameRef.current = 0;
      }
    };

    if (eraChildAnimationFrameRef.current) {
      cancelAnimationFrame(eraChildAnimationFrameRef.current);
    }

    eraChildAnimationFrameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (eraChildAnimationFrameRef.current) {
        cancelAnimationFrame(eraChildAnimationFrameRef.current);
        eraChildAnimationFrameRef.current = 0;
      }
    };
  }, [
    activeEra.id,
    invalidateCanvas,
    isAnimating,
    isViewportInteractionActive,
    siblingEras,
    viewport,
    width,
  ]);

  useEffect(() => {
    const animationStates = axisTickAnimationRef.current;
    const activeKeys = new Set<string>();

    for (const target of axisTickTargets) {
      const key = makeAxisTickKey(target);
      activeKeys.add(key);
      const existing = animationStates.get(key);

      if (existing) {
        animationStates.set(key, {
          ...existing,
          year: target.year,
          wholeYear: target.wholeYear,
          yearFraction: target.yearFraction,
          step: target.step,
          hierarchyDepth: target.hierarchyDepth,
          pixelsPerStep: target.pixelsPerStep,
          growthProgress: target.growthProgress,
          labelStep: target.labelStep,
          generationIndex: target.generationIndex,
          generationProgress: target.generationProgress,
          targetVisibleProgress: target.visibleProgress,
          targetMajorProgress: target.majorProgress,
          targetLabelOpacity: target.labelOpacity,
          targetGenerationAlpha: target.generationAlpha,
        });
        continue;
      }

      const useImmediateValues = !axisTickAnimationInitializedRef.current;

      animationStates.set(key, {
        ...target,
        key,
        visibleProgress: useImmediateValues ? target.visibleProgress : 0,
        majorProgress: useImmediateValues ? target.majorProgress : 0,
        labelOpacity: useImmediateValues ? target.labelOpacity : 0,
        generationAlpha: useImmediateValues ? target.generationAlpha : 0,
        targetVisibleProgress: target.visibleProgress,
        targetMajorProgress: target.majorProgress,
        targetLabelOpacity: target.labelOpacity,
        targetGenerationAlpha: target.generationAlpha,
      });
    }

    for (const [key, state] of [...animationStates.entries()]) {
      if (!activeKeys.has(key)) {
        animationStates.set(key, {
          ...state,
          targetVisibleProgress: 0,
          targetMajorProgress: 0,
          targetLabelOpacity: 0,
          targetGenerationAlpha: 0,
        });
      }
    }

    axisTickAnimationInitializedRef.current = true;

    const hasPendingAnimation = [...animationStates.values()].some(
      (state) =>
        Math.abs(state.targetVisibleProgress - state.visibleProgress) > 0.002 ||
        Math.abs(state.targetMajorProgress - state.majorProgress) > 0.002 ||
        Math.abs(state.targetLabelOpacity - state.labelOpacity) > 0.002 ||
        Math.abs(state.targetGenerationAlpha - state.generationAlpha) > 0.002,
    );

    if (!hasPendingAnimation) {
      if (axisTickAnimationFrameRef.current) {
        cancelAnimationFrame(axisTickAnimationFrameRef.current);
        axisTickAnimationFrameRef.current = 0;
      }

      invalidateCanvas("axis-tick-animation");

      return () => {
        if (axisTickAnimationFrameRef.current) {
          cancelAnimationFrame(axisTickAnimationFrameRef.current);
          axisTickAnimationFrameRef.current = 0;
        }
      };
    }

    const stepAnimation = (now: number) => {
      const lastTime = axisTickAnimationLastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      axisTickAnimationLastTimeRef.current = now;
      const factor = 1 - Math.exp(-dt / AXIS_TICK_ANIMATION_SMOOTHING_MS);
      let hasActiveAnimation = false;
      let didChange = false;

      for (const [key, state] of [...animationStates.entries()]) {
        const nextVisibleProgress =
          state.visibleProgress +
          (state.targetVisibleProgress - state.visibleProgress) * factor;
        const nextMajorProgress =
          state.majorProgress +
          (state.targetMajorProgress - state.majorProgress) * factor;
        const labelFactor =
          state.targetLabelOpacity > state.labelOpacity
            ? 1 - Math.exp(-dt / AXIS_TICK_LABEL_FADE_IN_SMOOTHING_MS)
            : 1 - Math.exp(-dt / AXIS_TICK_LABEL_FADE_OUT_SMOOTHING_MS);
        const nextLabelOpacity =
          state.labelOpacity +
          (state.targetLabelOpacity - state.labelOpacity) * labelFactor;
        const nextGenerationAlpha =
          state.generationAlpha +
          (state.targetGenerationAlpha - state.generationAlpha) * factor;

        const settledVisible =
          Math.abs(state.targetVisibleProgress - nextVisibleProgress) < 0.002;
        const settledMajor =
          Math.abs(state.targetMajorProgress - nextMajorProgress) < 0.002;
        const settledLabel =
          Math.abs(state.targetLabelOpacity - nextLabelOpacity) < 0.002;
        const settledGenerationAlpha =
          Math.abs(state.targetGenerationAlpha - nextGenerationAlpha) < 0.002;

        if (
          !settledVisible ||
          !settledMajor ||
          !settledLabel ||
          !settledGenerationAlpha
        ) {
          hasActiveAnimation = true;
        }

        if (
          Math.abs(nextVisibleProgress - state.visibleProgress) > 0.0005 ||
          Math.abs(nextMajorProgress - state.majorProgress) > 0.0005 ||
          Math.abs(nextLabelOpacity - state.labelOpacity) > 0.0005 ||
          Math.abs(nextGenerationAlpha - state.generationAlpha) > 0.0005
        ) {
          didChange = true;
        }

        if (
          state.targetVisibleProgress <= 0.001 &&
          state.targetMajorProgress <= 0.001 &&
          state.targetLabelOpacity <= 0.001 &&
          state.targetGenerationAlpha <= 0.001 &&
          nextVisibleProgress <= 0.003 &&
          nextMajorProgress <= 0.003 &&
          nextLabelOpacity <= 0.003 &&
          nextGenerationAlpha <= 0.003
        ) {
          animationStates.delete(key);
        } else {
          animationStates.set(key, {
            ...state,
            visibleProgress: settledVisible
              ? state.targetVisibleProgress
              : nextVisibleProgress,
            majorProgress: settledMajor
              ? state.targetMajorProgress
              : nextMajorProgress,
            labelOpacity: settledLabel
              ? state.targetLabelOpacity
              : nextLabelOpacity,
            generationAlpha: settledGenerationAlpha
              ? state.targetGenerationAlpha
              : nextGenerationAlpha,
          });
        }
      }

      if (didChange) {
        invalidateCanvas("axis-tick-animation");
      }

      if (hasActiveAnimation) {
        axisTickAnimationFrameRef.current =
          requestAnimationFrame(stepAnimation);
      } else {
        axisTickAnimationFrameRef.current = 0;
      }
    };

    if (axisTickAnimationFrameRef.current) {
      cancelAnimationFrame(axisTickAnimationFrameRef.current);
    }

    axisTickAnimationLastTimeRef.current = performance.now();
    axisTickAnimationFrameRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (axisTickAnimationFrameRef.current) {
        cancelAnimationFrame(axisTickAnimationFrameRef.current);
        axisTickAnimationFrameRef.current = 0;
      }
    };
  }, [axisTickTargets, invalidateCanvas, isViewportInteractionActive]);

  useEffect(() => {
    setExpandedOverlayIds((current) => {
      const next = current.filter((expandedOverlayId) => {
        const expandedParent = resolvedOverlayBands.find(
          ({ band }) =>
            band.id === expandedOverlayId && (band.children?.length ?? 0) > 0,
        );

        return (
          !!expandedParent &&
          expandedParent.renderWidth >= MIN_EXPANDED_OVERLAY_PARENT_WIDTH
        );
      });

      return areStringArraysEqual(current, next) ? current : next;
    });
  }, [resolvedOverlayBands]);

  useEffect(() => {
    if (expandedOverlayIds.length > 0) {
      renderedExpandedOverlayIdsRef.current = [
        ...new Set([...renderedExpandedOverlayIdsRef.current, ...expandedOverlayIds]),
      ];
    }

    const stepAnimation = (now: number) => {
      const lastTime = expandedOverlayAnimationLastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      expandedOverlayAnimationLastTimeRef.current = now;
      const factor =
        1 - Math.exp(-dt / EXPANDED_OVERLAY_ANIMATION_SMOOTHING_MS);
      const progressById = expandedOverlayProgressByIdRef.current;
      const orderedIds = [
        ...new Set([
          ...renderedExpandedOverlayIdsRef.current,
          ...expandedOverlayIds,
          ...progressById.keys(),
        ]),
      ];
      let hasActiveAnimation = false;

      for (const expandedOverlayId of orderedIds) {
        const target = expandedOverlayIds.includes(expandedOverlayId) ? 1 : 0;
        const current = progressById.get(expandedOverlayId) ?? 0;
        let next = current + (target - current) * factor;

        if (Math.abs(target - next) <= 0.002) {
          next = target;
        }

        if (target > 0.001 || next > 0.003) {
          progressById.set(expandedOverlayId, next);
        } else {
          progressById.delete(expandedOverlayId);
        }

        if (Math.abs(target - next) > 0.002) {
          hasActiveAnimation = true;
        }
      }

      renderedExpandedOverlayIdsRef.current = orderedIds.filter(
        (expandedOverlayId) =>
          expandedOverlayIds.includes(expandedOverlayId) ||
          (progressById.get(expandedOverlayId) ?? 0) > 0.003,
      );

      invalidateCanvas("expanded-overlay-animation");

      if (hasActiveAnimation) {
        expandedOverlayAnimationFrameRef.current =
          requestAnimationFrame(stepAnimation);
      } else {
        expandedOverlayAnimationFrameRef.current = 0;
      }
    };

    if (expandedOverlayAnimationFrameRef.current) {
      cancelAnimationFrame(expandedOverlayAnimationFrameRef.current);
    }

    expandedOverlayAnimationLastTimeRef.current = performance.now();
    expandedOverlayAnimationFrameRef.current =
      requestAnimationFrame(stepAnimation);

    return () => {
      if (expandedOverlayAnimationFrameRef.current) {
        cancelAnimationFrame(expandedOverlayAnimationFrameRef.current);
        expandedOverlayAnimationFrameRef.current = 0;
      }
    };
  }, [expandedOverlayIds, invalidateCanvas]);

  useEffect(() => {
    return () => {
      if (eraChildAnimationFrameRef.current) {
        cancelAnimationFrame(eraChildAnimationFrameRef.current);
      }
      if (axisTickAnimationFrameRef.current) {
        cancelAnimationFrame(axisTickAnimationFrameRef.current);
      }
      if (markerPriorityBoostFrameRef.current) {
        cancelAnimationFrame(markerPriorityBoostFrameRef.current);
      }
      if (overlayBandAnimationFrameRef.current) {
        cancelAnimationFrame(overlayBandAnimationFrameRef.current);
      }
      if (expandedOverlayAnimationFrameRef.current) {
        cancelAnimationFrame(expandedOverlayAnimationFrameRef.current);
      }
      if (wheelFrameRef.current) {
        cancelAnimationFrame(wheelFrameRef.current);
      }
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

  /*
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || width <= 0 || height <= 0) {
      return;
    }
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const paper = themeRef.current.paper;
    const paperDeep = themeRef.current.paperDeep;
    const line = themeRef.current.line;
    const lineSoft = themeRef.current.lineSoft;
    const labelColor = themeRef.current.labelColor;
    const perfEnabled = perfDebugEnabledRef.current;
    const drawStart = perfEnabled ? performance.now() : 0;
    const perfSample = perfEnabled
      ? {
          ...createTimelinePerfBreakdown(),
          visibleEraCount: visibleEraLayers.length,
          visibleOverlayCount: resolvedOverlayBands.length,
          visibleMarkerCount: visibleMarkers.length,
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
    const innerWidth = width - pad * 2;
    const layout = getTimelineLayout(height, overlayLaneCount);
    const axisY = layout.axisY;
    const breadcrumbChainIds = new Set(
      breadcrumbChain.slice(1).map((era) => era.id),
    );
    const hoverRegions: HoverRegion[] = [];
    const overlayInteractionRegions: OverlayInteractionRegion[] = [];
    const resolvedAxisTickStates = [...axisTickAnimationRef.current.values()]
      .filter((tick) => tick.visibleProgress > 0.01 || tick.labelOpacity > 0.01)
      .sort((left, right) => left.step - right.step || left.year - right.year);

    // Helper: map world year to canvas x (offset into padded region)
    const toX = (year: number) =>
      pad + worldToScreen(year, viewport, innerWidth);

    // Background
    const background = context.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, paper);
    background.addColorStop(1, paperDeep);
    context.clearRect(0, 0, width, height);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    markPerf("setupMs");

    // Parent era tint in gaps between child era bands
    const parentTintColor = parentEra ? parseColor(parentEra.color) : null;

    if (parentTintColor && parentTintColor.a > 0.001) {
      context.fillStyle = toCssColor(
        withAlpha(parentTintColor, PARENT_ERA_TINT_ALPHA),
      );
      context.fillRect(pad, 0, innerWidth, height);
    }

    // Helper to render one era band
    const renderEra = (era: Era, opacity: number) => {
      if (opacity < 0.01) return;

      const x0 = toX(era.startYear);
      const x1 = toX(era.endYear);
      const eraWidth = x1 - x0;
      const clippedLeft = Math.max(x0, pad);
      const clippedRight = Math.min(x1, width - pad);

      if (x1 < pad || x0 > width - pad || eraWidth < 2) return;

      context.save();
      context.globalAlpha = opacity * ERA_BAND_ALPHA;
      context.fillStyle = era.color;
      context.fillRect(clippedLeft, 0, clippedRight - clippedLeft, height);
      context.restore();

      const shouldHideInlineLabel = breadcrumbChainIds.has(era.id);

      if (eraWidth > 60 && !shouldHideInlineLabel) {
        const labelX = Math.max(x0, pad) / 2 + Math.min(x1, width - pad) / 2;
        const labelAlpha =
          Math.min((eraWidth - 60) / 120, 1) *
          (0.28 + Math.min(opacity, 1) * 0.22);

        context.save();
        context.globalAlpha = labelAlpha;
        context.font = "11px var(--font-sans)";
        context.fillStyle = labelColor;
        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.fillText(era.name, labelX, axisY - 44);
        context.restore();
      }
    };

    // Render the resolved recursive era tree in depth order.
    for (const layer of visibleEraLayers) {
      renderEra(layer.era, layer.opacity);
    }
    markPerf("eraMs");

    if (resolvedOverlayBands.length > 0) {
      for (const overlay of resolvedOverlayBands) {
        const bandWidth = overlay.renderWidth;
        const canExpandParent = canExpandOverlayParent(
          bandWidth,
          overlay.band.children?.length ?? 0,
        );
        const y =
          getOverlayLaneY(layout, overlay.laneIndex) -
          getOverlayExpansionShift(
            overlay.laneIndex,
            expandedOverlayDetail,
            expandedOverlayAnimatedHeight,
          );

        hoverRegions.push({
          id: overlay.band.id,
          left: overlay.renderX,
          right: overlay.renderX + bandWidth,
          top: y - 4,
          bottom: y + OVERLAY_LANE_HEIGHT + 4,
          anchorX: overlay.renderX + bandWidth / 2,
          anchorY: y + 2,
          anchorMode: "follow-x",
          placement: "above",
          tooltip: getOverlayTooltipContent(overlay.band),
        });

        if (canExpandParent) {
          overlayInteractionRegions.push({
            id: overlay.band.id,
            left: overlay.renderX,
            right: overlay.renderX + bandWidth,
            top: y - 4,
            bottom: y + OVERLAY_LANE_HEIGHT + 4,
            role: "parent",
          });
        }

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
          alpha: overlayBandOpacity,
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
          hasDisclosure: canExpandParent,
        });
        const labelLeft = overlay.renderX + labelInsets.left;
        const labelRight = overlay.renderX + bandWidth - labelInsets.right;
        const labelWidth = Math.max(labelRight - labelLeft, 0);

        if (iconLayout) {
          drawOverlayGroupIcon({
            context,
            layout: iconLayout,
            strokeStyle: overlayLabelPaint.fillStyle,
            alpha: OVERLAY_GROUP_ICON_PARENT_ALPHA,
          });
        }

        const fullLabel = overlay.band.label;
        const shortLabel = overlay.band.shortLabel ?? fullLabel;
        context.font = "11px var(--font-sans)";
        const fullLabelWidth = context.measureText(fullLabel).width;
        const shortLabelWidth = context.measureText(shortLabel).width;
        const chosenLabel =
          fullLabelWidth <= Math.max(labelWidth - 10, 0)
            ? fullLabel
            : shortLabelWidth <= Math.max(labelWidth - 10, 0)
              ? shortLabel
              : "";
        const chosenLabelWidth =
          chosenLabel === fullLabel
            ? fullLabelWidth
            : chosenLabel === shortLabel
              ? shortLabelWidth
              : 0;
        const labelOpacity =
          chosenLabelWidth > 0
            ? clamp01((labelWidth - (chosenLabelWidth + 8)) / 20)
            : 0;

        if (chosenLabel && labelOpacity > 0.01) {
          context.fillStyle = overlayLabelPaint.fillStyle;
          context.globalAlpha = 0.82 * labelOpacity;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            chosenLabel,
            labelLeft + labelWidth / 2,
            y + OVERLAY_LANE_HEIGHT / 2,
          );
        }

        if (canExpandParent) {
          const indicatorOpacity = clamp01((bandWidth - 26) / 18);

          if (indicatorOpacity > 0.01) {
            const indicatorCenterX = overlay.renderX + bandWidth - 10;
            const indicatorCenterY = y + OVERLAY_LANE_HEIGHT / 2;
            const indicatorProgress =
              visibleExpandedOverlayId === overlay.band.id
                ? expandedOverlayProgress
                : 0;

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

    if (expandedOverlayDetail && expandedOverlayAnimatedHeight > 0.5) {
      const baseParentY = getOverlayLaneY(
        layout,
        expandedOverlayDetail.parent.laneIndex,
      );
      const parentY =
        baseParentY -
        getOverlayExpansionShift(
          expandedOverlayDetail.parent.laneIndex,
          expandedOverlayDetail,
          expandedOverlayAnimatedHeight,
        );
      const panelTop = parentY + OVERLAY_LANE_HEIGHT;
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
        const childLabelLeft = renderX + childLabelInsets.left;
        const childLabelRight = renderX + renderWidth - childLabelInsets.right;
        const childLabelWidth = Math.max(childLabelRight - childLabelLeft, 0);

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
        context.font = "11px var(--font-sans)";
        const fullLabelWidth = context.measureText(fullLabel).width;
        const shortLabelWidth =
          shortLabel === fullLabel
            ? fullLabelWidth
            : context.measureText(shortLabel).width;
        const chosenLabel =
          fullLabelWidth <= Math.max(childLabelWidth - 10, 0)
            ? fullLabel
            : shortLabelWidth <= Math.max(childLabelWidth - 10, 0)
              ? shortLabel
              : "";
        const chosenLabelWidth =
          chosenLabel === fullLabel
            ? fullLabelWidth
            : chosenLabel === shortLabel
              ? shortLabelWidth
              : 0;
        const labelOpacity =
          chosenLabelWidth > 0
            ? clamp01((childLabelWidth - (chosenLabelWidth + 8)) / 20)
            : 0;

        const animatedLabelOpacity = labelOpacity * childReveal * childLabelReveal;

        if (chosenLabel && animatedLabelOpacity > 0.01) {
          const hoverBounds = resolveOverlayLabelHoverBounds({
            centerX: childLabelLeft + childLabelWidth / 2,
            labelWidth: chosenLabelWidth,
            bandLeft: childLabelLeft,
            bandRight: childLabelRight,
            bandTop: childRenderY,
            bandBottom: childRenderY + OVERLAY_LANE_HEIGHT,
          });

          hoverRegions.push({
            id: child.band.id,
            left: hoverBounds.left,
            right: hoverBounds.right,
            top: hoverBounds.top,
            bottom: hoverBounds.bottom,
            anchorX: childLabelLeft + childLabelWidth / 2,
            anchorY: childRenderY + 2,
            anchorMode: "follow-x",
            placement: "above",
            tooltip: getOverlayTooltipContent(child.band),
          });

          context.fillStyle = childLabelPaint.fillStyle;
          context.globalAlpha = 0.8 * animatedLabelOpacity;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            chosenLabel,
            childLabelLeft + childLabelWidth / 2,
            childRenderY + OVERLAY_LANE_HEIGHT / 2,
          );
        }

        context.restore();
      }

      context.restore();
    }

    markPerf("overlayMs");

    // Timeline breadcrumb (centered)
    {
      const rootLabel = breadcrumbChain[0]?.name ?? activeEra.name;
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
      const startX = width / 2 - (rootWidth + trailWidth) / 2;

      context.globalAlpha = breadcrumbChain.length > 1 ? 0.9 : 0.76;
      context.fillText(rootLabel, startX, layout.breadcrumbY);

      if (trailText) {
        context.globalAlpha = 0.8;
        context.fillText(trailText, startX + rootWidth, layout.breadcrumbY);
      }

      context.restore();
    }

    // Axis line — always spans full padded area
    context.strokeStyle = line;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(pad, axisY);
    context.lineTo(width - pad, axisY);
    context.stroke();

    // Edge ticks — always fixed at the padded edges, with labels showing the
    // actual visible years at those positions, clamped to the timeline bounds.
    const fromX = (px: number) => screenToWorld(px - pad, viewport, innerWidth);
    const edgeLeftYear = Math.max(
      TIMELINE_MIN_YEAR,
      Math.min(TIMELINE_MAX_YEAR, fromX(pad)),
    );
    const edgeRightYear = Math.max(
      TIMELINE_MIN_YEAR,
      Math.min(TIMELINE_MAX_YEAR, fromX(width - pad)),
    );
    const edgeLeftX = pad;
    const edgeRightX = width - pad;
    const edgeLabelStep = (() => {
      const preferredStep = getPreferredAxisEdgeLabelStep(
        resolvedAxisTickStates,
      );

      if (preferredStep !== undefined) {
        return preferredStep;
      }

      const visibleSpan = Math.max(Math.abs(edgeRightYear - edgeLeftYear), 1);
      const approximateMajorCount = Math.max(2, Math.floor(innerWidth / 280));

      return Math.max(visibleSpan / approximateMajorCount, 1e-9);
    })();
    const fineGrainedAxisMode =
      edgeLabelStep < 1
        ? (() => {
            const dominantReference = getDominantTimelineDateReference(
              edgeLeftYear,
              edgeRightYear,
            );

            if (dominantReference !== null) {
              return dominantReference === "elapsed" ? "elapsed" : "calendar";
            }

            return null;
          })()
        : null;
    const visibleSpan = Math.max(edgeRightYear - edgeLeftYear, 1e-9);
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
    const useBigBangElapsedLabels =
      activeEra.id === EARLY_UNIVERSE_ID ||
      earlyUniverseOverlap / visibleSpan >= 0.75;
    const useSubYearAxis = fineGrainedAxisMode !== null;
    const useCalendarSubYearAxis = fineGrainedAxisMode === "calendar";
    const useElapsedSubYearAxis = fineGrainedAxisMode === "elapsed";
    const formatAxisLabel = (year: number, step: number) =>
      useBigBangElapsedLabels
        ? formatTimelineElapsedAxisLabel(year, step, "after-big-bang")
        : formatTimelineYear(year, step, { mode: "axis" });
    const formatAxisDate = (year: number, step: number) =>
      formatTimelineDateLabel(year, step);
    const formatElapsedAxisLabel = (year: number, step: number) =>
      formatTimelineElapsedAxisLabelLines(
        year,
        step,
        useBigBangElapsedLabels ? "after-big-bang" : "ago",
      );

    if (resolvedAxisTickStates.length > 0) {
      context.save();
      context.lineWidth = 1;
      const majorExtraAbove = axisY - 10 - layout.majorTickTop;
      const majorExtraBelow = axisY + 28 - (axisY + 10);

      for (const tick of resolvedAxisTickStates) {
        const x = toX(tick.year);
        if (x < pad - 32 || x > width - pad + 32) continue;

        // Fade at viewport edges
        const edgeFade = Math.min(
          Math.max(0, (x - pad) / 60),
          Math.max(0, (width - pad - x) / 60),
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
        const generationFade = tick.generationAlpha;

        if (generationFade <= 0.01) {
          continue;
        }

        const emphasisProgress = Math.max(
          tick.majorProgress * 0.92,
          tick.labelOpacity * 0.7,
        );
        const baseFade =
          edgeFade *
          (1 - emphasisProgress + emphasisProgress * boundaryFade) *
          generationFade;
        const overlayFade = edgeFade * boundaryFade * generationFade;
        const scaleP = getTickScaleProgress(tick.pixelsPerStep);
        const minorExtent =
          (2.4 + 10.4 * Math.pow(scaleP, 0.88)) *
          (0.42 + tick.visibleProgress * 0.58);
        const top = axisY - minorExtent - majorExtraAbove * emphasisProgress;
        const bottom =
          axisY + minorExtent + majorExtraBelow * emphasisProgress;

        if (baseFade > 0.01) {
          context.strokeStyle = lineSoft;
          const minorOpacity =
            0.16 +
            0.24 * Math.pow(scaleP, 0.82) +
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

    // Edge boundary ticks — always at pad edges with accurate year labels
    const edgeTickData = [
      { year: edgeLeftYear, x: pad, align: "left" as const },
      { year: edgeRightYear, x: width - pad, align: "right" as const },
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
        context.globalAlpha = 0.9;
        context.font = SUBYEAR_PRIMARY_FONT;
        context.fillText(
          formatAxisDate(year, edgeLabelStep),
          x,
          layout.dateLabelY,
        );

        context.globalAlpha = 0.72;
        context.font = SUBYEAR_SECONDARY_FONT;
        context.fillText(formatTimelineYear(year, 1), x, layout.yearLabelY);
      } else if (useElapsedSubYearAxis) {
        const edgeLabel = formatElapsedAxisLabel(year, edgeLabelStep);

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
        const edgeLabel = formatAxisLabel(year, edgeLabelStep);

        context.globalAlpha = 1;
        context.font = "11px var(--font-sans)";
        context.fillText(edgeLabel, x, layout.yearLabelY);
      }

      context.restore();
    }

    markPerf("axisMs");

    const visibleMarkerPositions = getVisibleMarkerPositions(
      visibleMarkers,
      width,
      pad,
      toX,
    );
    const baseResolvedMarkerStates = resolveMarkerRenderStates(
      visibleMarkerPositions,
      width,
      pad,
      (
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
      },
    );
    const activeMarkerBoosts = [...markerPriorityBoostRef.current.entries()]
      .filter(([, state]) => state.current > 0.001)
      .sort((left, right) => right[1].current - left[1].current);
    const resolvedMarkerStates = (() => {
      if (activeMarkerBoosts.length === 0) {
        return baseResolvedMarkerStates;
      }

      const finalStatesById = new Map(
        baseResolvedMarkerStates.map((state) => [
          state.marker.id,
          { ...state },
        ]),
      );

      for (const [boostedMarkerId, boostState] of activeMarkerBoosts) {
        const boostedStates = resolveMarkerRenderStates(
          visibleMarkerPositions,
          width,
          pad,
          (
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
          },
          {
            highlightedMarkerId: boostedMarkerId,
          },
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

      return baseResolvedMarkerStates.map(
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

    for (const { x, label, dateLabel, labelOpacity } of resolvedMarkerStates) {
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
      context.textBaseline = "top";
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

    // "Now" indicator
    const rawNowX = toX(TIMELINE_MAX_YEAR);
    const nowX = edgeRightYear === TIMELINE_MAX_YEAR ? width - pad : rawNowX;

    if (nowX >= pad - 20 && nowX <= width - pad + 20) {
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

    // Labels
    const edgeLabelLeftX = pad;
    const edgeLabelRightX = width - pad;
    context.fillStyle = labelColor;
    context.textAlign = "center";
    context.textBaseline = "top";

    const axisLabelCandidates: AxisLabelCandidate[] = [];
    const yearBoundaryCandidates: AxisLabelCandidate[] = [];

    for (const tick of resolvedAxisTickStates) {
      if (tick.labelOpacity <= 0.01) {
        continue;
      }

      const x = toX(tick.year);
      if (x < pad - 80 || x > width - pad + 80) continue;

      if (useSubYearAxis && tick.labelStep >= 1) {
        continue;
      }

      const calendarLabel = useCalendarSubYearAxis
        ? getCalendarAxisLabelText(tick.year, tick.labelStep)
        : null;
      const elapsedLabel = useElapsedSubYearAxis
        ? formatElapsedAxisLabel(tick.year, tick.labelStep)
        : null;
      const labelText = calendarLabel
        ? calendarLabel.text
        : elapsedLabel?.primaryText ?? formatAxisLabel(tick.year, tick.labelStep);
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

      // Fade out labels near edge boundary labels
      const distToMin = Math.abs(x - edgeLabelLeftX);
      const distToMax = Math.abs(x - edgeLabelRightX);
      const distToBoundary = Math.min(distToMin, distToMax);
      const boundaryFade =
        distToBoundary < 100 ? Math.max(0, (distToBoundary - 20) / 80) : 1;

      // Fade at viewport edges
      const labelEdgeFade = Math.min(
        Math.max(0, (x - pad) / 60),
        Math.max(0, (width - pad - x) / 60),
        1,
      );

      const labelAlpha =
        tick.labelOpacity * tick.generationAlpha * boundaryFade * labelEdgeFade;

      if (labelAlpha > 0.01) {
        axisLabelCandidates.push({
          x,
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
    } = getAllowedAxisLabelSteps(
      axisLabelCandidates,
      useSubYearAxis,
      { preferredStep: preferredAxisLabelStepRef.current },
    );

    const primaryEdgeLabelEntries = [
      {
        x: pad,
        ...(() => {
          if (useCalendarSubYearAxis) {
            return getCalendarAxisLabelText(edgeLeftYear, edgeLabelStep);
          }

          if (useElapsedSubYearAxis) {
            const edgeLabel = formatElapsedAxisLabel(edgeLeftYear, edgeLabelStep);

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
        x: width - pad,
        ...(() => {
          if (useCalendarSubYearAxis) {
            return getCalendarAxisLabelText(edgeRightYear, edgeLabelStep);
          }

          if (useElapsedSubYearAxis) {
            const edgeLabel = formatElapsedAxisLabel(edgeRightYear, edgeLabelStep);

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
          allowedLabelSteps.size === 0 || allowedLabelSteps.has(candidate.step),
      ),
      primaryOccupiedBounds,
      { dedupeByTextOnly: useSubYearAxis, centerX: width / 2 },
    );

    preferredAxisLabelStepRef.current = getPrimaryAxisLabelStepFromResolvedLabels(
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

        if (x < pad - 80 || x > width - pad + 80) {
          continue;
        }

        const labelText = formatTimelineYear(year, 1);
        const labelWidth = context.measureText(labelText).width;
        const boundaryFade =
          Math.min(
            Math.max(0, (x - pad) / 60),
            Math.max(0, (width - pad - x) / 60),
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
          x: width - pad,
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

    hoverRegionsRef.current = hoverRegions;
    overlayInteractionRegionsRef.current = overlayInteractionRegions;

    if (isViewportInteractionActive) {
      if (hoveredTooltipRef.current) {
        commitHoveredTooltip(null);
      }
    } else if (lastPointerRef.current && !dragStateRef.current) {
      const currentTooltip = hoveredTooltipRef.current;
      const stickyRect = tooltipSourcesRef.current?.getBoundingClientRect() ?? null;

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
        return;
      }

      const resolvedTooltip = resolveHoveredTooltip(
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
    } else if (!lastPointerRef.current) {
      commitHoveredTooltip(null);
    }

    if (perfSample) {
      markPerf("interactionMs");
      perfSample.totalMs = performance.now() - drawStart;
      recordTimelinePerf(perfStatsRef.current, perfSample, performance.now());
    }
  }, [
    activeEra,
    activeChain,
    commitHoveredTooltip,
    expandedOverlayDetail,
    expandedOverlayAnimatedHeight,
    expandedOverlayProgress,
    visibleExpandedOverlayId,
    breadcrumbChain,
    height,
    overlayLaneCount,
    parentEra,
    previewFocusChain,
    resolvedOverlayBands,
    visibleMarkers,
    visibleEraLayers,
    viewport,
    width,
    axisTickAnimationVersion,
    highlightedMarkerId,
    markerPriorityBoostVersion,
  ]);
*/

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

  const flushWheelUpdates = useCallback(() => {
    wheelFrameRef.current = 0;

    if (!width) {
      pendingWheelPanRef.current = 0;
      pendingWheelZoomRef.current = 0;
      return;
    }

    const pendingPan = pendingWheelPanRef.current;
    const pendingZoom = pendingWheelZoomRef.current;
    const pendingAnchor = pendingWheelAnchorRef.current;

    pendingWheelPanRef.current = 0;
    pendingWheelZoomRef.current = 0;

    if (Math.abs(pendingPan) <= 0.001 && Math.abs(pendingZoom) <= 0.0001) {
      return;
    }

    recordVerboseInteractionEvent("wheel-flush");

    const innerW = width - PAD * 2;
    onViewportChange((current) => {
      let next = current;

      if (Math.abs(pendingPan) > 0.001) {
        next = panByPixels(next, pendingPan, innerW);
      }

      if (Math.abs(pendingZoom) > 0.0001) {
        next = zoomAtPosition(
          next,
          next.zoom + pendingZoom,
          pendingAnchor,
          innerW,
        );
      }

      return next;
    });
  }, [onViewportChange, recordVerboseInteractionEvent, width]);

  const handleWheel = useCallback(
    (event: globalThis.WheelEvent, canvas: HTMLCanvasElement) => {
      if (!width) return;

      if (event.cancelable) {
        event.preventDefault();
      }

      markViewportInteraction("wheel");

      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

      if (horizontalIntent) {
        recordVerboseInteractionEvent("wheel-pan-intent");
        pendingWheelPanRef.current += -event.deltaX;
      } else {
        recordVerboseInteractionEvent("wheel-zoom-intent");
        pendingWheelZoomRef.current += -event.deltaY * 0.003;
        pendingWheelAnchorRef.current = anchorX;
      }

      if (!wheelFrameRef.current) {
        wheelFrameRef.current = requestAnimationFrame(flushWheelUpdates);
      }
    },
    [
      flushWheelUpdates,
      markViewportInteraction,
      recordVerboseInteractionEvent,
      width,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !width) {
      return;
    }

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      handleWheel(event, canvas);
    };

    canvas.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleNativeWheel);
    };
  }, [handleWheel, width]);

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

            return current.includes(parentId) ? current : [...current, parentId];
          });
        } else if (clickedRegion?.role === "panel") {
          setExpandedOverlayIds((current) => {
            const parentId = clickedRegion.parentId ?? clickedRegion.id;

            return current.includes(parentId) ? current : [...current, parentId];
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
