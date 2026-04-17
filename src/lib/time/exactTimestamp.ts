import {
  getTimelineYearFromAstronomicalYearValue,
  getTimelineYearFromYearsAfterBigBang,
  getTimelineYearFromYearsAgo,
} from "./timelineYears";

export type TimelineElapsedReference = "ago" | "after-big-bang";
export type TimelineTimestampPrecision =
  | "year"
  | "month"
  | "day"
  | "hour"
  | "minute"
  | "second"
  | "millisecond"
  | "microsecond";
export type TimelineCalendarEra = "ce" | "bce";

export type TimelineCalendarTimestamp = {
  kind: "calendar";
  era: TimelineCalendarEra;
  year: number;
  precision: TimelineTimestampPrecision;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
  microsecond?: number;
};

export type TimelineElapsedTimestamp = {
  kind: "elapsed";
  reference: TimelineElapsedReference;
  precision: TimelineTimestampPrecision;
  years?: bigint;
  days?: bigint;
  hours?: bigint;
  minutes?: bigint;
  seconds?: bigint;
  milliseconds?: bigint;
  microseconds?: bigint;
};

export type TimelineExactTimestamp =
  | TimelineCalendarTimestamp
  | TimelineElapsedTimestamp;

export type TimelineExactTimestampFormatOptions = {
  style?: "full" | "compact";
};

const numberFormatter = new Intl.NumberFormat("en-US");
const AVERAGE_DAYS_PER_YEAR = 365.2425;
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
const PRECISION_ORDER: readonly TimelineTimestampPrecision[] = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond",
  "microsecond",
] as const;
const MICROSECONDS_PER_MILLISECOND = 1_000n;
const MILLISECONDS_PER_SECOND = 1_000n;
const SECONDS_PER_MINUTE = 60n;
const MINUTES_PER_HOUR = 60n;
const HOURS_PER_DAY = 24n;

function getPrecisionRank(precision: TimelineTimestampPrecision) {
  return PRECISION_ORDER.indexOf(precision);
}

function hasPrecision(
  precision: TimelineTimestampPrecision,
  minimum: TimelineTimestampPrecision,
) {
  return getPrecisionRank(precision) >= getPrecisionRank(minimum);
}

