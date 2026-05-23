import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";

export type AssignedLaneBand<T extends TimelineOverlayBand> = {
  band: T;
  laneIndex: number;
};

export type LaneAssignment<T extends TimelineOverlayBand> = {
  assigned: AssignedLaneBand<T>[];
  laneCount: number;
};

export function assignBandsToLanesWithAffinity<T extends TimelineOverlayBand>(
  bands: T[],
  compareBands: (left: T, right: T) => number,
): LaneAssignment<T> {
  const laneEndYears: number[] = [];
  const affinityLaneById = new Map<string, number>();

  const assigned = [...bands].sort(compareBands).map<AssignedLaneBand<T>>(
    (band) => {
      const preferredLaneIndex = band.laneAffinityGroupId
        ? affinityLaneById.get(band.laneAffinityGroupId)
        : undefined;
      let laneIndex =
        preferredLaneIndex !== undefined &&
        band.startYear >= laneEndYears[preferredLaneIndex]
          ? preferredLaneIndex
          : laneEndYears.findIndex(
              (laneEndYear) => band.startYear >= laneEndYear,
            );

      if (laneIndex === -1) {
        laneIndex = laneEndYears.length;
        laneEndYears.push(band.endYear);
      } else {
        laneEndYears[laneIndex] = band.endYear;
      }

      if (band.laneAffinityGroupId) {
        affinityLaneById.set(band.laneAffinityGroupId, laneIndex);
      }

      return { band, laneIndex };
    },
  );

  return {
    assigned,
    laneCount: Math.max(laneEndYears.length, 1),
  };
}
