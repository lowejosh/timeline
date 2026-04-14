import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { formatTimelineYear } from "../../lib/time/bands";
import {
  type Era,
  type TimelineMarker,
  type TimelineOverlayBand,
} from "../../lib/data/eras";
import {
  getZoomAnchorForCanvasX,
  getVisibleRange,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  panByPixels,
  screenToWorld,
  worldToScreen,
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
} from "../../lib/time/overlayTracks";
import {
  getVisibleMarkerPositions,
  resolveMarkerRenderStates,
} from "../../lib/time/markerGlyphs";
import {
  resolveAxisTickRenderStates,
  type AxisTickRenderState,
} from "../../lib/time/axisTickStates";

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
  yearLabelY: number;
  nowTop: number;
};

type AxisLabelCandidate = {
  x: number;
  text: string;
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
};

type AnimatedEraChildState = {
  current: number;
  from: number;
  target: number;
  startTime: number;
  duration: number;
};

type RgbaColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const NOW_YEAR = new Date().getFullYear();
const PAD = 120;
const OVERLAY_LANE_HEIGHT = 16;
const OVERLAY_LANE_GAP = 8;
const OVERLAY_PANEL_GAP = 56;
const AXIS_LABEL_OCCUPIED_PADDING = 28;
const AXIS_LABEL_CLEARANCE_FADE_START = -14;
const AXIS_LABEL_CLEARANCE_FADE_END = 40;
const AXIS_TICK_ANIMATION_SMOOTHING_MS = 110;
const ERA_CHILD_TRANSITION_DURATION_MS = 220;
const AXIS_LABEL_SECONDARY_STEP_RATIO = 0.82;
const DARK_OVERLAY_LABEL: RgbaColor = { r: 34, g: 26, b: 19, a: 1 };
const LIGHT_OVERLAY_LABEL: RgbaColor = { r: 252, g: 248, b: 241, a: 1 };

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function makeAxisTickKey(tick: Pick<AxisTickRenderState, "step" | "year">) {
  return `${tick.step}:${tick.year.toFixed(8)}`;
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
    yearLabelY: axisY + 68,
    nowTop: majorTickTop - 18,
  };
}

