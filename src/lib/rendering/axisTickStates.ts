import {
  getDominantTimelineDateReference,
  type TimelineElapsedReference,
} from "./bands";
import {
  getLogarithmicScreenDeltaFromYearsDelta,
  resolveLogarithmicAxisGeometry,
  getLogarithmicAxisRangeFactor,
} from "../core/logarithmicAxis";
import {
  getYearsAfterBigBang,
  getYearsAgoFromPresent,
  getTimelineYearFromYearsAfterBigBang,
  getTimelineYearFromYearsAgo,
} from "../core/timelineYears";
import {
  addPreciseTimelineYears,
  comparePreciseTimelineYears,
  normalizePreciseTimelineYear,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  type TimelineScaleMode,
  type PreciseTimelineYear,
} from "../core/viewport";

export type AxisTickRenderState = {
  year: number;
  wholeYear?: number;
  yearFraction?: number;
  step: number;
  pixelsPerStep: number;
  visibleProgress: number;
  majorProgress: number;
  labelOpacity: number;
  labelStep: number;
};

type AxisStepDefinition =
  | {
      kind: "numeric";
      step: number;
    }
  | {
      kind: "elapsed";
      step: number;
      reference: TimelineElapsedReference;
    }
  | {
      kind: "calendar";
      unit: "month" | "day" | "hour" | "minute" | "second" | "millisecond" | "microsecond";
      count: number;
      step: number;
    }
  | {
      kind: "elapsed-day";
      count: number;
      step: number;
    };

export type ResolveAxisTickOptions = {
  elapsedReference?: TimelineElapsedReference;
  elapsedSubYearReference?: TimelineElapsedReference;
  preciseStartYear?: PreciseTimelineYear;
  preciseEndYear?: PreciseTimelineYear;
};

type ExplicitTick = {
  year: number;
  preciseYear?: PreciseTimelineYear;
};

