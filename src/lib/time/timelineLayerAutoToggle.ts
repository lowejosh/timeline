import { getVisibleRange, type TimelineViewport } from "./viewport";

export const HUMAN_EVOLUTION_AUTO_HIDE_YEAR = -10_000;
export const CIVILIZATIONS_AUTO_HIDE_YEAR = 1_800;
const HUMAN_EVOLUTION_HIDE_RECENT_COVERAGE = 0.82;
const HUMAN_EVOLUTION_SHOW_RECENT_COVERAGE = 0.68;

function getVisibleRangeBounds(
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  if (width <= pad * 2) {
    return null;
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

  return { visibleStart, visibleEnd };
}

export function shouldAutoSuppressHumanEvolution(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  const bounds = getVisibleRangeBounds(viewport, width, pad);

  if (!bounds) {
    return false;
  }

  const { visibleStart, visibleEnd } = bounds;

  if (visibleEnd <= HUMAN_EVOLUTION_AUTO_HIDE_YEAR) {
    return false;
  }

  if (visibleStart >= HUMAN_EVOLUTION_AUTO_HIDE_YEAR) {
    return true;
  }

  const visibleSpan = Math.max(visibleEnd - visibleStart, 1);
  const recentSpan = Math.max(
    0,
    visibleEnd - Math.max(visibleStart, HUMAN_EVOLUTION_AUTO_HIDE_YEAR),
  );
  const recentCoverage = recentSpan / visibleSpan;
  const threshold = currentlySuppressed
    ? HUMAN_EVOLUTION_SHOW_RECENT_COVERAGE
    : HUMAN_EVOLUTION_HIDE_RECENT_COVERAGE;

  return recentCoverage >= threshold;
}

export function shouldAutoSuppressCivilizations(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  const bounds = getVisibleRangeBounds(viewport, width, pad);

  if (!bounds) {
    return false;
  }

  const { visibleStart, visibleEnd } = bounds;

  if (visibleEnd <= CIVILIZATIONS_AUTO_HIDE_YEAR) {
    return false;
  }

  if (visibleStart >= CIVILIZATIONS_AUTO_HIDE_YEAR) {
    return true;
  }

  const visibleSpan = Math.max(visibleEnd - visibleStart, 1);
  const postCivilizationSpan = Math.max(
    0,
    visibleEnd - Math.max(visibleStart, CIVILIZATIONS_AUTO_HIDE_YEAR),
  );
  const postCivilizationCoverage = postCivilizationSpan / visibleSpan;
  const threshold = currentlySuppressed
    ? HUMAN_EVOLUTION_SHOW_RECENT_COVERAGE
    : HUMAN_EVOLUTION_HIDE_RECENT_COVERAGE;

  return postCivilizationCoverage >= threshold;
}
