import { formatTimelineDateLabel, formatTimelineYear } from "../bands";
import type { AxisTickRenderState } from "../axisTickStates";
import type { PreciseTimelineYear } from "@/lib/core/viewport";
import { clamp01 } from "@/lib/core/easing";
import {
  AXIS_DUPLICATE_LABEL_MIN_GAP,
  AXIS_LABEL_CLEARANCE_FADE_END,
  AXIS_LABEL_CLEARANCE_FADE_START,
  AXIS_LABEL_OCCUPIED_PADDING,
  CALENDAR_DAY_STEP,
  SUBYEAR_EDGE_LABEL_MIN_SPACING_PX,
} from "./constants";

export type AxisLabelCandidate = {
  x: number;
  text: string;
  secondaryText?: string;
  width: number;
  alpha: number;
  step: number;
  pixelsPerStep: number;
  priority?: number;
};

export function resolveAxisTickYear(
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

export function getCalendarAxisLabelText(
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

export function getCalendarEdgeAxisLabelText(
  year: number | PreciseTimelineYear,
  step: number,
) {
  const label = getCalendarAxisLabelText(year, step);

  return {
    text: label.text,
    secondaryText:
      step < CALENDAR_DAY_STEP
        ? `${label.secondaryText ?? formatTimelineDateLabel(year, CALENDAR_DAY_STEP)} · ${formatTimelineYear(year, 1)}`
        : formatTimelineYear(year, 1),
  };
}

const TICK_SCALE_LOG_MIN = Math.log(4.5);
const TICK_SCALE_LOG_RANGE = Math.log(280) - TICK_SCALE_LOG_MIN;

export function getTickScaleProgress(pixelsPerStep: number) {
  if (pixelsPerStep <= 4.5) return 0;

  return Math.min(
    1,
    Math.max(
      0,
      (Math.log(pixelsPerStep) - TICK_SCALE_LOG_MIN) / TICK_SCALE_LOG_RANGE,
    ),
  );
}

export function getPreferredAxisEdgeLabelStep(ticks: AxisTickRenderState[]) {
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

export function resolveAxisLabelCandidates(
  candidates: AxisLabelCandidate[],
  occupiedSeed: Array<{ left: number; right: number }> = [],
  options: { dedupeByTextOnly?: boolean; relaxedSpacing?: boolean } = {},
) {
  const occupiedLabelBounds = [...occupiedSeed];
  const resolvedAxisLabels: AxisLabelCandidate[] = [];

  for (const candidate of [...candidates].sort((left, right) => {
    return (
      (right.priority ?? right.step) - (left.priority ?? left.step) || left.x - right.x
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

const textWidths = new WeakMap<CanvasRenderingContext2D, { epoch: number; values: Map<string, number> }>();
let fontEpoch = 0;
if (typeof document !== "undefined") {
  document.fonts?.addEventListener("loadingdone", () => { fontEpoch++; });
}

export function measureAxisText(context: CanvasRenderingContext2D, text: string) {
  let cache = textWidths.get(context);
  if (!cache || cache.epoch !== fontEpoch) {
    cache = { epoch: fontEpoch, values: new Map() };
    textWidths.set(context, cache);
  }
  const key = `${context.font}\n${text}`;
  const existing = cache.values.get(key);
  if (existing !== undefined) return existing;
  const width = context.measureText(text).width;
  if (cache.values.size >= 2048) cache.values.delete(cache.values.keys().next().value!);
  cache.values.set(key, width);
  return width;
}

export function measureAxisLabelWidth(
  context: CanvasRenderingContext2D,
  primaryText: string,
  primaryFont: string,
  secondaryText?: string,
  secondaryFont = primaryFont,
) {
  const previousFont = context.font;

  context.font = primaryFont;
  const primaryWidth = primaryText ? measureAxisText(context, primaryText) : 0;

  let secondaryWidth = 0;

  if (secondaryText) {
    context.font = secondaryFont;
    secondaryWidth = measureAxisText(context, secondaryText);
  }

  context.font = previousFont;

  return Math.max(primaryWidth, secondaryWidth);
}
