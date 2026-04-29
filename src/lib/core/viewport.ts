import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./timelineYears";
import {
  getLogarithmicAxisRangeFactor,
  getLogarithmicScreenDeltaFromYearsDelta,
  getLogarithmicYearsDeltaFromScreenDelta,
  resolveLogarithmicAxisGeometry,
} from "./logarithmicAxis";

export type TimelineViewport = {
  centerYear: number;
  zoom: number;
  centerYearWhole?: number;
  centerYearFraction?: number;
  scaleMode?: TimelineScaleMode;
};

export type TimelineScaleMode = "linear" | "logarithmic";

export type PreciseTimelineYear = {
  wholeYear: number;
  fraction: number;
};

export const MIN_ZOOM = 0;
export const MAX_ZOOM = 80;
export const BASE_YEARS_PER_PIXEL = 50_000_000;
export const HOME_RANGE: [number, number] = [1500, TIMELINE_MAX_YEAR];
const DAYS_PER_YEAR = 365.2425;
const HOURS_PER_DAY = 24;
const SECONDS_PER_HOUR = 3600;
const MICROSECONDS_PER_SECOND = 1_000_000;
const MICROSECONDS_PER_HOUR = SECONDS_PER_HOUR * MICROSECONDS_PER_SECOND;
export const MIN_VISIBLE_RANGE_MICROSECONDS = 1;
export const MAX_ZOOM_MICROSECOND_TICK_SPACING_PX = 1200;
export const MIN_VISIBLE_RANGE_HOURS =
  MIN_VISIBLE_RANGE_MICROSECONDS / MICROSECONDS_PER_HOUR;
export const MAX_ZOOM_HOUR_TICK_SPACING_PX =
  MAX_ZOOM_MICROSECOND_TICK_SPACING_PX * MICROSECONDS_PER_HOUR;
export const MIN_VISIBLE_RANGE_DAYS = MIN_VISIBLE_RANGE_HOURS / HOURS_PER_DAY;
export const MAX_ZOOM_DAY_TICK_SPACING_PX =
  MAX_ZOOM_HOUR_TICK_SPACING_PX * HOURS_PER_DAY;
const PRECISION_YEARS_PER_PIXEL_FACTOR = 2;
const PRIMORDIAL_PRECISION_YEARS_PER_PIXEL_FACTOR = 0.125;

export { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "./timelineYears";

export function getMinVisibleRangeMicrosecondsForWidth(width: number) {
  const safeWidth = Math.max(width, 1);

  return Math.max(
    MIN_VISIBLE_RANGE_MICROSECONDS,
    safeWidth / MAX_ZOOM_MICROSECOND_TICK_SPACING_PX,
  );
}

export function getMinVisibleRangeHoursForWidth(width: number) {
  return getMinVisibleRangeMicrosecondsForWidth(width) / MICROSECONDS_PER_HOUR;
}

export function getMinVisibleRangeDaysForWidth(width: number) {
  return getMinVisibleRangeHoursForWidth(width) / HOURS_PER_DAY;
}

function getMinVisibleRangeYearsForWidth(width: number) {
  return getMinVisibleRangeDaysForWidth(width) / DAYS_PER_YEAR;
}

function getTimelineScaleMode(viewport: TimelineViewport): TimelineScaleMode {
  return viewport.scaleMode ?? "linear";
}

function getViewportSpanFactor(width: number, scaleMode: TimelineScaleMode) {
  const safeWidth = Math.max(width, 1);

  if (scaleMode === "logarithmic") {
    return getLogarithmicAxisRangeFactor(safeWidth);
  }

  return safeWidth;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizePreciseTimelineYear(
  wholeYear: number,
  fraction: number,
): PreciseTimelineYear {
  let nextWholeYear = Math.trunc(wholeYear);
  let nextFraction = fraction;

  if (!Number.isFinite(nextFraction)) {
    nextFraction = 0;
  }

  if (nextFraction >= 1 || nextFraction < 0) {
    const carry = Math.floor(nextFraction);
    nextWholeYear += carry;
    nextFraction -= carry;
  }

  if (nextFraction < 0) {
    nextWholeYear -= 1;
    nextFraction += 1;
  }

  return {
    wholeYear: nextWholeYear,
    fraction: nextFraction,
  };
}

export function splitTimelineYear(year: number): PreciseTimelineYear {
  const wholeYear = Math.floor(year);

  return normalizePreciseTimelineYear(wholeYear, year - wholeYear);
}

export function toApproximateTimelineYear(year: PreciseTimelineYear) {
  return year.wholeYear + year.fraction;
}

export function addPreciseTimelineYears(
  year: PreciseTimelineYear,
  deltaYears: number,
) {
  return normalizePreciseTimelineYear(
    year.wholeYear,
    year.fraction + deltaYears,
  );
}

export function subtractPreciseTimelineYears(
  left: PreciseTimelineYear,
  right: PreciseTimelineYear,
) {
  return left.wholeYear - right.wholeYear + (left.fraction - right.fraction);
}

export function comparePreciseTimelineYears(
  left: PreciseTimelineYear,
  right: PreciseTimelineYear,
) {
  return left.wholeYear - right.wholeYear || left.fraction - right.fraction;
}

export function getViewportCenterYear(
  viewport: TimelineViewport,
): PreciseTimelineYear {
  if (
    viewport.centerYearWhole !== undefined &&
    viewport.centerYearFraction !== undefined
  ) {
    return normalizePreciseTimelineYear(
      viewport.centerYearWhole,
      viewport.centerYearFraction,
    );
  }

  return splitTimelineYear(viewport.centerYear);
}

function createViewportFromCenterYear(
  centerYear: PreciseTimelineYear,
  zoom: number,
  scaleMode: TimelineScaleMode = "linear",
): TimelineViewport {
  return {
    centerYear: toApproximateTimelineYear(centerYear),
    centerYearWhole: centerYear.wholeYear,
    centerYearFraction: centerYear.fraction,
    zoom,
    ...(scaleMode === "logarithmic" ? { scaleMode } : {}),
  };
}

export function getMinZoomForWidth(
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  const totalRange = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
  if (totalRange <= 0 || width <= 0) return MIN_ZOOM;
  return Math.max(
    MIN_ZOOM,
    Math.log2(
      (BASE_YEARS_PER_PIXEL * getViewportSpanFactor(width, scaleMode)) /
        totalRange,
    ),
  );
}

export function getMaxZoomForWidth(
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  const safeWidth = Math.max(width, 1);
  const minVisibleRangeYears = getMinVisibleRangeYearsForWidth(safeWidth);
  const maxZoomForVisibleRange = Math.log2(
    (BASE_YEARS_PER_PIXEL * getViewportSpanFactor(safeWidth, scaleMode)) /
      minVisibleRangeYears,
  );

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, maxZoomForVisibleRange));
}

export function getPrecisionLimitedYearsPerPixel(centerYear: number) {
  const magnitude = Math.max(Math.abs(centerYear), 1);

  return magnitude * Number.EPSILON * PRECISION_YEARS_PER_PIXEL_FACTOR;
}

export function getViewportPrecisionLimitedYearsPerPixel(
  viewport: TimelineViewport,
) {
  const centerYear = getViewportCenterYear(viewport);
  const localMagnitude = Math.max(Math.abs(centerYear.fraction), 1);
  const precisionFactor =
    centerYear.wholeYear === Math.floor(TIMELINE_MIN_YEAR)
      ? PRIMORDIAL_PRECISION_YEARS_PER_PIXEL_FACTOR
      : PRECISION_YEARS_PER_PIXEL_FACTOR;

  return localMagnitude * Number.EPSILON * precisionFactor;
}

export function getMaxZoomForViewport(
  centerYear: number,
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  const safeWidth = Math.max(width, 1);
  const maxZoomForVisibleRange = getMaxZoomForWidth(safeWidth, scaleMode);
  const precisionYearsPerPixel = getPrecisionLimitedYearsPerPixel(centerYear);
  const maxZoomForPrecision = Math.log2(
    BASE_YEARS_PER_PIXEL / precisionYearsPerPixel,
  );

  return Math.min(
    maxZoomForVisibleRange,
    MAX_ZOOM,
    Math.max(MIN_ZOOM, maxZoomForPrecision),
  );
}

export function getMaxZoomForTimelineViewport(
  viewport: TimelineViewport,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const maxZoomForVisibleRange = getMaxZoomForWidth(
    safeWidth,
    getTimelineScaleMode(viewport),
  );
  const precisionYearsPerPixel =
    getViewportPrecisionLimitedYearsPerPixel(viewport);
  const maxZoomForPrecision = Math.log2(
    BASE_YEARS_PER_PIXEL / precisionYearsPerPixel,
  );

  return Math.min(
    maxZoomForVisibleRange,
    MAX_ZOOM,
    Math.max(MIN_ZOOM, maxZoomForPrecision),
  );
}

