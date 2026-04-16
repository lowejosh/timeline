import { ticks, tickStep } from "d3-array";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./viewport";

export type TimelineYearFormatOptions = {
  mode?: "default" | "axis";
};

export type TimelineElapsedLabel = {
  primaryText: string;
  secondaryText?: string;
};

export type TimelineElapsedReference = "ago" | "after-big-bang";

export type TimelineTicks = {
  major: number[];
  minor: number[];
  majorStep: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const AVERAGE_DAYS_PER_YEAR = 365.2425;
export const YEARS_AGO_CUTOFF = 10_000;
const ELAPSED_ZERO_EPSILON = 1e-9;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type DeepTimeAxisUnit = {
  divisor: number;
  suffix: string;
  minAbsolute: number;
  minFractionDigits: number;
  maxFractionDigits: number;
  maxWholeDigits: number;
};

const AXIS_DEEP_TIME_UNITS: readonly DeepTimeAxisUnit[] = [
  {
    divisor: 1_000_000_000,
    suffix: "B",
    minAbsolute: 1_000_000_000,
    minFractionDigits: 1,
    maxFractionDigits: 3,
    maxWholeDigits: 3,
  },
  {
    divisor: 1_000_000,
    suffix: "M",
    minAbsolute: 1_000_000,
    minFractionDigits: 0,
    maxFractionDigits: 2,
    maxWholeDigits: 5,
  },
  {
    divisor: 1_000,
    suffix: "k",
    minAbsolute: YEARS_AGO_CUTOFF,
    minFractionDigits: 0,
    maxFractionDigits: 1,
    maxWholeDigits: 4,
  },
] as const;

function getFractionDigits(step: number, divisor: number) {
  const scaled = Math.abs(step) / divisor;

  if (scaled >= 1) return 0;
  if (scaled >= 0.1) return 1;
  if (scaled >= 0.01) return 2;
  if (scaled >= 0.001) return 3;
  if (scaled >= 0.0001) return 4;
  return 5;
}

function countWholeDigits(value: number) {
  const absolute = Math.abs(value);

  if (!Number.isFinite(absolute) || absolute < 1) {
    return 1;
  }

  return Math.floor(Math.log10(absolute)) + 1;
}

function groupNumberString(value: string) {
  const [wholePart, fractionPart] = value.split(".");
  const groupedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionPart
    ? `${groupedWholePart}.${fractionPart}`
    : groupedWholePart;
}

function formatScaled(
  value: number,
  step: number,
  divisor: number,
  suffix: string,
  maxFractionDigits = Number.POSITIVE_INFINITY,
  minFractionDigits = 0,
) {
  const digits = Math.max(
    minFractionDigits,
    Math.min(getFractionDigits(step, divisor), maxFractionDigits),
  );
  const num = (value / divisor).toFixed(digits);
  // Strip trailing zeros after decimal point
  const trimmed = num.includes(".") ? num.replace(/\.?0+$/, "") : num;

  return `${groupNumberString(trimmed)}${suffix}`;
}

function formatUnitCount(
  value: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${numberFormatter.format(value)} ${value === 1 ? singular : plural}`;
}

function splitElapsedYearsAndDays(totalYears: number) {
  let years = Math.max(0, Math.floor(totalYears + 1e-9));
  let days = Math.max(
    0,
    Math.round((Math.max(totalYears, 0) - years) * AVERAGE_DAYS_PER_YEAR),
  );

  if (days >= Math.round(AVERAGE_DAYS_PER_YEAR)) {
    years += 1;
    days = 0;
  }

  return { years, days };
}

function createTimelineUtcDate(
  year: number,
  month = 0,
  day = 1,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
) {
  const date = new Date(
    Date.UTC(2000, month, day, hours, minutes, seconds, milliseconds),
  );

  date.setUTCFullYear(year, month, day);
  date.setUTCHours(hours, minutes, seconds, milliseconds);

  return date;
}

function getTimelineYearStart(year: number) {
  return createTimelineUtcDate(year, 0, 1).getTime();
}

function getTimelineDateFromYear(year: number) {
  const wholeYear = Math.floor(year);
  const fraction = year - wholeYear;
  const start = getTimelineYearStart(wholeYear);
  const end = getTimelineYearStart(wholeYear + 1);

  return new Date(start + fraction * (end - start));
}

export function getTimelineYearFromUtcDate(date: Date) {
  const wholeYear = date.getUTCFullYear();
  const start = getTimelineYearStart(wholeYear);
  const end = getTimelineYearStart(wholeYear + 1);

  return wholeYear + (date.getTime() - start) / (end - start);
}

export function getTimelineYearFromUtcParts(
  year: number,
  monthIndex: number,
  day = 1,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
) {
  return getTimelineYearFromUtcDate(
    createTimelineUtcDate(
      year,
      monthIndex,
      day,
      hours,
      minutes,
      seconds,
      milliseconds,
    ),
  );
}

function formatDefaultYearsAgo(absolute: number, step: number) {
  if (absolute >= 1_000_000_000) {
    // Only downscale to millions when step is meaningfully between 1M and 10M
    if (step >= 1_000_000 && step < 10_000_000) {
      return `${formatScaled(absolute, step, 1_000_000, "M")} years ago`;
    }

    return `${formatScaled(absolute, step, 1_000_000_000, "B")} years ago`;
  }

  if (absolute >= 1_000_000) {
    if (step >= 1_000 && step < 10_000) {
      return `${formatScaled(absolute, step, 1_000, "k")} years ago`;
    }

    return `${formatScaled(absolute, step, 1_000_000, "M")} years ago`;
  }

  return `${formatScaled(absolute, step, 1_000, "k")} years ago`;
}

function formatAxisElapsedYears(
  absolute: number,
  step: number,
  reference: TimelineElapsedReference,
) {
  if (reference === "after-big-bang" && absolute <= ELAPSED_ZERO_EPSILON) {
    return "Big Bang";
  }

  const suffix = reference === "after-big-bang" ? "after the Big Bang" : "ago";

  for (const unit of AXIS_DEEP_TIME_UNITS) {
    if (absolute < unit.minAbsolute) {
      continue;
    }

    const wholeDigits = countWholeDigits(absolute / unit.divisor);
    const fractionDigits = getFractionDigits(step, unit.divisor);

    if (
      wholeDigits > unit.maxWholeDigits ||
      fractionDigits > unit.maxFractionDigits
    ) {
      continue;
    }

    return `${formatScaled(
      absolute,
      step,
      unit.divisor,
      unit.suffix,
      unit.maxFractionDigits,
      unit.minFractionDigits,
    )} years ${suffix}`;
  }

  return `${numberFormatter.format(Math.round(absolute))} years ${suffix}`;
}

function formatAxisYearsAgo(absolute: number, step: number) {
  return formatAxisElapsedYears(absolute, step, "ago");
}

export function formatTimelineElapsedAxisLabel(
  year: number,
  step: number,
  reference: TimelineElapsedReference,
) {
  const elapsedYears =
    reference === "after-big-bang"
      ? year - TIMELINE_MIN_YEAR
      : TIMELINE_MAX_YEAR - year;

  return formatAxisElapsedYears(Math.max(0, elapsedYears), step, reference);
}

export function formatTimelineElapsedLabel(
  year: number,
  reference: TimelineElapsedReference = "ago",
): TimelineElapsedLabel | null {
  if (year > -YEARS_AGO_CUTOFF) {
    return null;
  }

  const isAfterBigBang = reference === "after-big-bang";
  const totalYears = isAfterBigBang
    ? year - TIMELINE_MIN_YEAR
    : TIMELINE_MAX_YEAR - year;
  const { years, days } = splitElapsedYearsAndDays(totalYears);

  if (isAfterBigBang && years <= 0 && days <= 0) {
    return { primaryText: "Big Bang" };
  }

  if (years <= 0) {
    return {
      primaryText: isAfterBigBang
        ? `${formatUnitCount(days, "day")} after the Big Bang`
        : `${formatUnitCount(days, "day")} ago`,
    };
  }

  if (days <= 0) {
    return {
      primaryText: isAfterBigBang
        ? `${formatUnitCount(years, "year")} after the Big Bang`
        : `${formatUnitCount(years, "year")} ago`,
    };
  }

  return {
    primaryText: formatUnitCount(years, "year"),
    secondaryText: isAfterBigBang
      ? `and ${formatUnitCount(days, "day")} after the Big Bang`
      : `and ${formatUnitCount(days, "day")} ago`,
  };
}

export function formatTimelineDateLabel(year: number, step = 1) {
  const safeStep = Math.max(Math.abs(step), 1e-9);

  if (year < 1 || safeStep >= 1) {
    return formatTimelineYear(year, step);
  }

  const date = getTimelineDateFromYear(year);
  const month = MONTH_LABELS[date.getUTCMonth()];

  if (safeStep >= 1 / 12) {
    return month;
  }

  return `${month} ${date.getUTCDate()}`;
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

export function formatTimelineYear(
  year: number,
  step = 1,
  options: TimelineYearFormatOptions = {},
) {
  const absolute = Math.abs(year);
  const safeStep = Math.max(Math.abs(step), 1e-9);
  const roundedYear = Math.round(year);

  if (year <= -YEARS_AGO_CUTOFF) {
    return options.mode === "axis"
      ? formatAxisYearsAgo(absolute, safeStep)
      : formatDefaultYearsAgo(absolute, safeStep);
  }

  if (year < 1) {
    return `${numberFormatter.format(
      roundedYear === 0 ? 1 : Math.abs(roundedYear),
    )} BCE`;
  }

  return `${numberFormatter.format(roundedYear)} CE`;
}

export function formatTimelineRange(startYear: number, endYear: number) {
  return `${formatTimelineYear(startYear)} — ${formatTimelineYear(endYear)}`;
}
