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
  const lanes: T[][] = [];
  const affinityLaneById = new Map<string, number>();
  // Place a whole sequence together so unrelated later bands cannot steal its lane.
  // Check full intervals: catalog ordering can include a start-date bias.
  const sequences = new Map<string, T[]>();
  for (const band of [...bands].sort(compareBands)) {
    const key = band.laneAffinityGroupId ? `affinity:${band.laneAffinityGroupId}` : `band:${band.id}`;
    const sequence = sequences.get(key) ?? [];
    sequence.push(band);
    sequences.set(key, sequence);
  }
  const sequenceRegions = new Map<string, number>();
  const orderedSequences = [...sequences.values()];
  for (const sequence of orderedSequences) {
    const region = sequence[0].subGroup ?? "";
    if (!sequenceRegions.has(region)) sequenceRegions.set(region, sequenceRegions.size);
  }
  orderedSequences.sort((a, b) => sequenceRegions.get(a[0].subGroup ?? "")! - sequenceRegions.get(b[0].subGroup ?? "")!);
  const assigned = orderedSequences.flat().map<AssignedLaneBand<T>>(
    (band) => {
      const fits = (lane: T[]) => lane.every(other => band.startYear >= other.endYear || band.endYear <= other.startYear);
      const preferredLaneIndex = band.laneAffinityGroupId
        ? affinityLaneById.get(band.laneAffinityGroupId)
        : undefined;
      let laneIndex =
        preferredLaneIndex !== undefined &&
        fits(lanes[preferredLaneIndex])
          ? preferredLaneIndex
          : lanes.findIndex(
              (lane) => fits(lane) && !!band.subGroup && lane.some(other => other.subGroup === band.subGroup),
            );

      if (laneIndex === -1) laneIndex = lanes.findIndex(fits);

      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push([band]);
      } else {
        lanes[laneIndex].push(band);
      }

      if (band.laneAffinityGroupId) {
        affinityLaneById.set(band.laneAffinityGroupId, laneIndex);
      }

      return { band, laneIndex };
    },
  );

  // Put lanes with the same regional home beside one another, without adding rows.
  const regionOrder = new Map<string, number>();
  const laneOrder = lanes.map((lane, index) => {
    const counts = new Map<string, number>();
    for (const band of lane) if (band.subGroup) counts.set(band.subGroup, (counts.get(band.subGroup) ?? 0) + 1);
    const region = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? `lane:${index}`;
    if (!regionOrder.has(region)) regionOrder.set(region, regionOrder.size);
    return { index, region: regionOrder.get(region)! };
  }).sort((a, b) => a.region - b.region || a.index - b.index);
  // Shared rows can have a different regional home in different centuries.
  // Reduce gaps for every represented region, not just the first occupant.
  const regionalLanes = new Map<string, Set<number>>();
  lanes.forEach((lane, index) => {
    for (const band of lane) if (band.subGroup) {
      const members = regionalLanes.get(band.subGroup) ?? new Set<number>();
      members.add(index); regionalLanes.set(band.subGroup, members);
    }
  });
  const gapCost = () => {
    const positions = new Map(laneOrder.map((lane, index) => [lane.index, index]));
    let gaps = 0;
    for (const members of regionalLanes.values()) {
      if (members.size < 2) continue;
      const indices = [...members].map(index => positions.get(index)!);
      gaps += Math.max(...indices) - Math.min(...indices) + 1 - members.size;
    }
    return gaps;
  };
  let cost = gapCost();
  for (let pass = 0; pass < lanes.length; pass++) {
    let improved = false;
    for (let i = 0; i < laneOrder.length - 1; i++) {
      [laneOrder[i], laneOrder[i + 1]] = [laneOrder[i + 1], laneOrder[i]];
      const nextCost = gapCost();
      if (nextCost < cost) { cost = nextCost; improved = true; }
      else [laneOrder[i], laneOrder[i + 1]] = [laneOrder[i + 1], laneOrder[i]];
    }
    if (!improved) break;
  }
  const remap = new Map(laneOrder.map((lane, index) => [lane.index, index]));

  return {
    assigned: assigned.map(entry => ({ ...entry, laneIndex: remap.get(entry.laneIndex)! })),
    laneCount: Math.max(lanes.length, 1),
  };
}
