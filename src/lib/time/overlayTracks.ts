import type {
  TimelineMarker,
  TimelineOverlayBand,
  TimelineZoomVisibility,
} from "../data/timelineTypes";
import { getVisibleRange, worldToScreen, type TimelineViewport } from "./viewport";

export type ResolvedTimelineOverlayBand = {
  band: TimelineOverlayBand;
  laneIndex: number;
  laneCount: number;
  x0: number;
  x1: number;
  clippedX0: number;
  clippedX1: number;
  centerX: number;
  visibleWidth: number;
  renderX: number;
  renderWidth: number;
};

type AssignedTimelineOverlayBand = {
  band: TimelineOverlayBand;
  laneIndex: number;
};

type CachedOverlayLaneAssignment = {
  assigned: AssignedTimelineOverlayBand[];
  laneCount: number;
};

const OVERLAY_MIN_RENDER_WIDTH = 1;
const overlayLaneAssignmentCache =
  new WeakMap<TimelineOverlayBand[], CachedOverlayLaneAssignment>();
const markerSortStateCache = new WeakMap<TimelineMarker[], boolean>();

function isVisibleAtZoom(item: TimelineZoomVisibility, zoom: number) {
  if (item.minZoom !== undefined && zoom < item.minZoom) {
    return false;
  }

  if (item.maxZoom !== undefined && zoom > item.maxZoom) {
    return false;
  }

  return true;
}

function compareDecorations(
  left:
    | Pick<TimelineMarker, "id" | "priority"> & { startYear: number; endYear: number }
    | TimelineOverlayBand,
  right:
    | Pick<TimelineMarker, "id" | "priority"> & { startYear: number; endYear: number }
    | TimelineOverlayBand,
) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

function assignOverlayLanes(overlays: TimelineOverlayBand[]) {
  const laneEndYears: number[] = [];
  const assigned = [...overlays]
    .sort(compareDecorations)
    .map<AssignedTimelineOverlayBand>((band) => {
      let laneIndex = laneEndYears.findIndex(
        (laneEndYear) => band.startYear >= laneEndYear,
      );

      if (laneIndex === -1) {
        laneIndex = laneEndYears.length;
        laneEndYears.push(band.endYear);
      } else {
        laneEndYears[laneIndex] = band.endYear;
      }

      return {
        band,
        laneIndex,
      };
    });

  return {
    assigned,
    laneCount: Math.max(laneEndYears.length, 1),
  };
}

function getAssignedOverlayLanes(overlays: TimelineOverlayBand[]) {
  const cached = overlayLaneAssignmentCache.get(overlays);

  if (cached) {
    return cached;
  }

  const computed = assignOverlayLanes(overlays);
  overlayLaneAssignmentCache.set(overlays, computed);
  return computed;
}

function isMarkerArrayChronologicallySorted(markers: TimelineMarker[]) {
  const cached = markerSortStateCache.get(markers);

  if (cached !== undefined) {
    return cached;
  }

  for (let index = 1; index < markers.length; index += 1) {
    const previous = markers[index - 1];
    const current = markers[index];

    if (
      previous.year > current.year ||
      (previous.year === current.year && compareDecorations(
        {
          id: previous.id,
          startYear: previous.year,
          endYear: previous.year,
          priority: previous.priority,
        },
        {
          id: current.id,
          startYear: current.year,
          endYear: current.year,
          priority: current.priority,
        },
      ) > 0)
    ) {
      markerSortStateCache.set(markers, false);
      return false;
    }
  }

  markerSortStateCache.set(markers, true);
  return true;
}

function findFirstMarkerIndexAtOrAfter(
  markers: TimelineMarker[],
  year: number,
) {
  let low = 0;
  let high = markers.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (markers[mid].year < year) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function findFirstMarkerIndexAfter(
  markers: TimelineMarker[],
  year: number,
) {
  let low = 0;
  let high = markers.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (markers[mid].year <= year) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export function getVisibleTimelineMarkers(
  markers: TimelineMarker[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

  if (markers.length === 0) {
    return [];
  }

  if (isMarkerArrayChronologicallySorted(markers)) {
    const startIndex = findFirstMarkerIndexAtOrAfter(markers, visibleStart);
    const endIndex = findFirstMarkerIndexAfter(markers, visibleEnd);
    const visibleMarkers: TimelineMarker[] = [];

    for (let index = startIndex; index < endIndex; index += 1) {
      const marker = markers[index];

      if (isVisibleAtZoom(marker, viewport.zoom)) {
        visibleMarkers.push(marker);
      }
    }

    return visibleMarkers;
  }

  return [...markers]
    .filter(
      (marker) =>
        isVisibleAtZoom(marker, viewport.zoom) &&
        marker.year >= visibleStart &&
        marker.year <= visibleEnd,
    )
    .sort((left, right) =>
      compareDecorations(
        {
          id: left.id,
          startYear: left.year,
          endYear: left.year,
          priority: left.priority,
        },
        {
          id: right.id,
          startYear: right.year,
          endYear: right.year,
          priority: right.priority,
        },
      ),
    );
}

export function resolveTimelineOverlayTracks(
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
): ResolvedTimelineOverlayBand[] {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const { assigned, laneCount } = getAssignedOverlayLanes(overlays);
  const visibleOverlays: ResolvedTimelineOverlayBand[] = [];

  for (const { band, laneIndex } of assigned) {
    if (band.startYear > visibleEnd) {
      break;
    }

    if (!isVisibleAtZoom(band, viewport.zoom) || band.endYear < visibleStart) {
      continue;
    }

    const x0 = pad + worldToScreen(band.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(band.endYear, viewport, innerWidth);
    const clippedX0 = Math.max(x0, pad);
    const clippedX1 = Math.min(x1, width - pad);
    const clippedWidth = Math.max(clippedX1 - clippedX0, 0);

    if (clippedWidth < OVERLAY_MIN_RENDER_WIDTH) {
      continue;
    }

    const centerX =
      clippedWidth > 0
        ? clippedX0 + clippedWidth / 2
        : Math.min(Math.max((x0 + x1) / 2, pad), width - pad);
      visibleOverlays.push({
      band,
      laneIndex,
      laneCount,
      x0,
      x1,
      clippedX0,
      clippedX1,
      centerX,
      visibleWidth: clippedWidth,
      renderX: clippedX0,
      renderWidth: clippedWidth,
    });
  }

  return visibleOverlays;
}