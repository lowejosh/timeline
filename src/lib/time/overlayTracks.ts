import type {
  TimelineMarker,
  TimelineOverlayBand,
  TimelineZoomVisibility,
} from "../data/timelineTypes";
import { getEffectiveTimelinePriority } from "../data/timelineSets";
import {
  getVisibleRange,
  worldToScreen,
  type TimelineViewport,
} from "./viewport";

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
  renderAlphaMultiplier: number;
  isHairline: boolean;
};

type AssignedTimelineOverlayBand = {
  band: TimelineOverlayBand;
  laneIndex: number;
};

type CachedOverlayLaneAssignment = {
  assigned: AssignedTimelineOverlayBand[];
  laneCount: number;
};

const OVERLAY_MIN_VISIBLE_WIDTH_DEVICE_PX = 0.5;
const PRIORITY_ZOOM_GRACE_START = 75;
const PRIORITY_ZOOM_GRACE_STEP = 5;
const PRIORITY_ZOOM_GRACE_MAX = 5;
const CHINA_OVERLAY_LANE_START_BIAS_YEARS = -250;
const HOMO_SAPIENS_OVERLAY_LANE_START_BIAS_YEARS = -7_000_000;
const overlayLaneAssignmentCache = new WeakMap<
  TimelineOverlayBand[],
  CachedOverlayLaneAssignment
>();
const markerSortStateCache = new WeakMap<TimelineMarker[], boolean>();

function resolveOverlayRenderGeometry(
  clippedX0: number,
  clippedX1: number,
  minX: number,
  maxX: number,
  devicePixelRatio: number,
) {
  const visibleWidth = Math.max(clippedX1 - clippedX0, 0);
  const pixelRatio = Math.max(devicePixelRatio, 1);
  const minVisibleWidth = OVERLAY_MIN_VISIBLE_WIDTH_DEVICE_PX / pixelRatio;
  const minRenderWidth = 1 / pixelRatio;

  if (visibleWidth < minVisibleWidth) {
    return null;
  }

  if (visibleWidth >= minRenderWidth) {
    return {
      visibleWidth,
      renderX: clippedX0,
      renderWidth: visibleWidth,
      renderAlphaMultiplier: 1,
      isHairline: false,
    };
  }

  const midpoint = (clippedX0 + clippedX1) / 2;
  const pixelStep = 1 / pixelRatio;
  const maxRenderX = Math.max(minX, maxX - minRenderWidth);
  const snappedRenderX =
    Math.round((midpoint - minRenderWidth / 2) / pixelStep) * pixelStep;
  const renderX = Math.min(Math.max(snappedRenderX, minX), maxRenderX);

  return {
    visibleWidth,
    renderX,
    renderWidth: minRenderWidth,
    renderAlphaMultiplier: visibleWidth / minRenderWidth,
    isHairline: true,
  };
}

function getPriorityZoomGrace(
  item: TimelineZoomVisibility & {
    priority?: number;
  },
) {
  const priority = item.priority ?? 0;

  if (priority < PRIORITY_ZOOM_GRACE_START) {
    return 0;
  }

  return Math.min(
    PRIORITY_ZOOM_GRACE_MAX,
    Math.floor(
      (priority - PRIORITY_ZOOM_GRACE_START) / PRIORITY_ZOOM_GRACE_STEP,
    ) + 1,
  );
}

export function isTimelineDecorationVisibleAtZoom(
  item: TimelineZoomVisibility & {
    priority?: number;
  },
  zoom: number,
) {
  const effectiveMinZoom =
    item.minZoom === undefined
      ? undefined
      : item.minZoom - getPriorityZoomGrace(item);

  if (effectiveMinZoom !== undefined && zoom < effectiveMinZoom) {
    return false;
  }

  if (item.maxZoom !== undefined && zoom > item.maxZoom) {
    return false;
  }

  return true;
}

function isDecorationGroupEnabled(
  item: Pick<TimelineMarker | TimelineOverlayBand, "groupId">,
  enabledGroupIds?: ReadonlySet<string> | null,
) {
  if (!enabledGroupIds || !item.groupId) {
    return true;
  }

  return enabledGroupIds.has(item.groupId);
}

function compareDecorations(
  left:
    | (Pick<TimelineMarker, "id" | "priority"> & {
        startYear: number;
        endYear: number;
      })
    | TimelineOverlayBand,
  right:
    | (Pick<TimelineMarker, "id" | "priority"> & {
        startYear: number;
        endYear: number;
      })
    | TimelineOverlayBand,
) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

function compareOverlayBandsForLaneAssignment(
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) {
  const leftBiasedStartYear = left.startYear + getOverlayLaneStartBias(left.id);
  const rightBiasedStartYear =
    right.startYear + getOverlayLaneStartBias(right.id);

  return (
    leftBiasedStartYear - rightBiasedStartYear ||
    right.endYear - left.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

function getOverlayLaneStartBias(id: string) {
  switch (id) {
    case "chinese-civilization":
      return CHINA_OVERLAY_LANE_START_BIAS_YEARS;
    case "homo-sapiens":
      return HOMO_SAPIENS_OVERLAY_LANE_START_BIAS_YEARS;
    default:
      return 0;
  }
}

function assignOverlayLanes(overlays: TimelineOverlayBand[]) {
  const laneEndYears: number[] = [];
  const assigned = [...overlays]
    .sort(compareOverlayBandsForLaneAssignment)
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
      (previous.year === current.year &&
        compareDecorations(
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
  devicePixelRatio = 1,
  enabledGroupIds?: ReadonlySet<string> | null,
): ResolvedTimelineOverlayBand[] {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const enabledOverlays = overlays.filter((overlay) =>
    isDecorationGroupEnabled(overlay, enabledGroupIds),
  );

  if (enabledOverlays.length === 0) {
    return [];
  }

  const { assigned, laneCount } = getAssignedOverlayLanes(enabledOverlays);
  const visibleOverlays: ResolvedTimelineOverlayBand[] = [];

  for (const { band, laneIndex } of assigned) {
    if (band.startYear > visibleEnd) {
      break;
    }

    if (
      !isTimelineDecorationVisibleAtZoom(band, viewport.zoom) ||
      band.endYear < visibleStart
    ) {
      continue;
    }

    const x0 = pad + worldToScreen(band.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(band.endYear, viewport, innerWidth);
    const clippedX0 = Math.max(x0, pad);
    const clippedX1 = Math.min(x1, width - pad);
    const renderGeometry = resolveOverlayRenderGeometry(
      clippedX0,
      clippedX1,
      pad,
      width - pad,
      devicePixelRatio,
    );

    if (!renderGeometry) {
      continue;
    }

    const centerX =
      renderGeometry.visibleWidth > 0
        ? clippedX0 + renderGeometry.visibleWidth / 2
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
      visibleWidth: renderGeometry.visibleWidth,
      renderX: renderGeometry.renderX,
      renderWidth: renderGeometry.renderWidth,
      renderAlphaMultiplier: renderGeometry.renderAlphaMultiplier,
      isHairline: renderGeometry.isHairline,
    });
  }

  return visibleOverlays;
}
