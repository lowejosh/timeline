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
