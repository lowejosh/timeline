import {
  getDominantTimelineDateReference,
  type TimelineElapsedReference,
} from "./bands";
import {
  getLogarithmicScreenDeltaFromYearsDelta,
  resolveLogarithmicAxisGeometry,
} from "./logarithmicAxis";
import {
  getYearsAfterBigBang,
  getYearsAgoFromPresent,
  getTimelineYearFromYearsAfterBigBang,
  getTimelineYearFromYearsAgo,
} from "./timelineYears";
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
} from "./viewport";

export type AxisTickRenderState = {
  year: number;
  wholeYear?: number;
  yearFraction?: number;
  step: number;
  hierarchyDepth: number;
  pixelsPerStep: number;
  growthProgress: number;
  visibleProgress: number;
  majorProgress: number;
  labelOpacity: number;
  labelStep: number;
  generationIndex: number;
  generationAlpha: number;
  generationProgress: number;
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
  hierarchyDepth: number;
  pixelsPerStep: number;
  growthProgress: number;
  retainProgress: number;
  visibleProgress: number;
  majorProgress: number;
  labelProgress: number;
  majorBandProgress: number;
  labelBandProgress: number;
  generationIndex: number;
  generationAlpha: number;
  generationProgress: number;
};

export type ResolveAxisTickOptions = {
  elapsedReference?: TimelineElapsedReference;
  elapsedSubYearReference?: TimelineElapsedReference;
  preciseStartYear?: PreciseTimelineYear;
  preciseEndYear?: PreciseTimelineYear;
  anchorYear?: number;
  preciseAnchorYear?: PreciseTimelineYear;
  scaleMode?: TimelineScaleMode;
};

type ExplicitTick = {
  year: number;
  preciseYear?: PreciseTimelineYear;
};

const NICE_STEP_FACTORS = [1, 2, 5] as const;
const TARGET_MAJOR_SPACING_PX = 280;
const TARGET_LABEL_SPACING_PX = 120;
const TICK_REVEAL_START_PX = 3;
const TICK_FULL_VISIBILITY_PX = 16;
const TICK_FADE_END_PX = 8_000;
const CANDIDATE_MIN_SPACING_PX = 3;
const CANDIDATE_MAX_SPACING_PX = TICK_FADE_END_PX;
const STEP_SEARCH_RADIUS = 5;
const LABEL_MIN_SPACING_PX = 72;
const LABEL_FULL_SPACING_PX = 120;
const MIN_USEFUL_TICKS_PER_LAYER = 0.9;
const MAX_FINER_VISIBLE_LAYERS = 2;
const MAX_COARSER_CONTEXT_LAYERS = 2;
const EPSILON = 1e-18;
const DAY_IN_MS = 86_400_000;
const AVERAGE_DAYS_PER_YEAR = 365.2425;
const YEARS_PER_DAY = 1 / AVERAGE_DAYS_PER_YEAR;
const LOGARITHMIC_GENERATION_REVEAL_START_PX = 200;
const LOGARITHMIC_GENERATION_REVEAL_END_PX = 230;
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
  { kind: "elapsed-day", count: 180, step: 180 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 90, step: 90 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 60, step: 60 * YEARS_PER_DAY },
  { kind: "elapsed-day", count: 30, step: 30 * YEARS_PER_DAY },
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

