import { YEARS_AGO_CUTOFF, type TimelineElapsedReference } from "./bands";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./viewport";

export type AxisTickRenderState = {
  year: number;
  step: number;
  pixelsPerStep: number;
  growthProgress: number;
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
      kind: "calendar";
      unit: "month" | "day";
      count: number;
      step: number;
    }
  | {
      kind: "elapsed-day";
      count: number;
      step: number;
    };

type AxisTickLayerState = {
  stepDefinition: AxisStepDefinition;
  step: number;
  pixelsPerStep: number;
  growthProgress: number;
  retainProgress: number;
  visibleProgress: number;
  majorProgress: number;
  labelProgress: number;
};

export type ResolveAxisTickOptions = {
  elapsedSubYearReference?: TimelineElapsedReference;
};

const NICE_STEP_FACTORS = [1, 2, 5] as const;
const TARGET_MAJOR_SPACING_PX = 280;
const TICK_REVEAL_START_PX = 2;
const TICK_REVEAL_END_PX = 32;
const TICK_FADE_START_PX = 1_600;
const TICK_FADE_END_PX = 8_000;
const MAJOR_EMPHASIS_RATIO = 4.2;
const LABEL_EMPHASIS_RATIO = 2.4;
const CANDIDATE_MIN_SPACING_PX = 2;
const CANDIDATE_MAX_SPACING_PX = TICK_FADE_END_PX;
const STEP_SEARCH_RADIUS = 5;
const EPSILON = 1e-9;
const DAY_IN_MS = 86_400_000;
const AVERAGE_DAYS_PER_YEAR = 365.2425;
const YEARS_PER_DAY = 1 / AVERAGE_DAYS_PER_YEAR;
const CALENDAR_STEP_DEFINITIONS: readonly AxisStepDefinition[] = [
  { kind: "calendar", unit: "month", count: 6, step: 0.5 },
  { kind: "calendar", unit: "month", count: 3, step: 0.25 },
  { kind: "calendar", unit: "month", count: 1, step: 1 / 12 },
  { kind: "calendar", unit: "day", count: 14, step: 14 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 7, step: 7 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 2, step: 2 * YEARS_PER_DAY },
  { kind: "calendar", unit: "day", count: 1, step: YEARS_PER_DAY },
] as const;
const ELAPSED_DAY_STEP_DEFINITIONS: readonly AxisStepDefinition[] = [
  { kind: "elapsed-day", count: 14, step: 14 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 7, step: 7 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 2, step: 2 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 1, step: YEARS_PER_DAY },
] as const;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value: number) {
  const clamped = clamp01(value);

  return clamped * clamped * (3 - 2 * clamped);
}

function getRangeProgress(value: number, start: number, end: number) {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return smoothstep01((value - start) / (end - start));
}

function getBandProgress(
  pixelsPerStep: number,
  targetPixels: number,
  maxRatio: number,
) {
  if (pixelsPerStep <= 0 || targetPixels <= 0 || maxRatio <= 1) {
    return 0;
  }

  const distance = Math.abs(Math.log(pixelsPerStep / targetPixels));
  const maxDistance = Math.log(maxRatio);
  const normalized = 1 - distance / maxDistance;

  return smoothstep01(normalized);
}

function getStepDecimals(step: number) {
  if (!Number.isFinite(step) || step <= 0 || step >= 1) {
    return 0;
  }

  return Math.min(8, Math.ceil(-Math.log10(step)) + 2);
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
  const start = getTimelineYearStart(wholeYear);
  const end = getTimelineYearStart(wholeYear + 1);

  return new Date(start + fraction * (end - start));
}

function getTimelineYearFromDate(date: Date) {
  const year = date.getUTCFullYear();
  const start = getTimelineYearStart(year);
  const end = getTimelineYearStart(year + 1);

  return year + (date.getTime() - start) / (end - start);
}

function getCalendarTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: Extract<AxisStepDefinition, { kind: "calendar" }>,
) {
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart || clampedEnd < 1) {
    return [];
  }

  const startDate = getTimelineDateFromYear(Math.max(clampedStart, 1));
  const endDate = getTimelineDateFromYear(clampedEnd);
  const ticks: number[] = [];

  if (stepDefinition.unit === "month") {
    const startMonthIndex =
      startDate.getUTCFullYear() * 12 + startDate.getUTCMonth();
    const firstMonthIndex =
      Math.ceil(startMonthIndex / stepDefinition.count) * stepDefinition.count;
    const firstYear = Math.floor(firstMonthIndex / 12);
    const firstMonth = firstMonthIndex % 12;
    const current = createTimelineUtcDate(firstYear, firstMonth, 1);

    while (current.getTime() <= endDate.getTime() + DAY_IN_MS * 0.5) {
      const tickYear = getTimelineYearFromDate(current);

      if (
        tickYear >= clampedStart - EPSILON &&
        tickYear <= clampedEnd + EPSILON
      ) {
        ticks.push(tickYear);
      }

      current.setUTCMonth(current.getUTCMonth() + stepDefinition.count, 1);
      current.setUTCHours(0, 0, 0, 0);
    }

    return ticks;
  }

  const epoch = createTimelineUtcDate(1970, 0, 1);
  const startOfDay = createTimelineUtcDate(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const startDayOffset = Math.floor(
    (startOfDay.getTime() - epoch.getTime()) / DAY_IN_MS,
  );
  const firstAlignedOffset =
    Math.ceil(startDayOffset / stepDefinition.count) * stepDefinition.count;
  const current = new Date(epoch.getTime() + firstAlignedOffset * DAY_IN_MS);

  while (current.getTime() <= endDate.getTime() + DAY_IN_MS * 0.5) {
    const tickYear = getTimelineYearFromDate(current);

    if (
      tickYear >= clampedStart - EPSILON &&
      tickYear <= clampedEnd + EPSILON
    ) {
      ticks.push(tickYear);
    }

    current.setUTCDate(current.getUTCDate() + stepDefinition.count);
    current.setUTCHours(0, 0, 0, 0);
  }

  return ticks;
}

function getElapsedDayTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: Extract<AxisStepDefinition, { kind: "elapsed-day" }>,
  reference: TimelineElapsedReference,
) {
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);

  if (clampedEnd < clampedStart) {
    return [];
  }

  const step = stepDefinition.step;
  const ticks: number[] = [];
  const isAfterBigBangRange = reference === "after-big-bang";

  if (isAfterBigBangRange) {
    const minElapsed = Math.max(0, clampedStart - TIMELINE_MIN_YEAR);
    const maxElapsed = Math.max(0, clampedEnd - TIMELINE_MIN_YEAR);
    const firstElapsed = Math.ceil((minElapsed - EPSILON) / step) * step;

    for (
      let elapsed = firstElapsed;
      elapsed <= maxElapsed + EPSILON;
      elapsed += step
    ) {
      ticks.push(TIMELINE_MIN_YEAR + elapsed);
    }

    return ticks;
  }

  const minElapsed = Math.max(0, TIMELINE_MAX_YEAR - clampedEnd);
  const maxElapsed = Math.max(0, TIMELINE_MAX_YEAR - clampedStart);
  const firstElapsed = Math.ceil((minElapsed - EPSILON) / step) * step;

  for (
    let elapsed = firstElapsed;
    elapsed <= maxElapsed + EPSILON;
    elapsed += step
  ) {
    ticks.push(TIMELINE_MAX_YEAR - elapsed);
  }

  return ticks;
}

function getExplicitTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: AxisStepDefinition,
  options: ResolveAxisTickOptions,
) {
  if (stepDefinition.kind === "calendar") {
    return getCalendarTicksForStep(startYear, endYear, stepDefinition);
  }

  if (stepDefinition.kind === "elapsed-day") {
    return getElapsedDayTicksForStep(
      startYear,
      endYear,
      stepDefinition,
      options.elapsedSubYearReference ?? "ago",
    );
  }

  const step = stepDefinition.step;
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
  const ticks: number[] = [];

  for (let index = 0; index < tickCount; index += 1) {
    const tick = roundToStepPrecision(firstTick + index * safeStep, safeStep);

    if (tick > clampedEnd + safeStep * 1e-6) {
      break;
    }

    if (tick >= TIMELINE_MIN_YEAR - safeStep * 1e-6) {
      ticks.push(tick);
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

function getCalendarCandidateSteps(yearsPerPixel: number) {
  return CALENDAR_STEP_DEFINITIONS.filter((stepDefinition) => {
    const pixelsPerStep = stepDefinition.step / yearsPerPixel;

    return (
      pixelsPerStep >= CANDIDATE_MIN_SPACING_PX &&
      pixelsPerStep <= CANDIDATE_MAX_SPACING_PX
    );
  }).sort((left, right) => left.step - right.step);
}

function getElapsedDayCandidateSteps(yearsPerPixel: number) {
  return ELAPSED_DAY_STEP_DEFINITIONS.filter((stepDefinition) => {
    const pixelsPerStep = stepDefinition.step / yearsPerPixel;

    return (
      pixelsPerStep >= CANDIDATE_MIN_SPACING_PX &&
      pixelsPerStep <= CANDIDATE_MAX_SPACING_PX
    );
  }).sort((left, right) => left.step - right.step);
}

function getCandidateSteps(
  idealMajorStep: number,
  yearsPerPixel: number,
  subYearMode: "numeric" | "calendar" | "elapsed-day",
) {
  if (idealMajorStep >= 1) {
    return getNumericCandidateSteps(idealMajorStep, yearsPerPixel);
  }

  if (subYearMode === "calendar") {
    return getCalendarCandidateSteps(yearsPerPixel);
  }

  if (subYearMode === "elapsed-day") {
    return getElapsedDayCandidateSteps(yearsPerPixel);
  }

  return getNumericCandidateSteps(idealMajorStep, yearsPerPixel);
}

function getVisibleTickLayers(
  candidateSteps: AxisStepDefinition[],
  yearsPerPixel: number,
) {
  return candidateSteps
    .map<AxisTickLayerState>((stepDefinition) => {
      const step = stepDefinition.step;
      const pixelsPerStep = step / yearsPerPixel;
      const growthProgress = getRangeProgress(
        pixelsPerStep,
        TICK_REVEAL_START_PX,
        TICK_REVEAL_END_PX,
      );
      const retainProgress =
        pixelsPerStep <= TICK_FADE_START_PX
          ? 1
          : 1 -
            getRangeProgress(
              pixelsPerStep,
              TICK_FADE_START_PX,
              TICK_FADE_END_PX,
            );
      const visibleProgress = growthProgress * retainProgress;

      return {
        stepDefinition,
        step,
        pixelsPerStep,
        growthProgress,
        retainProgress,
        visibleProgress,
        majorProgress:
          getBandProgress(
            pixelsPerStep,
            TARGET_MAJOR_SPACING_PX,
            MAJOR_EMPHASIS_RATIO,
          ) * visibleProgress,
        labelProgress:
          getBandProgress(
            pixelsPerStep,
            TARGET_MAJOR_SPACING_PX,
            LABEL_EMPHASIS_RATIO,
          ) * visibleProgress,
      };
    })
    .filter((layer) => layer.visibleProgress > 0.01);
}

export function resolveAxisTickRenderStates(
  startYear: number,
  endYear: number,
  width: number,
  options: ResolveAxisTickOptions = {},
): AxisTickRenderState[] {
  const safeWidth = Math.max(width, 1);
  const clampedStart = Math.max(
    Math.min(startYear, endYear),
    TIMELINE_MIN_YEAR,
  );
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);
  const span = Math.max(clampedEnd - clampedStart, EPSILON);
  const yearsPerPixel = span / safeWidth;
  const majorCount = Math.max(
    2,
    Math.floor(safeWidth / TARGET_MAJOR_SPACING_PX),
  );
  const idealMajorStep = Math.max(span / majorCount, EPSILON);
  const subYearMode =
    idealMajorStep < 1
      ? clampedStart >= 1
        ? "calendar"
        : clampedEnd <= -YEARS_AGO_CUTOFF
          ? "elapsed-day"
          : "numeric"
      : "numeric";
  const candidateSteps = getCandidateSteps(
    idealMajorStep,
    yearsPerPixel,
    subYearMode,
  );
  const visibleLayers = getVisibleTickLayers(candidateSteps, yearsPerPixel);
  const states: AxisTickRenderState[] = [];

  for (const layer of visibleLayers) {
    const ticks = getExplicitTicksForStep(
      clampedStart,
      clampedEnd,
      layer.stepDefinition,
      options,
    );

    for (const tick of ticks) {
      states.push({
        year: tick,
        step: layer.step,
        pixelsPerStep: layer.pixelsPerStep,
        growthProgress: layer.growthProgress,
        visibleProgress: layer.visibleProgress,
        majorProgress: layer.majorProgress,
        labelOpacity: layer.labelProgress,
        labelStep: layer.step,
      });
    }
  }

  return states.sort(
    (left, right) => left.step - right.step || left.year - right.year,
  );
}