// Decimal grids share every tenth tick, so subdivisions never compete.
const NICE_STEP_FACTORS = [1] as const;
const TARGET_MAJOR_SPACING_PX = 280;
const TICK_REVEAL_START_PX = 4.5;
const TICK_FULL_VISIBILITY_PX = 14;
const TICK_MIN_CLEARANCE_PX = 4;
const TICK_FULL_CLEARANCE_PX = 8;
const TICK_FADE_END_PX = 8_000;
const CANDIDATE_MIN_SPACING_PX = TICK_REVEAL_START_PX;
const CANDIDATE_MAX_SPACING_PX = TICK_FADE_END_PX;
const STEP_SEARCH_RADIUS = 5;
const LABEL_MIN_SPACING_PX = 96;
const LABEL_FULL_SPACING_PX = 176;
const MAX_TICKS_PER_STEP = 10_000;
const EPSILON = 1e-18;
const DAY_IN_MS = 86_400_000;
const AVERAGE_DAYS_PER_YEAR = 365.2425;
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
const YEARS_PER_MICROSECOND = YEARS_PER_MILLISECOND / MICROSECONDS_PER_MILLISECOND;
const CALENDAR_STEP_DEFINITIONS: readonly AxisStepDefinition[] = [
  { kind: "calendar", unit: "month", count: 6, step: 0.5 },
  { kind: "calendar", unit: "month", count: 3, step: 0.25 },
  { kind: "calendar", unit: "month", count: 1, step: 1 / 12 },
  { kind: "calendar", unit: "day", count: 14, step: 14 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 7, step: 7 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 2, step: 2 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 1, step: YEARS_PER_DAY },
  { kind: "calendar", unit: "hour", count: 12, step: 12 * YEARS_PER_HOUR },
  { kind: "calendar", unit: "hour", count: 6, step: 6 * YEARS_PER_HOUR },
  { kind: "calendar", unit: "hour", count: 3, step: 3 * YEARS_PER_HOUR },
  { kind: "calendar", unit: "hour", count: 1, step: YEARS_PER_HOUR },
  {
    kind: "calendar",
    unit: "minute",
    count: 30,
    step: 30 * YEARS_PER_MINUTE,
  },
  {
    kind: "calendar",
    unit: "minute",
    count: 15,
    step: 15 * YEARS_PER_MINUTE,
  },
  {
    kind: "calendar",
    unit: "minute",
    count: 5,
    step: 5 * YEARS_PER_MINUTE,
  },
  { kind: "calendar", unit: "minute", count: 1, step: YEARS_PER_MINUTE },
  { kind: "calendar", unit: "second", count: 30, step: 30 * YEARS_PER_SECOND },
  { kind: "calendar", unit: "second", count: 15, step: 15 * YEARS_PER_SECOND },
  { kind: "calendar", unit: "second", count: 10, step: 10 * YEARS_PER_SECOND },
  { kind: "calendar", unit: "second", count: 5, step: 5 * YEARS_PER_SECOND },
  { kind: "calendar", unit: "second", count: 1, step: YEARS_PER_SECOND },
  { kind: "calendar", unit: "millisecond", count: 500, step: 500 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 200, step: 200 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 100, step: 100 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 50, step: 50 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 20, step: 20 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 10, step: 10 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 5, step: 5 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 2, step: 2 * YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "millisecond", count: 1, step: YEARS_PER_MILLISECOND },
  { kind: "calendar", unit: "microsecond", count: 500, step: 500 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 200, step: 200 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 100, step: 100 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 50, step: 50 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 20, step: 20 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 10, step: 10 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 5, step: 5 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 2, step: 2 * YEARS_PER_MICROSECOND },
  { kind: "calendar", unit: "microsecond", count: 1, step: YEARS_PER_MICROSECOND },
] as const;
const ELAPSED_DAY_STEP_DEFINITIONS: readonly AxisStepDefinition[] = [
  { kind: "elapsed-day", count: 180, step: 180 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 90, step: 90 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 60, step: 60 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 30, step: 30 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 14, step: 14 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 7, step: 7 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 2, step: 2 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 1, step: YEARS_PER_DAY },
  { kind: "elapsed-day", count: 0.5, step: 12 * YEARS_PER_HOUR },
  { kind: "elapsed-day", count: 0.25, step: 6 * YEARS_PER_HOUR },
  { kind: "elapsed-day", count: 3 / 24, step: 3 * YEARS_PER_HOUR },
  { kind: "elapsed-day", count: 1 / 24, step: YEARS_PER_HOUR },
  { kind: "elapsed-day", count: 30 / 1440, step: 30 * YEARS_PER_MINUTE },
  { kind: "elapsed-day", count: 15 / 1440, step: 15 * YEARS_PER_MINUTE },
  { kind: "elapsed-day", count: 5 / 1440, step: 5 * YEARS_PER_MINUTE },
  { kind: "elapsed-day", count: 1 / 1440, step: YEARS_PER_MINUTE },
  { kind: "elapsed-day", count: 30 / 86400, step: 30 * YEARS_PER_SECOND },
  { kind: "elapsed-day", count: 15 / 86400, step: 15 * YEARS_PER_SECOND },
  { kind: "elapsed-day", count: 10 / 86400, step: 10 * YEARS_PER_SECOND },
  { kind: "elapsed-day", count: 5 / 86400, step: 5 * YEARS_PER_SECOND },
  { kind: "elapsed-day", count: 1 / 86400, step: YEARS_PER_SECOND },
  { kind: "elapsed-day", count: 500e-3 / 86400, step: 500 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 200e-3 / 86400, step: 200 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 100e-3 / 86400, step: 100 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 50e-3 / 86400, step: 50 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 20e-3 / 86400, step: 20 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 10e-3 / 86400, step: 10 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 5e-3 / 86400, step: 5 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 2e-3 / 86400, step: 2 * YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 1e-3 / 86400, step: YEARS_PER_MILLISECOND },
  { kind: "elapsed-day", count: 500e-6 / 86400, step: 500 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 200e-6 / 86400, step: 200 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 100e-6 / 86400, step: 100 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 50e-6 / 86400, step: 50 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 20e-6 / 86400, step: 20 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 10e-6 / 86400, step: 10 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 5e-6 / 86400, step: 5 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 2e-6 / 86400, step: 2 * YEARS_PER_MICROSECOND },
  { kind: "elapsed-day", count: 1e-6 / 86400, step: YEARS_PER_MICROSECOND },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const clamped = clamp01(value);

  return clamped * clamped * (3 - 2 * clamped);
}

function getStepDecimals(step: number) {
  if (!Number.isFinite(step) || step <= 0 || step >= 1) {
    return 0;
  }

  return Math.min(18, Math.ceil(-Math.log10(step)) + 4);
}