function assertIntegerInRange(
  value: number,
  minimum: number,
  maximum: number,
  label: string,
) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${label} must be an integer between ${minimum} and ${maximum}.`);
  }
}

function assertNonNegativeBigInt(value: bigint, label: string) {
  if (value < 0n) {
    throw new Error(`${label} must be non-negative.`);
  }
}

function pad2(value: number) {
  return value.toString().padStart(2, "0");
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

function formatUnitCount(
  value: bigint,
  singular: string,
  plural = `${singular}s`,
) {
  return `${numberFormatter.format(value)} ${value === 1n ? singular : plural}`;
}

function formatCompactUnit(value: bigint, suffix: string) {
  return `${numberFormatter.format(value)}${suffix}`;
}

function getAstronomicalYear(era: TimelineCalendarEra, year: number) {
  assertIntegerInRange(year, 1, Number.MAX_SAFE_INTEGER, "Calendar year");

  return era === "ce" ? year : 1 - year;
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

function normalizeCalendarTimestamp(
  timestamp: TimelineCalendarTimestamp,
): Required<Omit<TimelineCalendarTimestamp, "kind" | "era" | "year" | "precision">> &
  Pick<TimelineCalendarTimestamp, "era" | "year" | "precision"> {
  const { precision } = timestamp;

  if (getPrecisionRank(precision) === -1) {
    throw new Error(`Unsupported calendar precision: ${precision}`);
  }

  const month = timestamp.month ?? 1;
  const day = timestamp.day ?? 1;
  const hour = timestamp.hour ?? 0;
  const minute = timestamp.minute ?? 0;
  const second = timestamp.second ?? 0;
  const millisecond = timestamp.millisecond ?? 0;
  const microsecond = timestamp.microsecond ?? 0;

  if (hasPrecision(precision, "month") && timestamp.month === undefined) {
    throw new Error("Calendar timestamps at month precision or finer must include a month.");
  }

  if (hasPrecision(precision, "day") && timestamp.day === undefined) {
    throw new Error("Calendar timestamps at day precision or finer must include a day.");
  }

  assertIntegerInRange(month, 1, 12, "Month");
  assertIntegerInRange(day, 1, 31, "Day");
  assertIntegerInRange(hour, 0, 23, "Hour");
  assertIntegerInRange(minute, 0, 59, "Minute");
  assertIntegerInRange(second, 0, 59, "Second");
  assertIntegerInRange(millisecond, 0, 999, "Millisecond");
  assertIntegerInRange(microsecond, 0, 999, "Microsecond");

  return {
    era: timestamp.era,
    year: timestamp.year,
    precision,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
    microsecond,
  };
}

function normalizeElapsedTimestamp(timestamp: TimelineElapsedTimestamp) {
  if (getPrecisionRank(timestamp.precision) === -1) {
    throw new Error(`Unsupported elapsed precision: ${timestamp.precision}`);
  }

  const years = timestamp.years ?? 0n;
  let days = timestamp.days ?? 0n;
  let hours = timestamp.hours ?? 0n;
  let minutes = timestamp.minutes ?? 0n;
  let seconds = timestamp.seconds ?? 0n;
  let milliseconds = timestamp.milliseconds ?? 0n;
  let microseconds = timestamp.microseconds ?? 0n;

  assertNonNegativeBigInt(years, "Elapsed years");
  assertNonNegativeBigInt(days, "Elapsed days");
  assertNonNegativeBigInt(hours, "Elapsed hours");
  assertNonNegativeBigInt(minutes, "Elapsed minutes");
  assertNonNegativeBigInt(seconds, "Elapsed seconds");
  assertNonNegativeBigInt(milliseconds, "Elapsed milliseconds");
  assertNonNegativeBigInt(microseconds, "Elapsed microseconds");

  milliseconds += microseconds / MICROSECONDS_PER_MILLISECOND;
  microseconds %= MICROSECONDS_PER_MILLISECOND;

  seconds += milliseconds / MILLISECONDS_PER_SECOND;
  milliseconds %= MILLISECONDS_PER_SECOND;

  minutes += seconds / SECONDS_PER_MINUTE;
  seconds %= SECONDS_PER_MINUTE;

  hours += minutes / MINUTES_PER_HOUR;
  minutes %= MINUTES_PER_HOUR;

  days += hours / HOURS_PER_DAY;
  hours %= HOURS_PER_DAY;

  return {
    reference: timestamp.reference,
    precision: timestamp.precision,
    years,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
  };
}

function formatCalendarTime(
  timestamp: ReturnType<typeof normalizeCalendarTimestamp>,
) {
  if (!hasPrecision(timestamp.precision, "hour")) {
    return null;
  }

  const hh = pad2(timestamp.hour);
  const mm = pad2(timestamp.minute);

  if (!hasPrecision(timestamp.precision, "second")) {
    return `${hh}:${mm} UTC`;
  }

  const ss = pad2(timestamp.second);

  if (!hasPrecision(timestamp.precision, "millisecond")) {
    return `${hh}:${mm}:${ss} UTC`;
  }

  const millisecond = timestamp.millisecond.toString().padStart(3, "0");

  if (!hasPrecision(timestamp.precision, "microsecond")) {
    return `${hh}:${mm}:${ss}.${millisecond} UTC`;
  }

  const microsecond = timestamp.microsecond.toString().padStart(3, "0");

  return `${hh}:${mm}:${ss}.${millisecond}${microsecond} UTC`;
}

function formatCalendarDate(
  timestamp: ReturnType<typeof normalizeCalendarTimestamp>,
) {
  const monthLabel = MONTH_LABELS[timestamp.month - 1];
  const yearLabel = timestamp.year.toString();
  const eraSuffix = timestamp.era === "bce" ? " BCE" : "";

  if (!hasPrecision(timestamp.precision, "month")) {
    return `${yearLabel}${timestamp.era === "ce" ? " CE" : " BCE"}`;
  }

  if (!hasPrecision(timestamp.precision, "day")) {
    return `${monthLabel} ${yearLabel}${eraSuffix}`;
  }

  return `${monthLabel} ${timestamp.day}, ${yearLabel}${eraSuffix}`;
}

function formatElapsedParts(
  timestamp: ReturnType<typeof normalizeElapsedTimestamp>,
  style: "full" | "compact",
) {
  const parts = [
    style === "full"
      ? timestamp.years > 0n
        ? formatUnitCount(timestamp.years, "year")
        : null
      : timestamp.years > 0n
        ? formatCompactUnit(timestamp.years, "y")
        : null,
    style === "full"
      ? timestamp.days > 0n
        ? formatUnitCount(timestamp.days, "day")
        : null
      : timestamp.days > 0n
        ? formatCompactUnit(timestamp.days, "d")
        : null,
    style === "full"
      ? timestamp.hours > 0n
        ? formatUnitCount(timestamp.hours, "hour")
        : null
      : timestamp.hours > 0n
        ? formatCompactUnit(timestamp.hours, "h")
        : null,
    style === "full"
      ? timestamp.minutes > 0n
        ? formatUnitCount(timestamp.minutes, "minute")
        : null
      : timestamp.minutes > 0n
        ? formatCompactUnit(timestamp.minutes, "m")
        : null,
    style === "full"
      ? timestamp.seconds > 0n
        ? formatUnitCount(timestamp.seconds, "second")
        : null
      : timestamp.seconds > 0n
        ? formatCompactUnit(timestamp.seconds, "s")
        : null,
    style === "full"
      ? timestamp.milliseconds > 0n
        ? formatUnitCount(timestamp.milliseconds, "millisecond")
        : null
      : timestamp.milliseconds > 0n
        ? formatCompactUnit(timestamp.milliseconds, "ms")
        : null,
    style === "full"
      ? timestamp.microseconds > 0n
        ? formatUnitCount(timestamp.microseconds, "microsecond")
        : null
      : timestamp.microseconds > 0n
        ? formatCompactUnit(timestamp.microseconds, "µs")
        : null,
  ].filter((part): part is string => part !== null);

  if (parts.length > 0) {
    return style === "full" ? joinNaturalLanguage(parts) : parts.join(" ");
  }

  if (timestamp.reference === "after-big-bang") {
    return "Big Bang";
  }

  return style === "full" ? "0 microseconds" : "0µs";
}

export function createExactCalendarTimestamp(
  timestamp: Omit<TimelineCalendarTimestamp, "kind">,
): TimelineCalendarTimestamp {
  normalizeCalendarTimestamp({ ...timestamp, kind: "calendar" });

  return { ...timestamp, kind: "calendar" };
}

export function createExactElapsedTimestamp(
  timestamp: Omit<TimelineElapsedTimestamp, "kind">,
): TimelineElapsedTimestamp {
  normalizeElapsedTimestamp({ ...timestamp, kind: "elapsed" });

  return { ...timestamp, kind: "elapsed" };
}

export function getTimelineYearFromCalendarTimestamp(
  timestamp: TimelineCalendarTimestamp,
) {
  const normalized = normalizeCalendarTimestamp(timestamp);
  const astronomicalYear = getAstronomicalYear(normalized.era, normalized.year);
  const timelineYear = getTimelineYearFromAstronomicalYearValue(
    astronomicalYear,
  );
  const start = getTimelineYearStart(astronomicalYear);
  const end = getTimelineYearStart(astronomicalYear + 1);
  const date = createTimelineUtcDate(
    astronomicalYear,
    normalized.month - 1,
    normalized.day,
    normalized.hour,
    normalized.minute,
    normalized.second,
    normalized.millisecond,
  );
  const yearDurationMs = end - start;
  const elapsedMs = date.getTime() - start + normalized.microsecond / 1_000;

  return timelineYear + elapsedMs / yearDurationMs;
}

export function getTimelineYearFromElapsedTimestamp(
  timestamp: TimelineElapsedTimestamp,
) {
  const normalized = normalizeElapsedTimestamp(timestamp);
  const totalYears =
    Number(normalized.years) +
    Number(normalized.days) / AVERAGE_DAYS_PER_YEAR +
    Number(normalized.hours) / 24 / AVERAGE_DAYS_PER_YEAR +
    Number(normalized.minutes) / 60 / 24 / AVERAGE_DAYS_PER_YEAR +
    Number(normalized.seconds) / 60 / 60 / 24 / AVERAGE_DAYS_PER_YEAR +
    Number(normalized.milliseconds) /
      1_000 /
      60 /
      60 /
      24 /
      AVERAGE_DAYS_PER_YEAR +
    Number(normalized.microseconds) /
      1_000_000 /
      60 /
      60 /
      24 /
      AVERAGE_DAYS_PER_YEAR;

  return normalized.reference === "after-big-bang"
    ? getTimelineYearFromYearsAfterBigBang(totalYears)
    : getTimelineYearFromYearsAgo(totalYears);
}

export function getTimelineYearFromExactTimestamp(
  timestamp: TimelineExactTimestamp,
) {
  return timestamp.kind === "calendar"
    ? getTimelineYearFromCalendarTimestamp(timestamp)
    : getTimelineYearFromElapsedTimestamp(timestamp);
}

export function formatTimelineExactTimestamp(
  timestamp: TimelineExactTimestamp,
  options: TimelineExactTimestampFormatOptions = {},
) {
  const style = options.style ?? "full";

  if (timestamp.kind === "calendar") {
    const normalized = normalizeCalendarTimestamp(timestamp);
    const dateLabel = formatCalendarDate(normalized);
    const timeLabel = formatCalendarTime(normalized);

    if (!timeLabel) {
      return dateLabel;
    }

    return style === "compact"
      ? `${dateLabel} · ${timeLabel}`
      : `${dateLabel}, ${timeLabel}`;
  }

  const normalized = normalizeElapsedTimestamp(timestamp);
  const label = formatElapsedParts(normalized, style);

  if (label === "Big Bang") {
    return label;
  }

  return normalized.reference === "after-big-bang"
    ? `${label} after the Big Bang`
    : `${label} ago`;
}

export function formatTimelineExactRange(
  start: TimelineExactTimestamp,
  end: TimelineExactTimestamp,
  options: TimelineExactTimestampFormatOptions = {},
) {
  const startLabel = formatTimelineExactTimestamp(start, options);
  const endLabel = formatTimelineExactTimestamp(end, options);

  return startLabel === endLabel ? startLabel : `${startLabel} — ${endLabel}`;
}
