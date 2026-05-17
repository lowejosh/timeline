import {
  getViewportForRange,
  normalizeViewport,
  TIMELINE_MAX_YEAR,
  type TimelineViewport,
} from "@/lib/core/viewport";
import type { TimelineSearchResult } from "@/lib/app/timelineSearch";

const SEARCH_MARKER_VISIBILITY_ZOOM_OFFSET = 4;
const SEARCH_MAX_FOCUS_ZOOM = 30;
const SEARCH_POINT_MIN_FOCUS_SPAN_YEARS = 120;
const SEARCH_DEEP_TIME_CONTEXT_FACTOR = 0.04;

function getSearchMarkerFocusSpan(year: number) {
  const yearsFromPresent = Math.abs(TIMELINE_MAX_YEAR - year);

  if (yearsFromPresent >= 1_000_000_000) {
    return Math.max(
      100_000_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 100_000_000) {
    return Math.max(
      10_000_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 1_000_000) {
    return Math.max(
      100_000,
      yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR,
    );
  }

  if (yearsFromPresent >= 100_000) {
    return Math.max(10_000, yearsFromPresent * SEARCH_DEEP_TIME_CONTEXT_FACTOR);
  }

  if (yearsFromPresent >= 10_000) {
    return Math.max(1_000, yearsFromPresent * 0.08);
  }

  if (yearsFromPresent >= 500) {
    return 250;
  }

  return SEARCH_POINT_MIN_FOCUS_SPAN_YEARS;
}

function getSearchResultFocusRange(result: TimelineSearchResult) {
  if (Math.abs(result.startYear - result.endYear) >= 1e-9) {
    return {
      endYear: result.endYear,
      startYear: result.startYear,
    };
  }

  const markerFocusSpan = getSearchMarkerFocusSpan(result.startYear);

  return {
    endYear: result.endYear + markerFocusSpan / 2,
    startYear: result.startYear - markerFocusSpan / 2,
  };
}

export function getSearchResultViewport(
  result: TimelineSearchResult,
  current: TimelineViewport,
  width: number,
) {
  const focusRange = getSearchResultFocusRange(result);
  const fitViewport = getViewportForRange(
    focusRange.startYear,
    focusRange.endYear,
    width,
    undefined,
    current.scaleMode,
  );
  const visibilityZoom = result.minZoom ?? 0;
  const maxFocusZoom = Math.min(
    SEARCH_MAX_FOCUS_ZOOM,
    result.maxZoom ?? Infinity,
  );
  let targetZoom: number;

  if (result.kind === "marker") {
    const requiredZoom = Math.min(
      maxFocusZoom,
      visibilityZoom + SEARCH_MARKER_VISIBILITY_ZOOM_OFFSET,
    );
    const desiredZoom = Math.max(
      requiredZoom,
      Math.min(fitViewport.zoom, maxFocusZoom),
    );

    targetZoom = desiredZoom;
  } else if (current.zoom > fitViewport.zoom) {
    targetZoom = fitViewport.zoom;
  } else {
    const requiredZoom = Math.min(maxFocusZoom, visibilityZoom);
    const desiredZoom = Math.max(
      requiredZoom,
      Math.min(fitViewport.zoom, maxFocusZoom),
    );

    targetZoom = desiredZoom;
  }

  return normalizeViewport(
    {
      centerYear: fitViewport.centerYear,
      scaleMode: current.scaleMode,
      zoom: targetZoom,
    },
    width,
  );
}
