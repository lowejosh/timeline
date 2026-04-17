import { getVisibleRange, type TimelineViewport } from "./viewport";

export const HUMAN_EVOLUTION_AUTO_HIDE_YEAR = -10_000;
const HUMAN_EVOLUTION_HIDE_RECENT_COVERAGE = 0.82;
const HUMAN_EVOLUTION_SHOW_RECENT_COVERAGE = 0.68;

export function shouldAutoSuppressHumanEvolution(
  viewport: TimelineViewport,
  width: number,
  pad: number,
  currentlySuppressed: boolean,
) {
  if (width <= pad * 2) {
    return false;
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

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