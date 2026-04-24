import { formatTimelineDateLabel, formatTimelineYear } from "../bands";
import type { AxisTickRenderState } from "../axisTickStates";
import type { PreciseTimelineYear } from "@/lib/core/viewport";
import { clamp01 } from "@/lib/core/easing";
import {
  AXIS_DUPLICATE_LABEL_MIN_GAP,
  AXIS_LABEL_CLEARANCE_FADE_END,
  AXIS_LABEL_CLEARANCE_FADE_START,
  AXIS_LABEL_HYSTERESIS_KEEP_RATIO,
  AXIS_LABEL_OCCUPIED_PADDING,
  AXIS_LABEL_SECONDARY_STEP_RATIO,
  AXIS_SUBYEAR_SECONDARY_STEP_RATIO,
  CALENDAR_DAY_STEP,
  SUBYEAR_EDGE_LABEL_MIN_SPACING_PX,
  SUBYEAR_LABEL_MIN_CLEARANCE_PX,
} from "./constants";

export type AxisLabelCandidate = {
  x: number;
  text: string;
  secondaryText?: string;
  width: number;
  alpha: number;
  step: number;
  pixelsPerStep: number;
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

export function makeAxisTickKey(
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

const TICK_SCALE_LOG_MIN = Math.log(3);
const TICK_SCALE_LOG_RANGE = Math.log(8_000) - TICK_SCALE_LOG_MIN;

export function getTickScaleProgress(pixelsPerStep: number) {
  if (pixelsPerStep <= 3) return 0;

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

export function getAllowedAxisLabelSteps(
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

export function getPrimaryAxisLabelStepFromResolvedLabels(
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

export function resolveAxisLabelCandidates(
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

export function resolveAxisLabelCandidatesWithFallback(
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

export function measureAxisLabelWidth(
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
