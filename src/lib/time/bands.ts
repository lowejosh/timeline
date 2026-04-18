import { ticks, tickStep } from "d3-array";
import {
  splitTimelineYear,
  toApproximateTimelineYear,
  type PreciseTimelineYear,
} from "./viewport";
import {
  getPreciseTimelineYearDelta,
  getTimelineYearFromYearsAgo,
  getYearsAfterBigBang,
  getYearsAgoFromPresent,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
} from "./timelineYears";

export type TimelineYearFormatOptions = {
  mode?: "default" | "axis";
};

export type TimelinePointLabelOptions = {
  label?: string;
  step?: number;
  approximate?: boolean;
  yearFormatOptions?: TimelineYearFormatOptions;
};

export type TimelineRangeLabelOptions = {
  step?: number;
  approximateStart?: boolean;
  approximateEnd?: boolean;
};

export type TimelineElapsedLabel = {
  primaryText: string;
  secondaryText?: string;
};

export type TimelineElapsedReference = "ago" | "after-big-bang";
export type TimelineDateReference = "calendar" | "elapsed";

export type TimelineTicks = {
  major: number[];
  minor: number[];
  majorStep: number;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const AVERAGE_DAYS_PER_YEAR = 365.2425;
export const YEARS_AGO_CUTOFF = 15_000;
export const BCE_YEARS_AGO_HANDOFF_YEAR =
  getTimelineYearFromYearsAgo(YEARS_AGO_CUTOFF);
export const TIMELINE_DATE_REFERENCE_DOMINANCE_THRESHOLD = 0.85;
const ELAPSED_ZERO_EPSILON = 1e-18;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1_000;
const MICROSECONDS_PER_MILLISECOND = 1_000;
const YEARS_PER_DAY = 1 / AVERAGE_DAYS_PER_YEAR;
const YEARS_PER_HOUR = YEARS_PER_DAY / HOURS_PER_DAY;
const YEARS_PER_MINUTE = YEARS_PER_HOUR / MINUTES_PER_HOUR;
const YEARS_PER_SECOND = YEARS_PER_MINUTE / SECONDS_PER_MINUTE;
const YEARS_PER_MILLISECOND = YEARS_PER_SECOND / MILLISECONDS_PER_SECOND;
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

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

function pad3(value: number) {
  return value.toString().padStart(3, "0");
}

function getAstronomicalYearFromTimelineYear(year: number) {
  return year < 1 ? year + 1 : year;
}

function getTimelineYearFromAstronomicalYear(year: number) {
  return year <= 0 ? year - 1 : year;
}

function joinNaturalLanguage(parts: string[]) {
  if (parts.length <= 1) {
    return parts[0] ?? "";
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

type TimelineElapsedAxisLabel = {
  primaryText: string;
  secondaryText?: string;
};

type TimelineElapsedDuration = {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  microseconds: number;
};

type TimelineDateParts = {
  monthLabel: string;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  microsecond: number;
};

function resolvePreciseTimelineYear(
  year: number | PreciseTimelineYear,
): PreciseTimelineYear {
  return typeof year === "number" ? splitTimelineYear(year) : year;
}

function isElapsedTimelineDateReferenceYear(
  year: number | PreciseTimelineYear,
) {
  return (
    toApproximateTimelineYear(resolvePreciseTimelineYear(year)) <=
    BCE_YEARS_AGO_HANDOFF_YEAR
  );
}

export function getTimelineDateReference(
  year: number | PreciseTimelineYear,
): TimelineDateReference {
  return isElapsedTimelineDateReferenceYear(year) ? "elapsed" : "calendar";
}

export function getDominantTimelineDateReference(
  startYear: number | PreciseTimelineYear,
  endYear: number | PreciseTimelineYear,
  dominanceThreshold = TIMELINE_DATE_REFERENCE_DOMINANCE_THRESHOLD,
): TimelineDateReference | null {
  const orderedStart = Math.min(
    toApproximateTimelineYear(resolvePreciseTimelineYear(startYear)),
    toApproximateTimelineYear(resolvePreciseTimelineYear(endYear)),
  );
  const orderedEnd = Math.max(
    toApproximateTimelineYear(resolvePreciseTimelineYear(startYear)),
    toApproximateTimelineYear(resolvePreciseTimelineYear(endYear)),
  );
  const startReference = getTimelineDateReference(startYear);
  const endReference = getTimelineDateReference(endYear);

  if (startReference === endReference) {
    return startReference;
  }

  const totalSpan = Math.max(orderedEnd - orderedStart, 1e-18);
  const calendarStartYear = BCE_YEARS_AGO_HANDOFF_YEAR;
  const elapsedSpan = Math.max(
    0,
    Math.min(orderedEnd, calendarStartYear) - orderedStart,
  );
  const calendarSpan = Math.max(
    0,
    orderedEnd - Math.max(orderedStart, calendarStartYear),
  );

  if (elapsedSpan / totalSpan >= dominanceThreshold) {
    return "elapsed";
  }

  if (calendarSpan / totalSpan >= dominanceThreshold) {
    return "calendar";
  }

  return null;
}

function splitElapsedDuration(totalYears: number): TimelineElapsedDuration {
  let years = Math.max(0, Math.floor(totalYears + ELAPSED_ZERO_EPSILON));
  let remainingYears = Math.max(totalYears - years, 0);
  let daysFloat = remainingYears * AVERAGE_DAYS_PER_YEAR;
  let days = Math.max(0, Math.floor(daysFloat + ELAPSED_ZERO_EPSILON));
  let remainingDays = Math.max(daysFloat - days, 0);
  let hoursFloat = remainingDays * HOURS_PER_DAY;
  let hours = Math.max(0, Math.floor(hoursFloat + ELAPSED_ZERO_EPSILON));
  let remainingHours = Math.max(hoursFloat - hours, 0);
  let minutesFloat = remainingHours * MINUTES_PER_HOUR;
  let minutes = Math.max(0, Math.floor(minutesFloat + ELAPSED_ZERO_EPSILON));
  let remainingMinutes = Math.max(minutesFloat - minutes, 0);
  let secondsFloat = remainingMinutes * SECONDS_PER_MINUTE;
  let seconds = Math.max(0, Math.floor(secondsFloat + ELAPSED_ZERO_EPSILON));
  let remainingSeconds = Math.max(secondsFloat - seconds, 0);
  let millisecondsFloat = remainingSeconds * MILLISECONDS_PER_SECOND;
  let milliseconds = Math.max(
    0,
    Math.floor(millisecondsFloat + ELAPSED_ZERO_EPSILON),
  );
  let remainingMilliseconds = Math.max(millisecondsFloat - milliseconds, 0);
  let microseconds = Math.max(
    0,
    Math.round(remainingMilliseconds * MICROSECONDS_PER_MILLISECOND),
  );

  if (microseconds >= MICROSECONDS_PER_MILLISECOND) {
    milliseconds += 1;
    microseconds = 0;
  }

  if (milliseconds >= MILLISECONDS_PER_SECOND) {
    seconds += 1;
    milliseconds = 0;
  }

  if (seconds >= SECONDS_PER_MINUTE) {
    minutes += 1;
    seconds = 0;
  }

  if (minutes >= MINUTES_PER_HOUR) {
    hours += 1;
    minutes = 0;
  }

  if (hours >= HOURS_PER_DAY) {
    days += 1;
    hours = 0;
  }

  if (days >= Math.round(AVERAGE_DAYS_PER_YEAR)) {
    years += 1;
    days = 0;
  }

  return {
    years,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
  };
}

function splitElapsedFractionalYear(fractionalYears: number) {
  let remainingYears = Math.max(fractionalYears, 0);
  let daysFloat = remainingYears * AVERAGE_DAYS_PER_YEAR;
  let days = Math.max(0, Math.floor(daysFloat + ELAPSED_ZERO_EPSILON));
  let remainingDays = Math.max(daysFloat - days, 0);
  let hoursFloat = remainingDays * HOURS_PER_DAY;
  let hours = Math.max(0, Math.floor(hoursFloat + ELAPSED_ZERO_EPSILON));
  let remainingHours = Math.max(hoursFloat - hours, 0);
  let minutesFloat = remainingHours * MINUTES_PER_HOUR;
  let minutes = Math.max(0, Math.floor(minutesFloat + ELAPSED_ZERO_EPSILON));
  let remainingMinutes = Math.max(minutesFloat - minutes, 0);
  let secondsFloat = remainingMinutes * SECONDS_PER_MINUTE;
  let seconds = Math.max(0, Math.floor(secondsFloat + ELAPSED_ZERO_EPSILON));
  let remainingSeconds = Math.max(secondsFloat - seconds, 0);
  let millisecondsFloat = remainingSeconds * MILLISECONDS_PER_SECOND;
  let milliseconds = Math.max(
    0,
    Math.floor(millisecondsFloat + ELAPSED_ZERO_EPSILON),
  );
  let remainingMilliseconds = Math.max(millisecondsFloat - milliseconds, 0);
  let microseconds = Math.max(
    0,
    Math.round(remainingMilliseconds * MICROSECONDS_PER_MILLISECOND),
  );

  if (microseconds >= MICROSECONDS_PER_MILLISECOND) {
    milliseconds += 1;
    microseconds = 0;
  }

  if (milliseconds >= MILLISECONDS_PER_SECOND) {
    seconds += 1;
    milliseconds = 0;
  }

  if (seconds >= SECONDS_PER_MINUTE) {
    minutes += 1;
    seconds = 0;
  }

  if (minutes >= MINUTES_PER_HOUR) {
    hours += 1;
    minutes = 0;
  }

  if (hours >= HOURS_PER_DAY) {
    days += 1;
    hours = 0;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
  };
}

function getPreciseElapsedDuration(
  year: number | PreciseTimelineYear,
  reference: TimelineElapsedReference,
): TimelineElapsedDuration {
  const { wholeYears, fractionalYears } =
    reference === "after-big-bang"
      ? getPreciseTimelineYearDelta(year, TIMELINE_MIN_YEAR)
      : getPreciseTimelineYearDelta(TIMELINE_MAX_YEAR, year);

  if (wholeYears < 0) {
    return {
      years: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
      microseconds: 0,
    };
  }

  const subYear = splitElapsedFractionalYear(Math.max(fractionalYears, 0));

  return {
    years: wholeYears,
    days: subYear.days,
    hours: subYear.hours,
    minutes: subYear.minutes,
    seconds: subYear.seconds,
    milliseconds: subYear.milliseconds,
    microseconds: subYear.microseconds,
  };
}

function getElapsedAxisFinestUnitIndex(step: number) {
  if (step >= 1) return 0;
  if (step >= YEARS_PER_DAY) return 1;
  if (step >= YEARS_PER_HOUR) return 2;
  if (step >= YEARS_PER_MINUTE) return 3;
  if (step >= YEARS_PER_SECOND) return 4;
  if (step >= YEARS_PER_MILLISECOND) return 5;
  return 6;
}

function formatElapsedAxisDurationParts(duration: TimelineElapsedDuration) {
  return [
    duration.years > 0 ? `${numberFormatter.format(duration.years)}y` : null,
    duration.days > 0 ? `${numberFormatter.format(duration.days)}d` : null,
    duration.hours > 0 ? `${duration.hours}h` : null,
    duration.minutes > 0 ? `${duration.minutes}m` : null,
    duration.seconds > 0 ? `${duration.seconds}s` : null,
    duration.milliseconds > 0 ? `${duration.milliseconds}ms` : null,
    duration.microseconds > 0 ? `${duration.microseconds}µs` : null,
  ];
}

function formatPreciseElapsedAxisLabel(
  year: number | PreciseTimelineYear,
  step: number,
  reference: TimelineElapsedReference,
): TimelineElapsedAxisLabel {
  if (reference === "after-big-bang") {
    const preciseYear = resolvePreciseTimelineYear(year);
    const bigBangYear = splitTimelineYear(TIMELINE_MIN_YEAR);

    if (
      preciseYear.wholeYear === bigBangYear.wholeYear &&
      Math.abs(preciseYear.fraction - bigBangYear.fraction) <=
        ELAPSED_ZERO_EPSILON
    ) {
      return { primaryText: "Big Bang" };
    }
  }

  const suffix = reference === "after-big-bang" ? "after the Big Bang" : "ago";
  const duration = getPreciseElapsedDuration(year, reference);
  const parts = formatElapsedAxisDurationParts(duration);
  const finestRelevantIndex = getElapsedAxisFinestUnitIndex(step);
  const includedParts = parts
    .slice(0, finestRelevantIndex + 1)
    .filter((part): part is string => part !== null);

  if (includedParts.length === 0) {
    return {
      primaryText: `${step >= YEARS_PER_MILLISECOND ? "0ms" : "0µs"} ${suffix}`,
    };
  }

  const leadingParts =
    duration.years > 0 || duration.days > 0
      ? includedParts.slice(0, Math.min(2, includedParts.length))
      : [];
  const detailParts =
    leadingParts.length > 0
      ? includedParts.slice(leadingParts.length)
      : includedParts;

  if (leadingParts.length > 0) {
    return {
      primaryText: leadingParts.join(" "),
      secondaryText:
        detailParts.length > 0 ? `${detailParts.join(" ")} ${suffix}` : suffix,
    };
  }

  if (reference === "after-big-bang") {
    return {
      primaryText: detailParts.join(" "),
      secondaryText: suffix,
    };
  }

  if (detailParts.length <= 2) {
    return {
      primaryText: detailParts.join(" "),
      secondaryText: suffix,
    };
  }

  return {
    primaryText: detailParts.slice(0, 2).join(" "),
    secondaryText: `${detailParts.slice(2).join(" ")} ${suffix}`,
  };
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

export function getTimelineYearFromUtcDate(date: Date) {
  const wholeYear = date.getUTCFullYear();
  const start = getTimelineYearStart(wholeYear);
  const end = getTimelineYearStart(wholeYear + 1);
  const timelineYear = getTimelineYearFromAstronomicalYear(wholeYear);

  return timelineYear + (date.getTime() - start) / (end - start);
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

  if (step < YEARS_PER_DAY) {
    const duration = splitElapsedDuration(absolute);
    const parts = [
      duration.years > 0 ? `${numberFormatter.format(duration.years)}y` : null,
      duration.days > 0 ? `${numberFormatter.format(duration.days)}d` : null,
      duration.hours > 0 ? `${duration.hours}h` : null,
      duration.minutes > 0 ? `${duration.minutes}m` : null,
      duration.seconds > 0 ? `${duration.seconds}s` : null,
      duration.milliseconds > 0 ? `${duration.milliseconds}ms` : null,
      duration.microseconds > 0 ? `${duration.microseconds}µs` : null,
    ].filter((part): part is string => part !== null);

    const finestRelevantIndex =
      step >= YEARS_PER_HOUR
        ? 2
        : step >= YEARS_PER_MINUTE
          ? 3
          : step >= YEARS_PER_SECOND
            ? 4
            : step >= YEARS_PER_MILLISECOND
              ? 5
              : 6;
    const trimmedParts = parts.filter(
      (_, index) => index <= finestRelevantIndex,
    );

    return `${trimmedParts.length > 0 ? trimmedParts.join(" ") : step >= YEARS_PER_MILLISECOND ? "0ms" : "0µs"} ${suffix}`;
  }

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

  // When the elapsed time is very small (sub-year), format using detailed
  // time units instead of rounding to "0 years".
  if (absolute < 1) {
    const duration = splitElapsedDuration(absolute);
    const parts = formatElapsedAxisDurationParts(duration);
    const nonNullParts = parts.filter((part): part is string => part !== null);

    if (nonNullParts.length > 0) {
      return `${nonNullParts.slice(0, 2).join(" ")} ${suffix}`;
    }

    return `0µs ${suffix}`;
  }

  return `${numberFormatter.format(Math.round(absolute))} years ${suffix}`;
}

function formatAxisYearsAgo(absolute: number, step: number) {
  return formatAxisElapsedYears(absolute, step, "ago");
}

export function formatTimelineElapsedAxisLabel(
  year: number | PreciseTimelineYear,
  step: number,
  reference: TimelineElapsedReference,
) {
  if (step >= 1) {
    const elapsedYears =
      reference === "after-big-bang"
        ? getYearsAfterBigBang(year)
        : getYearsAgoFromPresent(year);

    return formatAxisElapsedYears(Math.max(0, elapsedYears), step, reference);
  }

  const label = formatPreciseElapsedAxisLabel(year, step, reference);

  return label.secondaryText
    ? `${label.primaryText} ${label.secondaryText}`
    : label.primaryText;
}

export function formatTimelineElapsedAxisLabelLines(
  year: number | PreciseTimelineYear,
  step: number,
  reference: TimelineElapsedReference,
) {
  if (step >= 1) {
    return {
      primaryText: formatTimelineElapsedAxisLabel(year, step, reference),
    };
  }

  return formatPreciseElapsedAxisLabel(year, step, reference);
}

export function formatTimelineElapsedLabel(
  year: number,
  reference: TimelineElapsedReference = "ago",
): TimelineElapsedLabel | null {
  if (reference === "ago" && getTimelineDateReference(year) !== "elapsed") {
    return null;
  }

  const isAfterBigBang = reference === "after-big-bang";
  const totalYears = isAfterBigBang
    ? getYearsAfterBigBang(year)
    : getYearsAgoFromPresent(year);
  const duration = splitElapsedDuration(totalYears);
  const parts = [
    duration.years > 0 ? formatUnitCount(duration.years, "year") : null,
    duration.days > 0 ? formatUnitCount(duration.days, "day") : null,
    duration.hours > 0 ? formatUnitCount(duration.hours, "hour") : null,
    duration.minutes > 0 ? formatUnitCount(duration.minutes, "minute") : null,
    duration.seconds > 0 ? formatUnitCount(duration.seconds, "second") : null,
    duration.milliseconds > 0
      ? formatUnitCount(duration.milliseconds, "millisecond")
      : null,
    duration.microseconds > 0
      ? formatUnitCount(duration.microseconds, "microsecond")
      : null,
  ].filter((part): part is string => part !== null);

  if (isAfterBigBang && parts.length === 0) {
    return { primaryText: "Big Bang" };
  }

  if (parts.length <= 2) {
    const label = joinNaturalLanguage(
      parts.length > 0 ? parts : ["0 microseconds"],
    );

    return {
      primaryText: isAfterBigBang
        ? `${label} after the Big Bang`
        : `${label} ago`,
    };
  }

  const primaryParts = parts.slice(0, 2);
  const secondaryParts = parts.slice(2);

  return {
    primaryText: joinNaturalLanguage(primaryParts),
    secondaryText: isAfterBigBang
      ? `${joinNaturalLanguage(secondaryParts)} after the Big Bang`
      : `${joinNaturalLanguage(secondaryParts)} ago`,
  };
}

function getTimelineDatePartsFromYear(
  year: number | PreciseTimelineYear,
): TimelineDateParts {
  const preciseYear = resolvePreciseTimelineYear(year);
  const astronomicalYear = getAstronomicalYearFromTimelineYear(
    preciseYear.wholeYear,
  );
  const start = getTimelineYearStart(astronomicalYear);
  const end = getTimelineYearStart(astronomicalYear + 1);
  const absoluteMilliseconds = start + preciseYear.fraction * (end - start);
  let wholeMilliseconds = Math.floor(absoluteMilliseconds);
  let microsecond = Math.round(
    (absoluteMilliseconds - wholeMilliseconds) * MICROSECONDS_PER_MILLISECOND,
  );

  if (microsecond >= MICROSECONDS_PER_MILLISECOND) {
    wholeMilliseconds += 1;
    microsecond = 0;
  }

  const date = new Date(wholeMilliseconds);

  return {
    monthLabel: MONTH_LABELS[date.getUTCMonth()],
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds(),
    microsecond,
  };
}

export function formatTimelineDateLabel(
  year: number | PreciseTimelineYear,
  step = 1,
) {
  const safeStep = Math.max(Math.abs(step), 1e-18);

  if (safeStep >= 1) {
    return formatTimelineYear(year, step);
  }

  const dateParts = getTimelineDatePartsFromYear(year);

  if (safeStep >= 1 / 12) {
    return dateParts.monthLabel;
  }

  if (safeStep >= YEARS_PER_DAY) {
    return `${dateParts.monthLabel} ${dateParts.day}`;
  }

  const baseTime = `${pad2(dateParts.hour)}:${pad2(dateParts.minute)}`;

  if (safeStep >= YEARS_PER_MINUTE) {
    return baseTime;
  }

  const secondsLabel = `${baseTime}:${pad2(dateParts.second)}`;

  if (safeStep >= YEARS_PER_SECOND) {
    return secondsLabel;
  }

  const millisecondsLabel = `${secondsLabel}.${pad3(dateParts.millisecond)}`;

  if (safeStep >= YEARS_PER_MILLISECOND) {
    return millisecondsLabel;
  }

  return `${millisecondsLabel}${pad3(dateParts.microsecond)}`;
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
  year: number | PreciseTimelineYear,
  step = 1,
  options: TimelineYearFormatOptions = {},
) {
  const preciseYear = resolvePreciseTimelineYear(year);
  const approximateYear = toApproximateTimelineYear(preciseYear);
  const yearsAgo = getYearsAgoFromPresent(preciseYear);
  const safeStep = Math.max(Math.abs(step), 1e-18);
  const containingYear = preciseYear.wholeYear;

  if (getTimelineDateReference(preciseYear) === "elapsed") {
    return options.mode === "axis"
      ? formatAxisYearsAgo(yearsAgo, safeStep)
      : formatDefaultYearsAgo(yearsAgo, safeStep);
  }

  if (approximateYear < 1) {
    return `${numberFormatter.format(
      Math.abs(containingYear === 0 ? -1 : containingYear),
    )} BCE`;
  }

  return `${numberFormatter.format(Math.max(1, containingYear))} CE`;
}

export function formatApproximateLabel(label: string, approximate = false) {
  if (!approximate) {
    return label;
  }

  return label.trimStart().startsWith("~") ? label : `~${label}`;
}

export function formatTimelinePointLabel(
  year: number,
  options: TimelinePointLabelOptions = {},
) {
  const baseLabel =
    options.label ??
    formatTimelineYear(year, options.step ?? 1, options.yearFormatOptions);

  return formatApproximateLabel(baseLabel, options.approximate);
}

export function formatTimelineRange(
  startYear: number,
  endYear: number,
  options: TimelineRangeLabelOptions = {},
) {
  const startLabel = formatTimelinePointLabel(startYear, {
    step: options.step,
    approximate: options.approximateStart,
  });
  const endLabel = formatTimelinePointLabel(endYear, {
    step: options.step,
    approximate: options.approximateEnd,
  });

  return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`;
}
