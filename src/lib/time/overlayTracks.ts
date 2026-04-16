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

const OVERLAY_MIN_RENDER_WIDTH = 1;

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

export function getVisibleTimelineMarkers(
  markers: TimelineMarker[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
) {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

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
  const { assigned, laneCount } = assignOverlayLanes(overlays);
  const visibleOverlays = assigned
    .filter(
      ({ band }) =>
        isVisibleAtZoom(band, viewport.zoom) &&
        band.endYear >= visibleStart &&
        band.startYear <= visibleEnd,
    )
    .sort((left, right) => compareDecorations(left.band, right.band));

  return visibleOverlays.flatMap(({ band, laneIndex }) => {
    const x0 = pad + worldToScreen(band.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(band.endYear, viewport, innerWidth);
    const clippedX0 = Math.max(x0, pad);
    const clippedX1 = Math.min(x1, width - pad);
    const clippedWidth = Math.max(clippedX1 - clippedX0, 0);

    if (clippedWidth < OVERLAY_MIN_RENDER_WIDTH) {
      return [];
    }

    const centerX =
      clippedWidth > 0
        ? clippedX0 + clippedWidth / 2
        : Math.min(Math.max((x0 + x1) / 2, pad), width - pad);
    const renderWidth = clippedWidth;
    const renderX = clippedX0;

    return [{
      band,
      laneIndex,
      laneCount,
      x0,
      x1,
      clippedX0,
      clippedX1,
      centerX,
      visibleWidth: clippedWidth,
      renderX,
      renderWidth,
    }];
  });
}