function getAstronomicalYearFromTimelineYear(year: number) {
  return year < 1 ? year + 1 : year;
}

function getTimelineYearFromAstronomicalYear(year: number) {
  return year <= 0 ? year - 1 : year;
}

function roundToStepPrecision(value: number, step: number) {
  const decimals = getStepDecimals(step);

  return Number(value.toFixed(decimals));
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
  const astronomicalYear = getAstronomicalYearFromTimelineYear(wholeYear);
  const start = getTimelineYearStart(astronomicalYear);
  const end = getTimelineYearStart(astronomicalYear + 1);

  return new Date(start + fraction * (end - start));
}

function getPreciseTimelineYearFromDate(date: Date): PreciseTimelineYear {
  const astronomicalYear = date.getUTCFullYear();
  const start = getTimelineYearStart(astronomicalYear);
  const end = getTimelineYearStart(astronomicalYear + 1);

  return normalizePreciseTimelineYear(
    getTimelineYearFromAstronomicalYear(astronomicalYear),
    (date.getTime() - start) / (end - start),
  );
}

function getCalendarTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: Extract<AxisStepDefinition, { kind: "calendar" }>,
  preciseStartYear?: PreciseTimelineYear,
  preciseEndYear?: PreciseTimelineYear,
): ExplicitTick[] {
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart) {
    return [];
  }

  const startDate = getTimelineDateFromYear(clampedStart);
  const endDate = getTimelineDateFromYear(clampedEnd);
  const ticks: ExplicitTick[] = [];

  if (stepDefinition.unit === "month") {
    const startMonthIndex =
      startDate.getUTCFullYear() * 12 + startDate.getUTCMonth();
    const firstMonthIndex =
      Math.ceil(startMonthIndex / stepDefinition.count) * stepDefinition.count;
    const firstYear = Math.floor(firstMonthIndex / 12);
    const firstMonth = firstMonthIndex % 12;
    const current = createTimelineUtcDate(firstYear, firstMonth, 1);

    while (current.getTime() <= endDate.getTime() + DAY_IN_MS * 0.5) {
      const preciseYear = getPreciseTimelineYearFromDate(current);
      const tickYear = toApproximateTimelineYear(preciseYear);

      if (
        tickYear >= clampedStart - EPSILON &&
        tickYear <= clampedEnd + EPSILON
      ) {
        ticks.push({ year: tickYear, preciseYear });
      }

      current.setUTCMonth(current.getUTCMonth() + stepDefinition.count, 1);
      current.setUTCHours(0, 0, 0, 0);
    }

    return ticks;
  }

  if (stepDefinition.unit === "microsecond") {
    const precStart =
      preciseStartYear && preciseEndYear
        ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
          ? preciseStartYear
          : preciseEndYear
        : splitTimelineYear(clampedStart);
    const precEnd =
      preciseStartYear && preciseEndYear
        ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
          ? preciseEndYear
          : preciseStartYear
        : splitTimelineYear(clampedEnd);
    for (let year = precStart.wholeYear; year <= precEnd.wholeYear; year++) {
      const astronomicalYear = getAstronomicalYearFromTimelineYear(year);
      const yearMilliseconds = getTimelineYearStart(astronomicalYear + 1) - getTimelineYearStart(astronomicalYear);
      const unitStep = stepDefinition.count / (yearMilliseconds * 1000);
      const anchor = normalizePreciseTimelineYear(year, 0);
      const startOffset = Math.max(0, subtractPreciseTimelineYears(precStart, anchor));
      const endOffset = Math.min(1, subtractPreciseTimelineYears(precEnd, anchor));
      const firstIndex = Math.ceil(startOffset / unitStep - 1e-6);
      const count = Math.min(Math.ceil((endOffset - startOffset) / unitStep) + 2, MAX_TICKS_PER_STEP);
      for (let i = 0; i < count; i++) {
        const offset = (firstIndex + i) * unitStep;
        if (offset > endOffset + EPSILON) break;
        const preciseYear = addPreciseTimelineYears(anchor, offset);
        ticks.push({ year: toApproximateTimelineYear(preciseYear), preciseYear });
      }
    }

    return ticks;
  }

  const epoch = createTimelineUtcDate(1970, 0, 1);
  const unitMilliseconds =
    stepDefinition.unit === "day"
      ? DAY_IN_MS
      : stepDefinition.unit === "hour"
        ? DAY_IN_MS / HOURS_PER_DAY
        : stepDefinition.unit === "minute"
          ? DAY_IN_MS / HOURS_PER_DAY / MINUTES_PER_HOUR
          : stepDefinition.unit === "second"
            ? MILLISECONDS_PER_SECOND
            : 1;
  const startOfUnit =
    stepDefinition.unit === "day"
      ? createTimelineUtcDate(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate(),
        )
      : stepDefinition.unit === "hour"
        ? createTimelineUtcDate(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
            startDate.getUTCHours(),
          )
        : stepDefinition.unit === "minute"
          ? createTimelineUtcDate(
              startDate.getUTCFullYear(),
              startDate.getUTCMonth(),
              startDate.getUTCDate(),
              startDate.getUTCHours(),
              startDate.getUTCMinutes(),
            )
          : stepDefinition.unit === "second"
            ? createTimelineUtcDate(
                startDate.getUTCFullYear(),
                startDate.getUTCMonth(),
                startDate.getUTCDate(),
                startDate.getUTCHours(),
                startDate.getUTCMinutes(),
                startDate.getUTCSeconds(),
              )
            : createTimelineUtcDate(
                startDate.getUTCFullYear(),
                startDate.getUTCMonth(),
                startDate.getUTCDate(),
                startDate.getUTCHours(),
                startDate.getUTCMinutes(),
                startDate.getUTCSeconds(),
                startDate.getUTCMilliseconds(),
              );
  const startUnitOffset = Math.floor(
    (startOfUnit.getTime() - epoch.getTime()) / unitMilliseconds,
  );
  const firstAlignedOffset =
    Math.ceil(startUnitOffset / stepDefinition.count) * stepDefinition.count;
  const current = new Date(
    epoch.getTime() + firstAlignedOffset * unitMilliseconds,
  );

  while (current.getTime() <= endDate.getTime() + unitMilliseconds * 0.5) {
    const preciseYear = getPreciseTimelineYearFromDate(current);
    const tickYear = toApproximateTimelineYear(preciseYear);

    if (
      tickYear >= clampedStart - EPSILON &&
      tickYear <= clampedEnd + EPSILON
    ) {
      ticks.push({ year: tickYear, preciseYear });
    }

    current.setTime(current.getTime() + stepDefinition.count * unitMilliseconds);
  }

  return ticks;
}

function getElapsedDayTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition:
    | Extract<AxisStepDefinition, { kind: "elapsed-day" }>
    | Extract<AxisStepDefinition, { kind: "elapsed" }>,
  reference: TimelineElapsedReference,
  preciseStartYear?: PreciseTimelineYear,
  preciseEndYear?: PreciseTimelineYear,
): ExplicitTick[] {
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart) {
    return [];
  }

  const step = stepDefinition.step;
  const ticks: ExplicitTick[] = [];
  const isAfterBigBangRange = reference === "after-big-bang";
  const orderedPreciseStart =
    preciseStartYear && preciseEndYear
      ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
        ? preciseStartYear
        : preciseEndYear
      : splitTimelineYear(clampedStart);
  const orderedPreciseEnd =
    preciseStartYear && preciseEndYear
      ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
        ? preciseEndYear
        : preciseStartYear
      : splitTimelineYear(clampedEnd);

  if (isAfterBigBangRange) {
    const referenceYear = splitTimelineYear(TIMELINE_MIN_YEAR);
    const minElapsed = Math.max(
      0,
      subtractPreciseTimelineYears(orderedPreciseStart, referenceYear),
    );
    const maxElapsed = Math.max(
      0,
      subtractPreciseTimelineYears(orderedPreciseEnd, referenceYear),
    );

    if (step < maxElapsed * Number.EPSILON * 64) {
      return getPreciseNumericTicksForStep(step, orderedPreciseStart, orderedPreciseEnd);
    }

    const firstElapsed = Math.ceil((minElapsed - EPSILON) / step) * step;

    for (
      let elapsed = firstElapsed;
      elapsed <= maxElapsed + EPSILON;
      elapsed += step
    ) {
      const preciseYear = addPreciseTimelineYears(referenceYear, elapsed);

      ticks.push({
        year: toApproximateTimelineYear(preciseYear),
        preciseYear,
      });

      if (ticks.length >= MAX_TICKS_PER_STEP) break;
    }

    return ticks;
  }

  const referenceYear = splitTimelineYear(TIMELINE_MAX_YEAR);
  const minElapsed = Math.max(
    0,
    subtractPreciseTimelineYears(referenceYear, orderedPreciseEnd),
  );
  const maxElapsed = Math.max(
    0,
    subtractPreciseTimelineYears(referenceYear, orderedPreciseStart),
  );

  if (step < maxElapsed * Number.EPSILON * 64) {
    return getPreciseNumericTicksForStep(step, orderedPreciseStart, orderedPreciseEnd);
  }

  const firstElapsed = Math.ceil((minElapsed - EPSILON) / step) * step;

  for (
    let elapsed = firstElapsed;
    elapsed <= maxElapsed + EPSILON;
    elapsed += step
  ) {
    const preciseYear = addPreciseTimelineYears(referenceYear, -elapsed);

    ticks.push({
      year: toApproximateTimelineYear(preciseYear),
      preciseYear,
    });

    if (ticks.length >= MAX_TICKS_PER_STEP) break;
  }

  return ticks;
}

function getElapsedTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: Extract<AxisStepDefinition, { kind: "elapsed" }>,
  preciseStartYear?: PreciseTimelineYear,
  preciseEndYear?: PreciseTimelineYear,
) {
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart) {
    return [];
  }

  const orderedPreciseStart =
    preciseStartYear && preciseEndYear
      ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
        ? preciseStartYear
        : preciseEndYear
      : splitTimelineYear(clampedStart);
  const orderedPreciseEnd =
    preciseStartYear && preciseEndYear
      ? comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
        ? preciseEndYear
        : preciseStartYear
      : splitTimelineYear(clampedEnd);
  const step = stepDefinition.step;
  const ticks: ExplicitTick[] = [];
  const minElapsed =
    stepDefinition.reference === "after-big-bang"
      ? Math.max(0, getYearsAfterBigBang(orderedPreciseStart))
      : Math.max(0, getYearsAgoFromPresent(orderedPreciseEnd));
  const maxElapsed =
    stepDefinition.reference === "after-big-bang"
      ? Math.max(0, getYearsAfterBigBang(orderedPreciseEnd))
      : Math.max(0, getYearsAgoFromPresent(orderedPreciseStart));
  const firstElapsed = Math.ceil((minElapsed - EPSILON) / step) * step;

  for (
    let elapsed = firstElapsed;
    elapsed <= maxElapsed + EPSILON;
    elapsed += step
  ) {
    const approximateYear =
      stepDefinition.reference === "after-big-bang"
        ? getTimelineYearFromYearsAfterBigBang(elapsed)
        : getTimelineYearFromYearsAgo(elapsed);
    const preciseYear = splitTimelineYear(approximateYear);

    ticks.push({
      year: approximateYear,
      preciseYear,
    });

    if (ticks.length >= MAX_TICKS_PER_STEP) break;
  }

  return ticks;
}

function getPreciseNumericTicksForStep(
  step: number,
  preciseStartYear: PreciseTimelineYear,
  preciseEndYear: PreciseTimelineYear,
) {
  const safeStep = Math.max(Math.abs(step), EPSILON);
  const startYear =
    comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
      ? preciseStartYear
      : preciseEndYear;
  const endYear =
    comparePreciseTimelineYears(preciseStartYear, preciseEndYear) <= 0
      ? preciseEndYear
      : preciseStartYear;
  const anchorYear = normalizePreciseTimelineYear(startYear.wholeYear, 0);
  const localStart = subtractPreciseTimelineYears(startYear, anchorYear);
  const localEnd = subtractPreciseTimelineYears(endYear, anchorYear);
  const firstTick = roundToStepPrecision(
    Math.ceil((localStart - safeStep * 1e-6) / safeStep) * safeStep,
    safeStep,
  );
  const tickCount = Math.max(
    0,
    Math.ceil((localEnd - localStart) / safeStep) + 2,
  );
  const ticks: ExplicitTick[] = [];

  for (let index = 0; index < Math.min(tickCount, MAX_TICKS_PER_STEP); index += 1) {
    const localTick = roundToStepPrecision(
      firstTick + index * safeStep,
      safeStep,
    );

    if (localTick > localEnd + safeStep * 1e-6) {
      break;
    }

    const preciseYear = addPreciseTimelineYears(anchorYear, localTick);
    const approximateYear = toApproximateTimelineYear(preciseYear);

    if (approximateYear >= TIMELINE_MIN_YEAR - safeStep * 1e-6) {
      ticks.push({
        year: approximateYear,
        preciseYear,
      });
    }
  }

  return ticks;
}

function getExplicitTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: AxisStepDefinition,
  options: ResolveAxisTickOptions,
): ExplicitTick[] {
  if (stepDefinition.kind === "elapsed") {
    return getElapsedTicksForStep(
      startYear,
      endYear,
      stepDefinition,
      options.preciseStartYear,
      options.preciseEndYear,
    );
  }

  if (stepDefinition.kind === "calendar") {
    return getCalendarTicksForStep(
      startYear,
      endYear,
      stepDefinition,
      options.preciseStartYear,
      options.preciseEndYear,
    );
  }

  if (stepDefinition.kind === "elapsed-day") {
    return getElapsedDayTicksForStep(
      startYear,
      endYear,
      stepDefinition,
      options.elapsedSubYearReference ?? "ago",
      options.preciseStartYear,
      options.preciseEndYear,
    );
  }

  const step = stepDefinition.step;

  if (step < 1 && options.preciseStartYear && options.preciseEndYear) {
    return getPreciseNumericTicksForStep(
      step,
      options.preciseStartYear,
      options.preciseEndYear,
    );
  }

  const safeStep = Math.max(Math.abs(step), EPSILON);
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart) {
    return [];
  }

  const firstTick = roundToStepPrecision(
    Math.ceil((clampedStart - safeStep * 1e-6) / safeStep) * safeStep,
    safeStep,
  );
  const tickCount = Math.max(
    0,
    Math.ceil((clampedEnd - clampedStart) / safeStep) + 2,
  );
  const ticks: ExplicitTick[] = [];

  for (let index = 0; index < Math.min(tickCount, MAX_TICKS_PER_STEP); index += 1) {
    const tick = roundToStepPrecision(firstTick + index * safeStep, safeStep);

    if (tick > clampedEnd + safeStep * 1e-6) {
      break;
    }

    if (tick >= TIMELINE_MIN_YEAR - safeStep * 1e-6) {
      ticks.push({ year: tick });
    }
  }

  return ticks;
}

function getNumericCandidateSteps(
  idealMajorStep: number,
  yearsPerPixel: number,
) {
  if (!Number.isFinite(idealMajorStep) || idealMajorStep <= 0) {
    return [];
  }

  const basePower = Math.floor(Math.log10(idealMajorStep));
  const steps = new Set<number>();

  for (
    let power = basePower - STEP_SEARCH_RADIUS;
    power <= basePower + STEP_SEARCH_RADIUS;
    power += 1
  ) {
    for (const factor of NICE_STEP_FACTORS) {
      const step = factor * 10 ** power;
      const pixelsPerStep = step / yearsPerPixel;

      if (
        Number.isFinite(step) &&
        step > 0 &&
        pixelsPerStep >= CANDIDATE_MIN_SPACING_PX &&
        pixelsPerStep <= CANDIDATE_MAX_SPACING_PX
      ) {
        steps.add(step);
      }
    }
  }

  return [...steps]
    .sort((left, right) => left - right)
    .map<AxisStepDefinition>((step) => ({ kind: "numeric", step }));
}

function getElapsedCandidateSteps(
  idealMajorStep: number,
  yearsPerPixel: number,
  reference: TimelineElapsedReference,
) {
  return getNumericCandidateSteps(idealMajorStep, yearsPerPixel).map(
    (stepDefinition) => ({
      kind: "elapsed" as const,
      step: stepDefinition.step,
      reference,
    }),
  );
}

function getCalendarCandidateSteps(yearsPerPixel: number) {
  return [...CALENDAR_STEP_DEFINITIONS]
    .filter((stepDefinition) => {
      const pixelsPerStep = stepDefinition.step / yearsPerPixel;

      return (
        pixelsPerStep >= CANDIDATE_MIN_SPACING_PX &&
        pixelsPerStep <= CANDIDATE_MAX_SPACING_PX
      );
    })
    .sort((left, right) => left.step - right.step);
}

