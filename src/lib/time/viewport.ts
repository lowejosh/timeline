import { getPresentTimelineYear } from "./present";

export type TimelineViewport = {
  centerYear: number;
  zoom: number;
  centerYearWhole?: number;
  centerYearFraction?: number;
};

export type PreciseTimelineYear = {
  wholeYear: number;
  fraction: number;
};

export const TIMELINE_MIN_YEAR = -13_800_000_000;
export const TIMELINE_MAX_YEAR = getPresentTimelineYear();
export const MIN_ZOOM = 0;
export const MAX_ZOOM = 80;
export const BASE_YEARS_PER_PIXEL = 50_000_000;
export const HOME_RANGE: [number, number] = [1500, TIMELINE_MAX_YEAR];
const MICROSECONDS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1_000_000;
export const MIN_VISIBLE_RANGE_MICROSECONDS = 8;
const MIN_VISIBLE_RANGE_YEARS =
  MIN_VISIBLE_RANGE_MICROSECONDS / MICROSECONDS_PER_YEAR;
const PRECISION_YEARS_PER_PIXEL_FACTOR = 2;

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
  return normalizePreciseTimelineYear(year.wholeYear, year.fraction + deltaYears);
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
  return (
    left.wholeYear - right.wholeYear ||
    left.fraction - right.fraction
  );
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
): TimelineViewport {
  return {
    centerYear: toApproximateTimelineYear(centerYear),
    centerYearWhole: centerYear.wholeYear,
    centerYearFraction: centerYear.fraction,
    zoom,
  };
}

export function getMinZoomForWidth(width: number) {
  const totalRange = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
  if (totalRange <= 0 || width <= 0) return MIN_ZOOM;
  return Math.max(
    MIN_ZOOM,
    Math.log2((BASE_YEARS_PER_PIXEL * width) / totalRange),
  );
}

export function getMaxZoomForWidth(width: number) {
  const safeWidth = Math.max(width, 1);
  const maxZoomForVisibleRange = Math.log2(
    (BASE_YEARS_PER_PIXEL * safeWidth) / MIN_VISIBLE_RANGE_YEARS,
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

  return localMagnitude * Number.EPSILON * PRECISION_YEARS_PER_PIXEL_FACTOR;
}

export function getMaxZoomForViewport(centerYear: number, width: number) {
  const safeWidth = Math.max(width, 1);
  const maxZoomForVisibleRange = getMaxZoomForWidth(safeWidth);
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
  const maxZoomForVisibleRange = getMaxZoomForWidth(safeWidth);
  const precisionYearsPerPixel = getViewportPrecisionLimitedYearsPerPixel(
    viewport,
  );
  const maxZoomForPrecision = Math.log2(
    BASE_YEARS_PER_PIXEL / precisionYearsPerPixel,
  );

  return Math.min(
    maxZoomForVisibleRange,
    MAX_ZOOM,
    Math.max(MIN_ZOOM, maxZoomForPrecision),
  );
}

export function clampZoom(zoom: number, width?: number) {
  return clamp(zoom, MIN_ZOOM, width ? getMaxZoomForWidth(width) : MAX_ZOOM);
}

export function getYearsPerPixel(zoom: number) {
  return BASE_YEARS_PER_PIXEL / 2 ** clampZoom(zoom);
}

function clampCenterYear(
  centerYear: PreciseTimelineYear,
  zoom: number,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const ypp = getYearsPerPixel(zoom);
  const halfVisibleRange = ypp * (safeWidth / 2);
  const totalRange = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;

  if (halfVisibleRange * 2 >= totalRange) {
    return splitTimelineYear((TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2);
  }

  const minCenter = addPreciseTimelineYears(
    splitTimelineYear(TIMELINE_MIN_YEAR),
    halfVisibleRange,
  );
  const maxCenter = addPreciseTimelineYears(
    splitTimelineYear(TIMELINE_MAX_YEAR),
    -halfVisibleRange,
  );

  if (comparePreciseTimelineYears(centerYear, minCenter) < 0) {
    return minCenter;
  }

  if (comparePreciseTimelineYears(centerYear, maxCenter) > 0) {
    return maxCenter;
  }

  return centerYear;
}

export function clampCenter(centerYear: number, zoom: number, width: number) {
  return toApproximateTimelineYear(
    clampCenterYear(splitTimelineYear(centerYear), zoom, width),
  );
}

export function normalizeViewport(viewport: TimelineViewport, width: number) {
  const centerYear = getViewportCenterYear(viewport);
  const minZoom = getMinZoomForWidth(width);
  const zoom = clamp(
    viewport.zoom,
    minZoom,
    getMaxZoomForTimelineViewport(viewport, width),
  );

  return createViewportFromCenterYear(
    clampCenterYear(centerYear, zoom, width),
    zoom,
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

  return (
    safeWidth / 2 +
    subtractPreciseTimelineYears(year, centerYear) /
      getYearsPerPixel(normalized.zoom)
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

  return addPreciseTimelineYears(
    centerYear,
    (x - safeWidth / 2) * getYearsPerPixel(normalized.zoom),
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

  if (localX <= pad) {
    return 0;
  }

  if (localX >= safeCanvasWidth - pad) {
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
  const minZoom = getMinZoomForWidth(safeWidth);
  const zoom = clamp(
    nextZoom,
    minZoom,
    getMaxZoomForTimelineViewport(
      createViewportFromCenterYear(anchoredYear, nextZoom),
      safeWidth,
    ),
  );
  const centerYear = addPreciseTimelineYears(
    anchoredYear,
    -(anchorX - safeWidth / 2) * getYearsPerPixel(zoom),
  );

  return normalizeViewport(createViewportFromCenterYear(centerYear, zoom), safeWidth);
}

export function panByPixels(
  viewport: TimelineViewport,
  deltaPixels: number,
  width: number,
) {
  const normalized = normalizeViewport(viewport, width);
  const centerYear = getViewportCenterYear(normalized);

  return normalizeViewport(
    createViewportFromCenterYear(
      addPreciseTimelineYears(
        centerYear,
        -deltaPixels * getYearsPerPixel(normalized.zoom),
      ),
      normalized.zoom,
    ),
    width,
  );
}

export function getViewportForRange(
  startYear: number,
  endYear: number,
  width: number,
  paddingRatio = 0.12,
) {
  const safeWidth = Math.max(width, 1);
  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);
  const contentWidth = Math.max(1 - paddingRatio * 2, 0.1);
  const minYearsPerPixel = MIN_VISIBLE_RANGE_YEARS / safeWidth;
  const yearsPerPixel = Math.max(
    (maxYear - minYear) / (safeWidth * contentWidth),
    minYearsPerPixel,
  );
  const zoom = clampZoom(
    Math.log2(BASE_YEARS_PER_PIXEL / yearsPerPixel),
    safeWidth,
  );

  return normalizeViewport(
    createViewportFromCenterYear(splitTimelineYear((minYear + maxYear) / 2), zoom),
    safeWidth,
  );
}

export function getHomeViewport(width: number) {
  return getViewportForRange(HOME_RANGE[0], HOME_RANGE[1], width);
}