function getClosestSpacingIndex(
  layers: AxisTickLayerState[],
  targetPixels: number,
  startIndex = 0,
) {
  return layers.reduce((bestIndex, layer, index) => {
    if (index < startIndex) {
      return bestIndex;
    }

    const best = layers[bestIndex];
    const layerDistance = Math.abs(
      Math.log(layer.pixelsPerStep / targetPixels),
    );
    const bestDistance = Math.abs(Math.log(best.pixelsPerStep / targetPixels));

    if (Math.abs(layerDistance - bestDistance) > 1e-9) {
      return layerDistance < bestDistance ? index : bestIndex;
    }

    return layer.step < best.step ? index : bestIndex;
  }, startIndex);
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

function getTimelineYearFromDate(date: Date) {
  const year = date.getUTCFullYear();
  const start = getTimelineYearStart(year);
  const end = getTimelineYearStart(year + 1);
  const timelineYear = getTimelineYearFromAstronomicalYear(year);

  return timelineYear + (date.getTime() - start) / (end - start);
}

function getCalendarTicksForStep(
  startYear: number,
  endYear: number,
  stepDefinition: Extract<AxisStepDefinition, { kind: "calendar" }>,
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
      const tickYear = getTimelineYearFromDate(current);

      if (
        tickYear >= clampedStart - EPSILON &&
        tickYear <= clampedEnd + EPSILON
      ) {
        ticks.push({ year: tickYear });
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
      ticks.push({ year: tickYear });
    }

    current.setUTCDate(current.getUTCDate() + stepDefinition.count);
    current.setUTCHours(0, 0, 0, 0);
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

  for (let index = 0; index < tickCount; index += 1) {
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
    return getCalendarTicksForStep(startYear, endYear, stepDefinition);
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

  for (let index = 0; index < tickCount; index += 1) {
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

function getCandidateSteps(
  idealMajorStep: number,
  yearsPerPixel: number,
  subYearMode: "numeric" | "calendar" | "elapsed-day",
  elapsedReference?: TimelineElapsedReference,
) {
  if (idealMajorStep >= 1) {
    if (elapsedReference) {
      return getElapsedCandidateSteps(
        idealMajorStep,
        yearsPerPixel,
        elapsedReference,
      );
    }

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

function getClosestDiscreteStepDefinition(
  targetStep: number,
  definitions: readonly AxisStepDefinition[],
) {
  return definitions.reduce((best, candidate) => {
    const bestDistance = Math.abs(Math.log(best.step / targetStep));
    const candidateDistance = Math.abs(Math.log(candidate.step / targetStep));

    if (Math.abs(candidateDistance - bestDistance) > 1e-9) {
      return candidateDistance < bestDistance ? candidate : best;
    }

    return candidate.step < best.step ? candidate : best;
  });
}

function getVisibleTickLayers(
  candidateSteps: AxisStepDefinition[],
  yearsPerPixel: number,
  span: number,
) {
  const visibleLayers = candidateSteps
    .map<AxisTickLayerState>((stepDefinition) => {
      const step = stepDefinition.step;
      const pixelsPerStep = step / yearsPerPixel;
      const approximateTickCount = span / Math.max(step, EPSILON);
      const isVisible =
        pixelsPerStep >= TICK_REVEAL_START_PX &&
        pixelsPerStep <= TICK_FADE_END_PX &&
        approximateTickCount >= MIN_USEFUL_TICKS_PER_LAYER;
      const visibleT = clamp01(
        (pixelsPerStep - TICK_REVEAL_START_PX) /
          (TICK_FULL_VISIBILITY_PX - TICK_REVEAL_START_PX),
      );
      const visibleProgress = isVisible ? smoothstep01(visibleT) : 0;

      return {
        stepDefinition,
        step,
        hierarchyDepth: 0,
        pixelsPerStep,
        growthProgress: visibleProgress,
        retainProgress: visibleProgress,
        visibleProgress,
        majorProgress: 0,
        labelProgress: 0,
        majorBandProgress: 0,
        labelBandProgress: 0,
        generationIndex: 0,
        generationAlpha: 1,
        generationProgress: 1,
      };
    })
    .filter((layer) => layer.visibleProgress > 0.01);

  if (visibleLayers.length <= 1) {
    return visibleLayers;
  }

  const readableLabelLayers = visibleLayers.filter(
    (layer) => layer.pixelsPerStep >= LABEL_MIN_SPACING_PX,
  );
  const labelIndex = getClosestSpacingIndex(
    readableLabelLayers.length > 0 ? readableLabelLayers : visibleLayers,
    readableLabelLayers.length > 0
      ? TARGET_LABEL_SPACING_PX
      : LABEL_MIN_SPACING_PX,
  );
  const labelSource =
    readableLabelLayers.length > 0 ? readableLabelLayers : visibleLayers;
  const resolvedLabelLayer = labelSource[labelIndex];
  const resolvedLabelIndex = visibleLayers.findIndex(
    (layer) => layer.step === resolvedLabelLayer.step,
  );
  const majorIndex = getClosestSpacingIndex(
    visibleLayers,
    TARGET_MAJOR_SPACING_PX,
    resolvedLabelIndex,
  );
  const finestVisibleIndex = Math.max(
    0,
    resolvedLabelIndex - MAX_FINER_VISIBLE_LAYERS,
  );
  const coarsestVisibleIndex = Math.min(
    visibleLayers.length - 1,
    Math.max(majorIndex + MAX_COARSER_CONTEXT_LAYERS, resolvedLabelIndex),
  );

  return visibleLayers
    .slice(finestVisibleIndex, coarsestVisibleIndex + 1)
    .map((layer, sliceIndex) => {
      const index = finestVisibleIndex + sliceIndex;
      const labelT = clamp01(
        (layer.pixelsPerStep - LABEL_MIN_SPACING_PX) /
          (LABEL_FULL_SPACING_PX - LABEL_MIN_SPACING_PX),
      );
      const majorT = clamp01(
        (Math.log(layer.pixelsPerStep) - Math.log(TARGET_LABEL_SPACING_PX)) /
          (Math.log(TARGET_MAJOR_SPACING_PX) -
            Math.log(TARGET_LABEL_SPACING_PX)),
      );

      return {
        ...layer,
        hierarchyDepth: resolvedLabelIndex - index,
        majorProgress: smoothstep01(majorT),
        labelProgress: index === resolvedLabelIndex ? smoothstep01(labelT) : 0,
        majorBandProgress: smoothstep01(majorT),
        labelBandProgress:
          index === resolvedLabelIndex ? smoothstep01(labelT) : 0,
        generationIndex: 0,
        generationAlpha: 1,
        generationProgress: 1,
      };
    });
}

function getLogarithmicStepDefinition(
  targetStep: number,
  subYearMode: "numeric" | "calendar" | "elapsed-day",
  elapsedReference?: TimelineElapsedReference,
): AxisStepDefinition {
  if (targetStep >= 1 || subYearMode === "numeric") {
    if (targetStep >= 1 && elapsedReference) {
      return {
        kind: "elapsed",
        step: targetStep,
        reference: elapsedReference,
      };
    }

    return {
      kind: "numeric",
      step: targetStep,
    };
  }

  if (subYearMode === "calendar") {
    return getClosestDiscreteStepDefinition(
      targetStep,
      CALENDAR_STEP_DEFINITIONS,
    );
  }

  return getClosestDiscreteStepDefinition(
    targetStep,
    ELAPSED_DAY_STEP_DEFINITIONS,
  );
}

function getLogarithmicVisibleTickLayers(
  yearsPerPixel: number,
  subYearMode: "numeric" | "calendar" | "elapsed-day",
  elapsedReference?: TimelineElapsedReference,
) {
  const geometry = resolveLogarithmicAxisGeometry(yearsPerPixel);
  const currentStep = 10 ** Math.ceil(geometry.decadeValue);
  const childStep = currentStep / 10;
  const parentStep = currentStep * 10;
  const currentPixelsPerStep = getLogarithmicScreenDeltaFromYearsDelta(
    currentStep,
    geometry,
  );
  const transitionT = smoothstep01(1 - geometry.decadeRemainder);
  const revealT = smoothstep01(
    clamp01(
      (currentPixelsPerStep - LOGARITHMIC_GENERATION_REVEAL_START_PX) /
        (LOGARITHMIC_GENERATION_REVEAL_END_PX -
          LOGARITHMIC_GENERATION_REVEAL_START_PX),
    ),
  );
  const childGenerationAlpha = Math.max(transitionT, revealT * 0.35);
  const parentGenerationAlpha = 1 - transitionT;
  const makeLayer = (
    targetStep: number,
    generationIndex: number,
    generationAlpha: number,
  ): AxisTickLayerState => {
    const stepDefinition = getLogarithmicStepDefinition(
      targetStep,
      subYearMode,
      elapsedReference,
    );
    const step = stepDefinition.step;
    const pixelsPerStep = Math.abs(
      getLogarithmicScreenDeltaFromYearsDelta(step, geometry),
    );
    const visibleT = clamp01(
      (pixelsPerStep - TICK_REVEAL_START_PX) /
        (TICK_FULL_VISIBILITY_PX - TICK_REVEAL_START_PX),
    );
    const labelT = clamp01(
      (pixelsPerStep - LABEL_MIN_SPACING_PX) /
        (LABEL_FULL_SPACING_PX - LABEL_MIN_SPACING_PX),
    );

    return {
      stepDefinition,
      step,
      hierarchyDepth: -generationIndex,
      pixelsPerStep,
      growthProgress: smoothstep01(visibleT) * generationAlpha,
      retainProgress: smoothstep01(visibleT) * generationAlpha,
      visibleProgress: smoothstep01(visibleT) * generationAlpha,
      majorProgress: generationIndex === 0 ? 1 : 0.45 + generationAlpha * 0.55,
      labelProgress: generationIndex === 0 ? smoothstep01(labelT) : 0,
      majorBandProgress:
        generationIndex === 0 ? 1 : 0.45 + generationAlpha * 0.55,
      labelBandProgress: generationIndex === 0 ? smoothstep01(labelT) : 0,
      generationIndex,
      generationAlpha,
      generationProgress: transitionT,
    };
  };

  const dedupedLayers = new Map<string, AxisTickLayerState>();

  for (const layer of [
    makeLayer(parentStep, -1, parentGenerationAlpha),
    makeLayer(currentStep, 0, 1),
    makeLayer(childStep, 1, childGenerationAlpha),
  ]) {
    const key = `${layer.stepDefinition.kind}:${layer.step.toPrecision(15)}`;
    const existing = dedupedLayers.get(key);

    if (
      !existing ||
      Math.abs(layer.generationIndex) < Math.abs(existing.generationIndex)
    ) {
      dedupedLayers.set(key, layer);
    }
  }

  return [...dedupedLayers.values()]
    .filter(
      (layer) => layer.visibleProgress > 0.01 || layer.generationAlpha > 0.01,
    )
    .sort((left, right) => left.step - right.step);
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
  const preciseRangeStart =
    options.preciseStartYear ?? splitTimelineYear(clampedStart);
  const preciseRangeEnd =
    options.preciseEndYear ?? splitTimelineYear(clampedEnd);
  const span = Math.max(
    Math.abs(subtractPreciseTimelineYears(preciseRangeEnd, preciseRangeStart)),
    EPSILON,
  );
  const yearsPerPixel = span / safeWidth;
  const scaleMode = options.scaleMode ?? "linear";
  const majorCount = Math.max(
    2,
    Math.floor(safeWidth / TARGET_MAJOR_SPACING_PX),
  );
  const idealMajorStep = Math.max(span / majorCount, EPSILON);
  const dominantReference = getDominantTimelineDateReference(
    preciseRangeStart,
    preciseRangeEnd,
  );
  const elapsedReference =
    dominantReference === "elapsed"
      ? (options.elapsedReference ?? options.elapsedSubYearReference ?? "ago")
      : undefined;
  const subYearMode =
    idealMajorStep < 1
      ? (() => {
          if (dominantReference === null) {
            return "numeric";
          }

          return dominantReference === "elapsed" ? "elapsed-day" : "calendar";
        })()
      : "numeric";
  const visibleLayers =
    scaleMode === "logarithmic"
      ? getLogarithmicVisibleTickLayers(
          yearsPerPixel,
          subYearMode,
          elapsedReference,
        )
      : getVisibleTickLayers(
          getCandidateSteps(
            idealMajorStep,
            yearsPerPixel,
            subYearMode,
            elapsedReference,
          ),
          yearsPerPixel,
          span,
        );
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
        year: tick.year,
        wholeYear: tick.preciseYear?.wholeYear,
        yearFraction: tick.preciseYear?.fraction,
        step: layer.step,
        hierarchyDepth: layer.hierarchyDepth,
        pixelsPerStep: layer.pixelsPerStep,
        growthProgress: layer.growthProgress,
        visibleProgress: layer.visibleProgress,
        majorProgress: layer.majorProgress,
        labelOpacity: layer.labelProgress,
        labelStep: layer.step,
        generationIndex: layer.generationIndex,
        generationAlpha: layer.generationAlpha,
        generationProgress: layer.generationProgress,
      });
    }
  }

  return states.sort(
    (left, right) =>
      left.step - right.step ||
      (left.wholeYear ?? Math.floor(left.year)) -
        (right.wholeYear ?? Math.floor(right.year)) ||
      (left.yearFraction ?? left.year - Math.floor(left.year)) -
        (right.yearFraction ?? right.year - Math.floor(right.year)),
  );
}