function getElapsedDayCandidateSteps(yearsPerPixel: number) {
  return [...ELAPSED_DAY_STEP_DEFINITIONS]
    .filter((stepDefinition) => {
      const pixelsPerStep = stepDefinition.step / yearsPerPixel;

      return (
        pixelsPerStep >= CANDIDATE_MIN_SPACING_PX &&
        pixelsPerStep <= CANDIDATE_MAX_SPACING_PX
      );
    })
    .sort((left, right) => left.step - right.step);
}

// Calendar and elapsed subdivisions share the same density rules as years.
// Keep both sides of the one-year boundary available throughout the transition.
function getCandidateSteps(
  idealStep: number,
  yearsPerPixel: number,
  reference: ReturnType<typeof getDominantTimelineDateReference>,
  elapsedReference?: TimelineElapsedReference,
) {
  const numeric = elapsedReference
    ? getElapsedCandidateSteps(idealStep, yearsPerPixel, elapsedReference)
    : getNumericCandidateSteps(idealStep, yearsPerPixel);
  if (reference === null) return numeric;
  return [
    ...numeric.filter(({ step }) => step >= 1),
    ...(reference === "calendar"
      ? getCalendarCandidateSteps(yearsPerPixel)
      : getElapsedDayCandidateSteps(yearsPerPixel)),
  ].sort((a, b) => a.step - b.step);
}

/** All visual transitions are functions of scale, never elapsed animation time. */
export function getAxisTickVisibility(spacing: number) {
  return smoothstep01((spacing - TICK_REVEAL_START_PX) /
    (TICK_FULL_VISIBILITY_PX - TICK_REVEAL_START_PX));
}

function getLabelVisibility(spacing: number) {
  return smoothstep01(Math.log(spacing / LABEL_MIN_SPACING_PX) /
    Math.log(LABEL_FULL_SPACING_PX / LABEL_MIN_SPACING_PX));
}

export function resolveAxisTickRenderStates(
  startYear: number,
  endYear: number,
  width: number,
  options: ResolveAxisTickOptions = {},
): AxisTickRenderState[] {
  if (!Number.isFinite(width) || width <= 0 ||
      !Number.isFinite(startYear) || !Number.isFinite(endYear)) return [];
  const clampedStart = Math.max(Math.min(startYear, endYear), TIMELINE_MIN_YEAR);
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);
  if (clampedEnd < clampedStart) return [];
  const rangeStart = options.preciseStartYear ?? splitTimelineYear(clampedStart);
  const rangeEnd = options.preciseEndYear ?? splitTimelineYear(clampedEnd);
  const span = Math.max(Math.abs(subtractPreciseTimelineYears(rangeEnd, rangeStart)), EPSILON);
  const yearsPerPixel = span / width;
  const reference = getDominantTimelineDateReference(rangeStart, rangeEnd);
  const elapsedReference = reference === "elapsed"
    ? (options.elapsedReference ?? options.elapsedSubYearReference ?? "ago")
    : undefined;
  const steps = getCandidateSteps(yearsPerPixel * TARGET_MAJOR_SPACING_PX, yearsPerPixel, reference, elapsedReference);
  const states: AxisTickRenderState[] = [];

  for (const definition of steps) {
    const spacing = definition.step / yearsPerPixel;
    const visibleProgress = getAxisTickVisibility(spacing);
    // Keep coarse landmarks and reveal finer labels in the space between them.
    // There is no discrete "winning" grid to swap when crossing a zoom threshold.
    const labelOpacity = getLabelVisibility(spacing);
    const majorProgress = smoothstep01(Math.log(spacing / 40) / Math.log(280 / 40));
    const ticks = getExplicitTicksForStep(clampedStart, clampedEnd, definition, {
      ...options,
      preciseStartYear: rangeStart,
      preciseEndYear: rangeEnd,
    });
    for (const tick of ticks) {
      const decimalGrid = definition.kind === "numeric" || definition.kind === "elapsed";
      const coordinate = definition.kind === "elapsed"
        ? definition.reference === "after-big-bang"
          ? getYearsAfterBigBang(tick.year)
          : getYearsAgoFromPresent(tick.year)
        : tick.year;
      const isMidpoint = decimalGrid && Math.abs(Math.round(coordinate / definition.step)) % 10 === 5;
      const midpointEmphasis = isMidpoint
        ? 0.42 * smoothstep01(Math.log(spacing * 10 / 40) / Math.log(280 / 40))
        : 0;
      states.push({
        year: tick.year,
        wholeYear: tick.preciseYear?.wholeYear,
        yearFraction: tick.preciseYear?.fraction,
        step: definition.step,
        pixelsPerStep: spacing,
        visibleProgress,
        majorProgress: Math.max(majorProgress, midpointEmphasis),
        labelOpacity: isMidpoint ? getLabelVisibility(spacing * 5) : labelOpacity,
        labelStep: definition.step * (isMidpoint ? 5 : 1),
      });
    }
  }
  return states;
}

