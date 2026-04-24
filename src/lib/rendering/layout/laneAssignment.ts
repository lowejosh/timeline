import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";
import { getEffectiveTimelinePriority } from "@/lib/catalog/timelineSets";
import { getOverlayLaneStartBiasYears } from "@/lib/catalog/overlayLaneBias";

export type AssignedTimelineOverlayBand = {
  band: TimelineOverlayBand;
  laneIndex: number;
};

type CachedAssignment = {
  assigned: AssignedTimelineOverlayBand[];
  laneCount: number;
};

const laneAssignmentCache = new WeakMap<
  TimelineOverlayBand[],
  CachedAssignment
>();

function compareOverlayBandsForLaneAssignment(
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) {
  const leftBiasedStartYear =
    left.startYear + getOverlayLaneStartBiasYears(left.id);
  const rightBiasedStartYear =
    right.startYear + getOverlayLaneStartBiasYears(right.id);

  return (
    leftBiasedStartYear - rightBiasedStartYear ||
    right.endYear - left.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

function assignOverlayLanes(overlays: TimelineOverlayBand[]): CachedAssignment {
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

      return { band, laneIndex };
    });

  return {
    assigned,
    laneCount: Math.max(laneEndYears.length, 1),
  };
}

export function getAssignedOverlayLanes(
  overlays: TimelineOverlayBand[],
): CachedAssignment {
  const cached = laneAssignmentCache.get(overlays);

  if (cached) {
    return cached;
  }

  const computed = assignOverlayLanes(overlays);
  laneAssignmentCache.set(overlays, computed);
  return computed;
}
