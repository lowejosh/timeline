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

type AxisTickLayerState = {
  step: number;
  pixelsPerStep: number;
  growthProgress: number;
  retainProgress: number;
  visibleProgress: number;
  majorProgress: number;
  labelProgress: number;
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

function getExplicitTicksForStep(
  startYear: number,
  endYear: number,
  step: number,
) {
  const safeStep = Math.max(Math.abs(step), EPSILON);
  const clampedStart = Math.max(Math.min(startYear, endYear), TIMELINE_MIN_YEAR);
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

function getCandidateSteps(idealMajorStep: number, yearsPerPixel: number) {
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

  return [...steps].sort((left, right) => left - right);
}

function getVisibleTickLayers(
  candidateSteps: number[],
  yearsPerPixel: number,
) {
  return candidateSteps
    .map<AxisTickLayerState>((step) => {
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
): AxisTickRenderState[] {
  const safeWidth = Math.max(width, 1);
  const clampedStart = Math.max(Math.min(startYear, endYear), TIMELINE_MIN_YEAR);
  const clampedEnd = Math.min(Math.max(startYear, endYear), TIMELINE_MAX_YEAR);
  const span = Math.max(clampedEnd - clampedStart, EPSILON);
  const yearsPerPixel = span / safeWidth;
  const majorCount = Math.max(2, Math.floor(safeWidth / TARGET_MAJOR_SPACING_PX));
  const idealMajorStep = Math.max(span / majorCount, EPSILON);
  const candidateSteps = getCandidateSteps(idealMajorStep, yearsPerPixel);
  const visibleLayers = getVisibleTickLayers(candidateSteps, yearsPerPixel);
  const states: AxisTickRenderState[] = [];

  for (const layer of visibleLayers) {
    const ticks = getExplicitTicksForStep(clampedStart, clampedEnd, layer.step);

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
