import { resolveAxisTickRenderStates, projectAxisTicks } from "./axisTickStates";
import {
  EARLY_UNIVERSE_START_YEAR,
  EARLY_UNIVERSE_END_YEAR,
} from "../catalog/sets/cosmic/index";
import {
  comparePreciseTimelineYears,
  getMinZoomForWidth,
  getViewportCenterYear,
  getVisibleRangePrecise,
  normalizeViewport,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  type TimelineViewport,
} from "../core/viewport";

/** Resolve ticks and their screen geometry from the same viewport snapshot. */
export function resolveViewportAxisTicks(viewport: TimelineViewport, innerWidth: number) {
  if (!Number.isFinite(innerWidth) || innerWidth <= 0) return [];
  viewport = normalizeViewport(viewport, innerWidth);
  const [start, end] = getVisibleRangePrecise(viewport, innerWidth);
  const startYear = toApproximateTimelineYear(start);
  const endYear = toApproximateTimelineYear(end);
  const span = Math.max(Math.abs(subtractPreciseTimelineYears(end, start)), 1e-18);
  const overlap = Math.max(0,
    Math.min(endYear, EARLY_UNIVERSE_END_YEAR) -
    Math.max(startYear, EARLY_UNIVERSE_START_YEAR),
  );
  const startsAtBigBang = comparePreciseTimelineYears(start, splitTimelineYear(TIMELINE_MIN_YEAR)) === 0;
  const isFullyZoomedOut = viewport.zoom <=
    getMinZoomForWidth(innerWidth, viewport.scaleMode ?? "linear") + 0.001;
  const reference = !isFullyZoomedOut && (startsAtBigBang || overlap / span >= 0.75)
    ? "after-big-bang" : "ago";
  const ticks = resolveAxisTickRenderStates(startYear, endYear, innerWidth, {
    elapsedReference: reference,
    elapsedSubYearReference: reference,
    preciseStartYear: start,
    preciseEndYear: end,
  });
  return projectAxisTicks(
    ticks, start, end, innerWidth, viewport.scaleMode, getViewportCenterYear(viewport),
  );
}