export function clampZoom(
  zoom: number,
  width?: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  return clamp(
    zoom,
    MIN_ZOOM,
    width ? getMaxZoomForWidth(width, scaleMode) : MAX_ZOOM,
  );
}

export function getYearsPerPixel(zoom: number) {
  return BASE_YEARS_PER_PIXEL / 2 ** clampZoom(zoom);
}

function getScreenDeltaForYearDelta(
  deltaYears: number,
  zoom: number,
  scaleMode: TimelineScaleMode,
) {
  if (scaleMode === "logarithmic") {
    return getLogarithmicScreenDeltaFromYearsDelta(
      deltaYears,
      resolveLogarithmicAxisGeometry(getYearsPerPixel(zoom)),
    );
  }

  return deltaYears / getYearsPerPixel(zoom);
}

function getYearDeltaForScreenDelta(
  deltaPixels: number,
  zoom: number,
  scaleMode: TimelineScaleMode,
) {
  if (scaleMode === "logarithmic") {
    return getLogarithmicYearsDeltaFromScreenDelta(
      deltaPixels,
      resolveLogarithmicAxisGeometry(getYearsPerPixel(zoom)),
    );
  }

  return deltaPixels * getYearsPerPixel(zoom);
}

function clampCenterYear(
  centerYear: PreciseTimelineYear,
  zoom: number,
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  const safeWidth = Math.max(width, 1);
  const leftOffset = getYearDeltaForScreenDelta(
    -safeWidth / 2,
    zoom,
    scaleMode,
  );
  const rightOffset = getYearDeltaForScreenDelta(
    safeWidth / 2,
    zoom,
    scaleMode,
  );
  const visibleRange = rightOffset - leftOffset;
  const totalRange = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;

  if (visibleRange >= totalRange) {
    return splitTimelineYear((TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2);
  }

  const minCenter = addPreciseTimelineYears(
    splitTimelineYear(TIMELINE_MIN_YEAR),
    -leftOffset,
  );
  const maxCenter = addPreciseTimelineYears(
    splitTimelineYear(TIMELINE_MAX_YEAR),
    -rightOffset,
  );

  if (comparePreciseTimelineYears(centerYear, minCenter) < 0) {
    return minCenter;
  }

  if (comparePreciseTimelineYears(centerYear, maxCenter) > 0) {
    return maxCenter;
  }

  return centerYear;
}

export function clampCenter(
  centerYear: number,
  zoom: number,
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  return toApproximateTimelineYear(
    clampCenterYear(splitTimelineYear(centerYear), zoom, width, scaleMode),
  );
}

export function normalizeViewport(viewport: TimelineViewport, width: number) {
  const centerYear = getViewportCenterYear(viewport);
  const scaleMode = getTimelineScaleMode(viewport);
  const minZoom = getMinZoomForWidth(width, scaleMode);
  const zoom = clamp(
    viewport.zoom,
    minZoom,
    getMaxZoomForTimelineViewport(viewport, width),
  );

  return createViewportFromCenterYear(
    clampCenterYear(centerYear, zoom, width, scaleMode),
    zoom,
    scaleMode,
  );
}

export function worldPreciseToScreen(
  year: PreciseTimelineYear,
  viewport: TimelineViewport,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const normalized = normalizeViewport(viewport, safeWidth);
  const centerYear = getViewportCenterYear(normalized);
  const scaleMode = getTimelineScaleMode(normalized);

  return (
    safeWidth / 2 +
    getScreenDeltaForYearDelta(
      subtractPreciseTimelineYears(year, centerYear),
      normalized.zoom,
      scaleMode,
    )
  );
}

export function worldToScreen(
  year: number,
  viewport: TimelineViewport,
  width: number,
) {
  return worldPreciseToScreen(splitTimelineYear(year), viewport, width);
}

export function screenToWorldPrecise(
  x: number,
  viewport: TimelineViewport,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const normalized = normalizeViewport(viewport, safeWidth);
  const centerYear = getViewportCenterYear(normalized);
  const scaleMode = getTimelineScaleMode(normalized);

  return addPreciseTimelineYears(
    centerYear,
    getYearDeltaForScreenDelta(x - safeWidth / 2, normalized.zoom, scaleMode),
  );
}

export function screenToWorld(
  x: number,
  viewport: TimelineViewport,
  width: number,
) {
  return toApproximateTimelineYear(screenToWorldPrecise(x, viewport, width));
}

export function getZoomAnchorForCanvasX(
  localX: number,
  canvasWidth: number,
  pad: number,
) {
  const safeCanvasWidth = Math.max(canvasWidth, pad * 2 + 1);
  const innerWidth = Math.max(safeCanvasWidth - pad * 2, 1);
  const edgeAnchorGrace = Math.min(
    56,
    Math.max(24, innerWidth * 0.06),
    innerWidth * 0.16,
  );

  if (localX <= pad + edgeAnchorGrace) {
    return 0;
  }

  if (localX >= safeCanvasWidth - pad - edgeAnchorGrace) {
    return innerWidth;
  }

  return clamp(localX - pad, 0, innerWidth);
}

export function getVisibleRange(viewport: TimelineViewport, width: number) {
  return [
    screenToWorld(0, viewport, width),
    screenToWorld(width, viewport, width),
  ] as const;
}

export function getVisibleRangePrecise(
  viewport: TimelineViewport,
  width: number,
) {
  return [
    screenToWorldPrecise(0, viewport, width),
    screenToWorldPrecise(width, viewport, width),
  ] as const;
}

export function zoomAtPosition(
  viewport: TimelineViewport,
  nextZoom: number,
  anchorX: number,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const anchoredYear = screenToWorldPrecise(anchorX, viewport, safeWidth);
  const scaleMode = getTimelineScaleMode(viewport);
  const minZoom = getMinZoomForWidth(safeWidth, scaleMode);
  const zoom = clamp(
    nextZoom,
    minZoom,
    getMaxZoomForTimelineViewport(
      createViewportFromCenterYear(anchoredYear, nextZoom, scaleMode),
      safeWidth,
    ),
  );
  const centerYear = addPreciseTimelineYears(
    anchoredYear,
    -getYearDeltaForScreenDelta(anchorX - safeWidth / 2, zoom, scaleMode),
  );

  return normalizeViewport(
    createViewportFromCenterYear(centerYear, zoom, scaleMode),
    safeWidth,
  );
}

export function panByPixels(
  viewport: TimelineViewport,
  deltaPixels: number,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const normalized = normalizeViewport(viewport, safeWidth);
  const scaleMode = getTimelineScaleMode(normalized);
  const centerYear = getViewportCenterYear(normalized);
  const nextCenterYear =
    scaleMode === "logarithmic"
      ? screenToWorldPrecise(safeWidth / 2 - deltaPixels, normalized, safeWidth)
      : addPreciseTimelineYears(
          centerYear,
          -deltaPixels * getYearsPerPixel(normalized.zoom),
        );

  return normalizeViewport(
    createViewportFromCenterYear(nextCenterYear, normalized.zoom, scaleMode),
    safeWidth,
  );
}

export function getViewportForRange(
  startYear: number,
  endYear: number,
  width: number,
  paddingRatio = 0.12,
  scaleMode: TimelineScaleMode = "linear",
) {
  const safeWidth = Math.max(width, 1);
  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);
  const contentWidth = Math.max(1 - paddingRatio * 2, 0.1);
  const drawableSpanFactor = getViewportSpanFactor(
    safeWidth * contentWidth,
    scaleMode,
  );
  const minYearsPerPixel =
    getMinVisibleRangeYearsForWidth(safeWidth) /
    getViewportSpanFactor(safeWidth, scaleMode);
  const yearsPerPixel = Math.max(
    (maxYear - minYear) / drawableSpanFactor,
    minYearsPerPixel,
  );
  const zoom = clampZoom(
    Math.log2(BASE_YEARS_PER_PIXEL / yearsPerPixel),
    safeWidth,
    scaleMode,
  );

  return normalizeViewport(
    createViewportFromCenterYear(
      splitTimelineYear((minYear + maxYear) / 2),
      zoom,
      scaleMode,
    ),
    safeWidth,
  );
}

export function getHomeViewport(
  width: number,
  scaleMode: TimelineScaleMode = "linear",
) {
  return getViewportForRange(
    HOME_RANGE[0],
    HOME_RANGE[1],
    width,
    0,
    scaleMode,
  );
}