function getOverlayLaneY(
  layout: TimelineCanvasLayout,
  laneIndex: number,
) {
  return (
    layout.overlayBottom -
    OVERLAY_LANE_HEIGHT -
    laneIndex * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP)
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
      a:
        hex.length === 8
          ? Number.parseInt(hex.slice(6, 8), 16) / 255
          : 1,
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

function blendColors(foreground: RgbaColor, background: RgbaColor): RgbaColor {
  const alpha = clamp01(foreground.a + background.a * (1 - foreground.a));

  if (alpha <= 0.0001) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  return {
    r:
      (foreground.r * foreground.a +
        background.r * background.a * (1 - foreground.a)) /
      alpha,
    g:
      (foreground.g * foreground.a +
        background.g * background.a * (1 - foreground.a)) /
      alpha,
    b:
      (foreground.b * foreground.a +
        background.b * background.a * (1 - foreground.a)) /
      alpha,
    a: alpha,
  };
}

function toRelativeLuminanceChannel(channel: number) {
  const normalized = channel / 255;

  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(color: RgbaColor) {
  return (
    0.2126 * toRelativeLuminanceChannel(color.r) +
    0.7152 * toRelativeLuminanceChannel(color.g) +
    0.0722 * toRelativeLuminanceChannel(color.b)
  );
}

function getContrastRatio(left: RgbaColor, right: RgbaColor) {
  const leftLuminance = getRelativeLuminance(left);
  const rightLuminance = getRelativeLuminance(right);
  const lighter = Math.max(leftLuminance, rightLuminance);
  const darker = Math.min(leftLuminance, rightLuminance);

  return (lighter + 0.05) / (darker + 0.05);
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
  const parsedBandColor = parseColor(bandColor);
  const parsedLabelColor = parseColor(fallbackLabelColor) ?? DARK_OVERLAY_LABEL;
  const parsedBackgroundColor = parseColor(backgroundColor) ?? {
    r: 247,
    g: 240,
    b: 226,
    a: 1,
  };

  if (!parsedBandColor) {
    return {
      fillStyle: fallbackLabelColor,
    };
  }

  const effectiveBandColor = blendColors(
    withAlpha(parsedBandColor, parsedBandColor.a * clamp01(bandOpacity)),
    parsedBackgroundColor,
  );
  const darkCandidate = withAlpha(parsedLabelColor, 1);
  const lightContrast = getContrastRatio(LIGHT_OVERLAY_LABEL, effectiveBandColor);
  const darkContrast = getContrastRatio(darkCandidate, effectiveBandColor);
  const useLightLabel = lightContrast >= darkContrast;
  const fillColor = useLightLabel ? LIGHT_OVERLAY_LABEL : darkCandidate;
  return {
    fillStyle: toCssColor(fillColor),
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
  const dragStateRef = useRef<DragState | null>(null);
  const axisTickAnimationRef = useRef<Map<string, AnimatedAxisTickState>>(new Map());
  const axisTickAnimationLastTimeRef = useRef(0);
  const axisTickAnimationFrameRef = useRef(0);
  const axisTickAnimationInitializedRef = useRef(false);
  const eraChildAnimationRef = useRef<Map<string, AnimatedEraChildState>>(new Map());
  const eraChildAnimationFrameRef = useRef(0);
  const eraChildAnimationInitializedRef = useRef(false);
  const [axisTickAnimationVersion, setAxisTickAnimationVersion] = useState(0);
  const [animatedEraChildOpacityById, setAnimatedEraChildOpacityById] = useState<
    ReadonlyMap<string, number>
  >(new Map());
  const resolvedEraLayers = useMemo(
    () =>
      resolveTimelineEraLayersFromOpacityMap(
        siblingEras,
        activeEra.id,
        viewport,
        width,
        PAD,
        animatedEraChildOpacityById,
      ),
    [activeEra.id, animatedEraChildOpacityById, siblingEras, viewport, width],
  );
  const visibleEraLayers = resolvedEraLayers.filter(
    (layer) => layer.opacity > 0.01,
  );
  const interactiveChildEras = getInteractiveDescendantEras(resolvedEraLayers);
  const visibleMarkers = getVisibleTimelineMarkers(markers, viewport, width, PAD);
  const resolvedOverlayBands = resolveTimelineOverlayTracks(
    overlayBands,
    viewport,
    width,
    PAD,
  );
  const overlayLaneCount = resolvedOverlayBands[0]?.laneCount ?? 0;
  const previewCandidates = useMemo(
    () =>
      siblingEras.some((era) => era.id === activeEra.id)
        ? (activeEra.children ?? [])
        : siblingEras,
    [activeEra, siblingEras],
  );
  const previewFocusChain = useMemo(
    () => getPreviewFocusChain(previewCandidates, resolvedEraLayers),
    [previewCandidates, resolvedEraLayers],
  );
  const breadcrumbChain = useMemo(() => {
    const chain = [...activeChain];

    for (const era of previewFocusChain) {
      if (!chain.some((entry) => entry.id === era.id)) {
        chain.push(era);
      }
    }

    return chain;
  }, [activeChain, previewFocusChain]);
  const axisTickTargets = useMemo(() => {
    if (width <= PAD * 2) {
      return [] as AxisTickRenderState[];
    }

    const innerWidth = width - PAD * 2;
    const [rangeStart, rangeEnd] = getVisibleRange(viewport, innerWidth);
    const tickStart = Math.max(rangeStart, TIMELINE_MIN_YEAR);
    const tickEnd = Math.min(rangeEnd, TIMELINE_MAX_YEAR);

    return resolveAxisTickRenderStates(tickStart, tickEnd, innerWidth);
  }, [viewport, width]);

  useEffect(() => {
    const animationStates = eraChildAnimationRef.current;
    const activeIds = new Set<string>();
    const now = performance.now();
    const createSnapshot = () => {
      const snapshot = new Map<string, number>();

      for (const [eraId, state] of animationStates) {
        snapshot.set(eraId, state.current);
      }

      return snapshot;
    };

    const visit = (eras: Era[]) => {
      for (const era of eras) {
        if (era.children?.length) {
          activeIds.add(era.id);
          const existing = animationStates.get(era.id);
          const nextTarget = getEraChildOpacityTarget(
            era,
            activeEra.id,
            viewport,
            width,
            PAD,
            isAnimating,
            existing?.target ?? 0,
          );

          if (existing) {
            if (existing.target !== nextTarget) {
              existing.from = existing.current;
              existing.target = nextTarget;
              existing.startTime = now;
              existing.duration = ERA_CHILD_TRANSITION_DURATION_MS;
            }
          } else {
            animationStates.set(era.id, {
              current: eraChildAnimationInitializedRef.current ? 0 : nextTarget,
              from: eraChildAnimationInitializedRef.current ? 0 : nextTarget,
              target: nextTarget,
              startTime: now,
              duration: ERA_CHILD_TRANSITION_DURATION_MS,
            });
          }

          visit(era.children);
        }
      }
    };

    visit(siblingEras);

    for (const [eraId, state] of animationStates) {
      if (!activeIds.has(eraId) && state.target !== 0) {
        state.from = state.current;
        state.target = 0;
        state.startTime = now;
        state.duration = ERA_CHILD_TRANSITION_DURATION_MS;
      }
    }

    eraChildAnimationInitializedRef.current = true;
    setAnimatedEraChildOpacityById(createSnapshot());

    const stepAnimation = (frameTime: number) => {
      let hasActiveAnimation = false;

      for (const [eraId, state] of animationStates) {
        const delta = state.target - state.current;

        if (Math.abs(delta) <= 0.001) {
          state.current = state.target;
        } else {
          const rawT = Math.min(
            Math.max((frameTime - state.startTime) / state.duration, 0),
            1,
          );
          const t = smoothstep01(rawT);

          state.current = state.from + (state.target - state.from) * t;

          if (rawT < 1) {
            hasActiveAnimation = true;
          } else {
            state.current = state.target;
          }
        }

        if (
          !activeIds.has(eraId) &&
          state.target <= 0.001 &&
          state.current <= 0.001
        ) {
          animationStates.delete(eraId);
        }
      }

      setAnimatedEraChildOpacityById(createSnapshot());

      if (hasActiveAnimation) {
        eraChildAnimationFrameRef.current = requestAnimationFrame(stepAnimation);
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
  }, [activeEra.id, isAnimating, siblingEras, viewport, width]);

  useEffect(() => {
    const animationStates = axisTickAnimationRef.current;
    const activeKeys = new Set<string>();

    for (const target of axisTickTargets) {
      const key = makeAxisTickKey(target);
      activeKeys.add(key);
      const existing = animationStates.get(key);

      if (existing) {
        existing.year = target.year;
        existing.step = target.step;
        existing.pixelsPerStep = target.pixelsPerStep;
        existing.growthProgress = target.growthProgress;
        existing.labelStep = target.labelStep;
        existing.targetVisibleProgress = target.visibleProgress;
        existing.targetMajorProgress = target.majorProgress;
        existing.targetLabelOpacity = target.labelOpacity;
        continue;
      }

      const useImmediateValues = !axisTickAnimationInitializedRef.current;

      animationStates.set(key, {
        ...target,
        key,
        visibleProgress: useImmediateValues ? target.visibleProgress : 0,
        majorProgress: useImmediateValues ? target.majorProgress : 0,
        labelOpacity: useImmediateValues ? target.labelOpacity : 0,
        targetVisibleProgress: target.visibleProgress,
        targetMajorProgress: target.majorProgress,
        targetLabelOpacity: target.labelOpacity,
      });
    }

    for (const [key, state] of animationStates) {
      if (!activeKeys.has(key)) {
        state.targetVisibleProgress = 0;
        state.targetMajorProgress = 0;
        state.targetLabelOpacity = 0;
      }
    }

    axisTickAnimationInitializedRef.current = true;

    const stepAnimation = (now: number) => {
      const lastTime = axisTickAnimationLastTimeRef.current || now;
      const dt = Math.max(now - lastTime, 0);
      axisTickAnimationLastTimeRef.current = now;
      const factor = 1 - Math.exp(-dt / AXIS_TICK_ANIMATION_SMOOTHING_MS);
      let hasActiveAnimation = false;

      for (const [key, state] of animationStates) {
        state.visibleProgress +=
          (state.targetVisibleProgress - state.visibleProgress) * factor;
        state.majorProgress +=
          (state.targetMajorProgress - state.majorProgress) * factor;
        state.labelOpacity +=
          (state.targetLabelOpacity - state.labelOpacity) * factor;

        const settledVisible =
          Math.abs(state.targetVisibleProgress - state.visibleProgress) < 0.002;
        const settledMajor =
          Math.abs(state.targetMajorProgress - state.majorProgress) < 0.002;
        const settledLabel =
          Math.abs(state.targetLabelOpacity - state.labelOpacity) < 0.002;

        if (!settledVisible || !settledMajor || !settledLabel) {
          hasActiveAnimation = true;
        }

        if (
          state.targetVisibleProgress <= 0.001 &&
          state.targetMajorProgress <= 0.001 &&
          state.targetLabelOpacity <= 0.001 &&
          state.visibleProgress <= 0.003 &&
          state.majorProgress <= 0.003 &&
          state.labelOpacity <= 0.003
        ) {
          animationStates.delete(key);
        }
      }

      setAxisTickAnimationVersion((version) => version + 1);

      if (hasActiveAnimation) {
        axisTickAnimationFrameRef.current = requestAnimationFrame(stepAnimation);
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
  }, [axisTickTargets]);

  useEffect(() => {
    return () => {
      if (eraChildAnimationFrameRef.current) {
        cancelAnimationFrame(eraChildAnimationFrameRef.current);
      }
      if (axisTickAnimationFrameRef.current) {
        cancelAnimationFrame(axisTickAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || width <= 0 || height <= 0) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue("--timeline-surface").trim();
    const paperDeep = styles.getPropertyValue("--timeline-surface-deep").trim();
    const line = styles.getPropertyValue("--timeline-line").trim();
    const lineSoft = styles.getPropertyValue("--timeline-line-soft").trim();
    const labelColor = styles.getPropertyValue("--timeline-label").trim();
    const pad = PAD;
    const innerWidth = width - pad * 2;
    const layout = getTimelineLayout(height, overlayLaneCount);
    const axisY = layout.axisY;
    const breadcrumbChainIds = new Set(
      breadcrumbChain.slice(1).map((era) => era.id),
    );
    const resolvedAxisTickStates = [...axisTickAnimationRef.current.values()]
      .filter(
        (tick) => tick.visibleProgress > 0.01 || tick.labelOpacity > 0.01,
      )
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

    // Parent era tint in gaps between child era bands
    if (parentEra && parentEra.color !== "rgba(0, 0, 0, 0)") {
      const tintColor = parentEra.color.replace(/[\d.]+\)$/, "0.06)");
      context.fillStyle = tintColor;
      context.fillRect(pad, 0, innerWidth, height);
    }

    // Helper to render one era band
    const renderEra = (era: Era, opacity: number) => {
      if (opacity < 0.01) return;

      const x0 = toX(era.startYear);
      const x1 = toX(era.endYear);
      const eraWidth = x1 - x0;

      if (x1 < pad || x0 > width - pad || eraWidth < 2) return;

      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = era.color;
      context.fillRect(
        Math.max(x0, pad),
        0,
        Math.min(x1, width - pad) - Math.max(x0, pad),
        height,
      );
      context.restore();

      const shouldHideInlineLabel =
        breadcrumbChainIds.has(era.id);

      if (eraWidth > 60 && !shouldHideInlineLabel) {
        const labelX = Math.max(x0, pad) / 2 + Math.min(x1, width - pad) / 2;
        const labelAlpha =
          Math.min((eraWidth - 60) / 120, 1) * (0.28 + Math.min(opacity, 1) * 0.22);

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

    if (resolvedOverlayBands.length > 0) {
      for (const overlay of resolvedOverlayBands) {
        const progress = overlay.visibilityProgress * overlay.renderOpacity;

        if (progress <= 0.01) {
          continue;
        }

        const bandWidth = overlay.renderWidth;
        const y = getOverlayLaneY(layout, overlay.laneIndex);

        context.save();
        context.globalAlpha = 0.92 * progress;
        context.fillStyle = overlay.band.color;
        context.fillRect(overlay.renderX, y, bandWidth, OVERLAY_LANE_HEIGHT);
        context.strokeStyle = lineSoft;
        context.lineWidth = 1;
        context.strokeRect(overlay.renderX, y, bandWidth, OVERLAY_LANE_HEIGHT);

        const fullLabel = overlay.band.label;
        const shortLabel = overlay.band.shortLabel ?? fullLabel;
        context.font = "11px var(--font-sans)";
        const fullLabelWidth = context.measureText(fullLabel).width;
        const shortLabelWidth = context.measureText(shortLabel).width;
        const chosenLabel =
          fullLabelWidth <= Math.max(bandWidth - 10, 0)
            ? fullLabel
            : shortLabelWidth <= Math.max(bandWidth - 10, 0)
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
            ? clamp01((bandWidth - (chosenLabelWidth + 8)) / 20)
            : 0;

        if (chosenLabel && labelOpacity > 0.01) {
          const overlayBandOpacity = 0.92 * progress;
          const overlayLabelPaint = getOverlayLabelPaint(
            overlay.band.color,
            overlayBandOpacity,
            labelColor,
            paper,
          );

          context.fillStyle = overlayLabelPaint.fillStyle;
          context.globalAlpha = 0.82 * progress * labelOpacity;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(
            chosenLabel,
            overlay.renderX + bandWidth / 2,
            y + OVERLAY_LANE_HEIGHT / 2,
          );
        }

        context.restore();
      }
    }

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

        const baseFade =
          edgeFade *
          (1 - tick.majorProgress + tick.majorProgress * boundaryFade);
        const overlayFade = edgeFade * boundaryFade;
        const minorExtent = 10 * tick.visibleProgress;
        const top =
          axisY - minorExtent - majorExtraAbove * tick.majorProgress;
        const bottom =
          axisY + minorExtent + majorExtraBelow * tick.majorProgress;

        if (baseFade > 0.01) {
          context.strokeStyle = lineSoft;
          context.globalAlpha =
            (0.18 + tick.visibleProgress * 0.36) * baseFade;
          context.beginPath();
          context.moveTo(x, top);
          context.lineTo(x, bottom);
          context.stroke();
        }

        if (tick.majorProgress > 0.01 && overlayFade > 0.01) {
          context.strokeStyle = line;
          context.globalAlpha = 0.88 * tick.majorProgress * overlayFade;
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

      const edgeLabel = formatTimelineYear(year, 1);
      context.fillStyle = labelColor;
      context.font = "11px var(--font-sans)";
      context.textAlign = align;
      context.textBaseline = "top";
      context.fillText(edgeLabel, x, layout.yearLabelY);
      context.restore();
    }

    const visibleMarkerPositions = getVisibleMarkerPositions(
      visibleMarkers,
      width,
      pad,
      toX,
    );
    const resolvedMarkerStates = resolveMarkerRenderStates(
      visibleMarkerPositions,
      width,
      pad,
      (_marker, { fullLabel, shortLabel, dateLabel }) => {
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

    for (const { marker, x, dotProgress, stemProgress } of resolvedMarkerStates) {
      const markerColor = marker.color ?? line;
      const stemStartY = axisY + 2;
      const stemY =
        stemStartY +
        (layout.markerStemBottom - stemStartY) * stemProgress;

      context.save();
      context.strokeStyle = markerColor;
      context.fillStyle = markerColor;
      context.globalAlpha = 0.18 + stemProgress * 0.72;
      context.lineWidth = 1.5;

      if (stemProgress > 0.001) {
        context.beginPath();
        context.moveTo(x, stemStartY);
        context.lineTo(x, stemY);
        context.stroke();
      }

      const dotRadius = 3.5 * dotProgress;

      if (dotRadius > 0.001) {
        context.globalAlpha = 0.14 + dotProgress * 0.76;
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

    // "Now" indicator
    const rawNowX = toX(NOW_YEAR);
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
    context.font = "13px var(--font-sans)";
    context.textAlign = "center";
    context.textBaseline = "top";

    const axisLabelCandidates: AxisLabelCandidate[] = [];

    for (const tick of resolvedAxisTickStates) {
      if (tick.labelOpacity <= 0.01) {
        continue;
      }

      const x = toX(tick.year);
      if (x < pad - 80 || x > width - pad + 80) continue;

      const labelText = formatTimelineYear(tick.year, tick.labelStep);
      const labelWidth = context.measureText(labelText).width;

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

      const labelAlpha = tick.labelOpacity * boundaryFade * labelEdgeFade;

      if (labelAlpha > 0.01) {
        axisLabelCandidates.push({
          x,
          text: labelText,
          width: labelWidth,
          alpha: labelAlpha,
          step: tick.labelStep,
          pixelsPerStep: tick.pixelsPerStep,
        });
      }
    }

    const labelStepScores = new Map<number, number>();

    for (const candidate of axisLabelCandidates) {
      labelStepScores.set(
        candidate.step,
        (labelStepScores.get(candidate.step) ?? 0) + candidate.alpha,
      );
    }

    const sortedLabelSteps = [...labelStepScores.entries()].sort(
      (left, right) => right[1] - left[1] || right[0] - left[0],
    );
    const primaryLabelStep = sortedLabelSteps[0];
    const allowedLabelSteps = new Set<number>();

    if (primaryLabelStep) {
      allowedLabelSteps.add(primaryLabelStep[0]);

      for (const [step, score] of sortedLabelSteps.slice(1)) {
        const ratio = score / primaryLabelStep[1];
        const isAdjacentScale =
          Math.abs(Math.log(step / primaryLabelStep[0])) <= Math.log(3);

        if (
          ratio >= AXIS_LABEL_SECONDARY_STEP_RATIO &&
          isAdjacentScale &&
          allowedLabelSteps.size < 2
        ) {
          allowedLabelSteps.add(step);
        }
      }
    }

    const occupiedLabelBounds: Array<{ left: number; right: number }> = [];
    const resolvedAxisLabels: AxisLabelCandidate[] = [];

    const edgeLabelEntries = [
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

    for (const edgeLabel of edgeLabelEntries) {
      const labelWidth = context.measureText(edgeLabel.text).width;
      const left =
        edgeLabel.align === "left"
          ? edgeLabel.x - AXIS_LABEL_OCCUPIED_PADDING
          : edgeLabel.x - labelWidth - AXIS_LABEL_OCCUPIED_PADDING;
      const right =
        edgeLabel.align === "left"
          ? edgeLabel.x + labelWidth + AXIS_LABEL_OCCUPIED_PADDING
          : edgeLabel.x + AXIS_LABEL_OCCUPIED_PADDING;

      occupiedLabelBounds.push({ left, right });
    }

    for (const candidate of [...axisLabelCandidates]
      .filter((candidate) =>
        allowedLabelSteps.size === 0 || allowedLabelSteps.has(candidate.step),
      )
      .sort((left, right) => {
        return (
          right.alpha - left.alpha ||
          right.step - left.step ||
          left.x - right.x
        );
      })) {
      const dynamicPadding = Math.max(
        AXIS_LABEL_OCCUPIED_PADDING,
        Math.min(72, candidate.pixelsPerStep * 0.18),
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

      occupiedLabelBounds.push({ left, right });
      resolvedAxisLabels.push({
        ...candidate,
        alpha: resolvedAlpha,
      });
    }

    for (const label of resolvedAxisLabels.sort((left, right) => left.x - right.x)) {
      context.save();
      context.globalAlpha = label.alpha;
      context.fillText(label.text, label.x, layout.yearLabelY);
      context.restore();
    }
  }, [
    activeEra,
    activeChain,
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
  ]);

  // Pinch-to-zoom via native gesture events (Safari) and touch events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width) return;

    // Safari gesture events
    const handleGestureChange = (event: Event) => {
      event.preventDefault();
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
        const dx = event.touches[1].clientX - event.touches[0].clientX;
        const dy = event.touches[1].clientY - event.touches[0].clientY;
        lastTouchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
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
  }, [width, viewport, onAnimateZoom, onViewportChange]);

  const handleWheel = (event: WheelEvent<HTMLCanvasElement>) => {
    if (!width) return;

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const anchorX = getZoomAnchorForCanvasX(localX, width, PAD);
    const innerW = width - PAD * 2;
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);

    if (horizontalIntent) {
      onViewportChange((current) =>
        panByPixels(current, -event.deltaX, innerW),
      );
      return;
    }

    // Use animated zoom for smooth feel
    const zoomDelta = -event.deltaY * 0.003;
    onAnimateZoom(zoomDelta, anchorX);
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    dragStateRef.current = {
      pointerId: event.pointerId,
      lastX: event.clientX,
    };

    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !width) return;

    const deltaX = event.clientX - dragState.lastX;
    dragStateRef.current = { ...dragState, lastX: event.clientX };

    onRecordDragSample(deltaX);
    const innerW = width - PAD * 2;
    onViewportChange((current) => panByPixels(current, deltaX, innerW));
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      onReleaseMomentum();
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!width) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left - PAD;
    const innerW = width - PAD * 2;
    const clickYear = screenToWorld(clickX, viewport, innerW);
    // Check visible child layers first, then siblings
    const era =
      findEraAtYear(interactiveChildEras, clickYear) ??
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
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      ref={canvasRef}
      tabIndex={0}
    />
  );
}
