import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";
import { getEffectiveTimelinePriority } from "@/lib/catalog/timelineSets";
import { getOverlayLaneStartBiasYears } from "@/lib/catalog/overlayLaneBias";
import { assignBandsToLanesWithAffinity } from "./laneAffinity";

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
  return assignBandsToLanesWithAffinity(
    overlays,
    compareOverlayBandsForLaneAssignment,
  );
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
