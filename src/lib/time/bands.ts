import { ticks, tickStep } from "d3-array";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./viewport";

export type TimelineTicks = {
  major: number[];
  minor: number[];
  majorStep: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");

function getFractionDigits(step: number, divisor: number) {
  const scaled = Math.abs(step) / divisor;

  if (scaled >= 1) return 0;
  if (scaled >= 0.1) return 1;
  if (scaled >= 0.01) return 2;
  if (scaled >= 0.001) return 3;
  if (scaled >= 0.0001) return 4;
  return 5;
}

function formatScaled(
  value: number,
  step: number,
  divisor: number,
  suffix: string,
) {
  const digits = getFractionDigits(step, divisor);
  const num = (value / divisor).toFixed(digits);
  // Strip trailing zeros after decimal point
  const trimmed = num.includes(".") ? num.replace(/\.?0+$/, "") : num;
  return `${trimmed}${suffix}`;
}

function isMajorTick(value: number, majorStep: number) {
  const safeStep = Math.max(Math.abs(majorStep), 1e-9);
  const ratio = value / safeStep;

  return Math.abs(ratio - Math.round(ratio)) < 1e-6;
}

export function getTimelineTicks(
  startYear: number,
  endYear: number,
  width: number,
): TimelineTicks {
  const safeWidth = Math.max(width, 1);
  const majorCount = Math.max(2, Math.floor(safeWidth / 280));
  const minorCount = Math.max(majorCount * 5, 10);
  const major = ticks(startYear, endYear, majorCount).filter(
    (v) => v >= TIMELINE_MIN_YEAR && v <= TIMELINE_MAX_YEAR,
  );

  const majorStep = Math.abs(tickStep(startYear, endYear, majorCount));
  const minor = ticks(startYear, endYear, minorCount).filter(
    (v) =>
      v >= TIMELINE_MIN_YEAR &&
      v <= TIMELINE_MAX_YEAR &&
      !isMajorTick(v, majorStep),
  );

  return { major, minor, majorStep };
}

export function formatTimelineYear(year: number, step = 1) {
  const absolute = Math.abs(year);

  if (year <= -1_000_000_000) {
    // Only downscale to millions when step is meaningfully between 1M and 10M
    if (step >= 1_000_000 && step < 10_000_000) {
      return `${formatScaled(absolute, step, 1_000_000, "M")} years ago`;
    }
    return `${formatScaled(absolute, step, 1_000_000_000, "B")} years ago`;
  }

  if (year <= -1_000_000) {
    if (step >= 1_000 && step < 10_000) {
      return `${formatScaled(absolute, step, 1_000, "k")} years ago`;
    }
    return `${formatScaled(absolute, step, 1_000_000, "M")} years ago`;
  }

  if (year <= -10_000) {
    return `${formatScaled(absolute, step, 1_000, "k")} years ago`;
  }

  if (year < 1) {
    return `${numberFormatter.format(Math.abs(Math.round(year)) + 1)} BCE`;
  }

  return `${numberFormatter.format(Math.round(year))} CE`;
}

export function formatTimelineRange(startYear: number, endYear: number) {
  return `${formatTimelineYear(startYear)} — ${formatTimelineYear(endYear)}`;
}
