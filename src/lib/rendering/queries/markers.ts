import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { getVisibleRange, type TimelineViewport } from "@/lib/core/viewport";
import {
  isDecorationGroupEnabled,
  isTimelineDecorationVisibleAtZoom,
} from "./visibility";
import { compareDecorations, markerAsDecoration } from "./sorting";

const markerSortStateCache = new WeakMap<TimelineMarker[], boolean>();

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
      (previous.year === current.year &&
        compareDecorations(
          markerAsDecoration(previous),
          markerAsDecoration(current),
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

function findFirstMarkerIndexAfter(markers: TimelineMarker[], year: number) {
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
  enabledGroupIds?: ReadonlySet<string> | null,
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

      if (
        isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) &&
        isDecorationGroupEnabled(marker, enabledGroupIds)
      ) {
        visibleMarkers.push(marker);
      }
    }

    return visibleMarkers;
  }

  return [...markers]
    .filter(
      (marker) =>
        isDecorationGroupEnabled(marker, enabledGroupIds) &&
        isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) &&
        marker.year >= visibleStart &&
        marker.year <= visibleEnd,
    )
    .sort((left, right) =>
      compareDecorations(markerAsDecoration(left), markerAsDecoration(right)),
    );
}
