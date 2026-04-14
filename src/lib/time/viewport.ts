import { getPresentTimelineYear } from "./present";

export type TimelineViewport = {
  centerYear: number;
  zoom: number;
};

export const TIMELINE_MIN_YEAR = -13_800_000_000;
export const TIMELINE_MAX_YEAR = getPresentTimelineYear();
export const MIN_ZOOM = 0;
export const MAX_ZOOM = 44;
export const BASE_YEARS_PER_PIXEL = 50_000_000;
export const HOME_RANGE: [number, number] = [1500, TIMELINE_MAX_YEAR];
const MIN_VISIBLE_RANGE_YEARS = 14 / 365.2425;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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

export function clampZoom(zoom: number, width?: number) {
  return clamp(zoom, MIN_ZOOM, width ? getMaxZoomForWidth(width) : MAX_ZOOM);
}

export function getYearsPerPixel(zoom: number) {
  return BASE_YEARS_PER_PIXEL / 2 ** clampZoom(zoom);
}

export function clampCenter(centerYear: number, zoom: number, width: number) {
  const safeWidth = Math.max(width, 1);
  const ypp = getYearsPerPixel(zoom);
  const halfVisibleRange = ypp * (safeWidth / 2);
  const totalRange = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;

  if (halfVisibleRange * 2 >= totalRange) {
    return (TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2;
  }

  return clamp(
    centerYear,
    TIMELINE_MIN_YEAR + halfVisibleRange,
    TIMELINE_MAX_YEAR - halfVisibleRange,
  );
}

export function normalizeViewport(viewport: TimelineViewport, width: number) {
  const minZoom = getMinZoomForWidth(width);
  const zoom = clamp(viewport.zoom, minZoom, getMaxZoomForWidth(width));

  return {
    zoom,
    centerYear: clampCenter(viewport.centerYear, zoom, width),
  };
}

export function worldToScreen(
  year: number,
  viewport: TimelineViewport,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const normalized = normalizeViewport(viewport, safeWidth);

  return (
    safeWidth / 2 +
    (year - normalized.centerYear) / getYearsPerPixel(normalized.zoom)
  );
}

export function screenToWorld(
  x: number,
  viewport: TimelineViewport,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const normalized = normalizeViewport(viewport, safeWidth);

  return (
    normalized.centerYear +
    (x - safeWidth / 2) * getYearsPerPixel(normalized.zoom)
  );
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

export function zoomAtPosition(
  viewport: TimelineViewport,
  nextZoom: number,
  anchorX: number,
  width: number,
) {
  const safeWidth = Math.max(width, 1);
  const rawYear = screenToWorld(anchorX, viewport, safeWidth);
  const anchoredYear = clamp(rawYear, TIMELINE_MIN_YEAR, TIMELINE_MAX_YEAR);
  const zoom = clampZoom(nextZoom, safeWidth);
  const centerYear =
    anchoredYear - (anchorX - safeWidth / 2) * getYearsPerPixel(zoom);

  return normalizeViewport({ centerYear, zoom }, safeWidth);
}

export function panByPixels(
  viewport: TimelineViewport,
  deltaPixels: number,
  width: number,
) {
  const normalized = normalizeViewport(viewport, width);

  return normalizeViewport(
    {
      ...normalized,
      centerYear:
        normalized.centerYear - deltaPixels * getYearsPerPixel(normalized.zoom),
    },
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
  const yearsPerPixel = Math.max(
    (maxYear - minYear) / (safeWidth * contentWidth),
    1e-6,
  );
  const zoom = clampZoom(
    Math.log2(BASE_YEARS_PER_PIXEL / yearsPerPixel),
    safeWidth,
  );

  return normalizeViewport(
    {
      centerYear: (minYear + maxYear) / 2,
      zoom,
    },
    safeWidth,
  );
}

export function getHomeViewport(width: number) {
  return getViewportForRange(HOME_RANGE[0], HOME_RANGE[1], width);
}