export type AxisTickScreenState = AxisTickRenderState & { x: number };

/** Project once, merge coincident grids, then fade subdivisions before collision.
 * Coarse landmarks win consistently, independent of zoom direction or frame rate.
 */
export function projectAxisTicks(
  ticks: readonly AxisTickRenderState[],
  rangeStart: PreciseTimelineYear,
  rangeEnd: PreciseTimelineYear,
  width: number,
  scaleMode: TimelineScaleMode = "linear",
  anchor?: PreciseTimelineYear,
): AxisTickScreenState[] {
  if (width <= 0) return [];
  const span = Math.max(Math.abs(subtractPreciseTimelineYears(rangeEnd, rangeStart)), EPSILON);
  const origin = anchor ?? addPreciseTimelineYears(rangeStart, span / 2);
  const yearsPerPixel = span / (scaleMode === "logarithmic" ? getLogarithmicAxisRangeFactor(width) : width);
  const geometry = resolveLogarithmicAxisGeometry(yearsPerPixel);
  const project = (delta: number) => width / 2 + (scaleMode === "logarithmic"
    ? getLogarithmicScreenDeltaFromYearsDelta(delta, geometry)
    : delta / yearsPerPixel);
  const projected: AxisTickScreenState[] = [];
  const buckets = new Map<number, AxisTickScreenState[]>();
  // Only inspect adjacent spatial buckets; work is bounded by screen width,
  // rather than comparing every tick with every other tick.
  for (const tick of [...ticks].sort((a, b) => b.step - a.step)) {
    const precise = tick.wholeYear !== undefined && tick.yearFraction !== undefined
      ? { wholeYear: tick.wholeYear, fraction: tick.yearFraction }
      : splitTimelineYear(tick.year);
    const delta = subtractPreciseTimelineYears(precise, origin);
    const x = project(delta);
    if (x < -1 || x > width + 1 || !Number.isFinite(x)) continue;
    const spacing = scaleMode === "linear" ? tick.pixelsPerStep : Math.min(
      project(delta + tick.step) - x, x - project(delta - tick.step));
    const bucket = Math.floor(x / TICK_FULL_CLEARANCE_PX);
    const neighbors = [buckets.get(bucket - 1), buckets.get(bucket), buckets.get(bucket + 1)]
      .flatMap((items) => items ?? []);
    const coincident = neighbors.find((other) => Math.abs(other.x - x) < 0.25);
    if (coincident) {
      const combinedAlpha = Math.max(coincident.labelOpacity, tick.labelOpacity);
      if (tick.labelOpacity > coincident.labelOpacity) coincident.labelStep = tick.labelStep;
      coincident.labelOpacity = combinedAlpha;
      continue;
    }
    const clearance = neighbors.reduce(
      (gap, other) => Math.min(gap, Math.abs(other.x - x)),
      TICK_FULL_CLEARANCE_PX,
    );
    const separationAlpha = smoothstep01(
      (clearance - TICK_MIN_CLEARANCE_PX) /
      (TICK_FULL_CLEARANCE_PX - TICK_MIN_CLEARANCE_PX),
    );
    const visibleProgress = Math.min(tick.visibleProgress, getAxisTickVisibility(spacing)) * separationAlpha;
    if (visibleProgress <= 0.001) continue;
    const projectedTick = { ...tick, x, pixelsPerStep: spacing, visibleProgress,
      labelOpacity: tick.labelOpacity * separationAlpha };
    projected.push(projectedTick);
    const entries = buckets.get(bucket) ?? [];
    entries.push(projectedTick);
    buckets.set(bucket, entries);
  }
  return projected.sort((a, b) => a.x - b.x);
}
