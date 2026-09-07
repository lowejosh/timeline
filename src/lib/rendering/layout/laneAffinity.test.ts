import { describe, expect, it } from "vitest";

import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";

import { assignBandsToLanesWithAffinity } from "./laneAffinity";

function band(
  id: string,
  startYear: number,
  endYear: number,
  laneAffinityGroupId?: string,
): TimelineOverlayBand {
  return {
    id,
    label: id,
    startYear,
    endYear,
    color: "rgb(0, 0, 0)",
    laneAffinityGroupId,
  };
}

const compareByStartYear = (
  left: TimelineOverlayBand,
  right: TimelineOverlayBand,
) => left.startYear - right.startYear;

describe("assignBandsToLanesWithAffinity", () => {
  it("reserves a sequence across gaps before placing unrelated bands", () => {
    const { assigned } = assignBandsToLanesWithAffinity([
      band("early", 0, 10, "south"), band("interloper", 12, 25), band("late", 20, 30, "south"),
    ], compareByStartYear);
    expect(assigned.find(x => x.band.id === "early")?.laneIndex).toBe(assigned.find(x => x.band.id === "late")?.laneIndex);
    expect(assigned.find(x => x.band.id === "interloper")?.laneIndex).not.toBe(assigned.find(x => x.band.id === "late")?.laneIndex);
  });

  it("keeps regions adjacent and never overlaps bands even with biased ordering", () => {
    const input = [
      { ...band("south", 0, 20), subGroup: "mesopotamia" },
      { ...band("egypt", 0, 30), subGroup: "nile" },
      { ...band("north", 2, 40), subGroup: "mesopotamia" },
      band("out-of-order", -5, 5),
    ];
    const { assigned } = assignBandsToLanesWithAffinity(input, () => 0);
    expect(Math.abs(assigned.find(x => x.band.id === "south")!.laneIndex - assigned.find(x => x.band.id === "north")!.laneIndex)).toBe(1);
    for (const a of assigned) for (const b of assigned) {
      if (a === b || a.laneIndex !== b.laneIndex) continue;
      expect(a.band.endYear <= b.band.startYear || b.band.endYear <= a.band.startYear).toBe(true);
    }
  });

  it("prefers the previous lane for non-overlapping affinity bands", () => {
    const { assigned } = assignBandsToLanesWithAffinity(
      [
        band("early-unrelated", 0, 5),
        band("sticky-a", 0, 10, "sticky"),
        band("sticky-b", 10, 20, "sticky"),
      ],
      compareByStartYear,
    );

    const stickyA = assigned.find(({ band }) => band.id === "sticky-a");
    const stickyB = assigned.find(({ band }) => band.id === "sticky-b");

    expect(stickyB?.laneIndex).toBe(stickyA?.laneIndex);
  });

  it("moves affinity bands to another lane when they overlap", () => {
    const { assigned } = assignBandsToLanesWithAffinity(
      [band("sticky-a", 0, 10, "sticky"), band("sticky-b", 5, 15, "sticky")],
      compareByStartYear,
    );

    const stickyA = assigned.find(({ band }) => band.id === "sticky-a");
    const stickyB = assigned.find(({ band }) => band.id === "sticky-b");

    expect(stickyB?.laneIndex).not.toBe(stickyA?.laneIndex);
  });
});
