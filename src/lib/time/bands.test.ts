import { describe, expect, it } from "vitest";
import { formatTimelineYear, getTimelineTicks } from "./bands";

describe("timeline tick generation", () => {
  it("creates a manageable number of ticks across a cosmic range", () => {
    const ticks = getTimelineTicks(-13_800_000_000, 2200, 1440);

    expect(ticks.major.length).toBeGreaterThan(1);
    expect(ticks.major.length).toBeLessThanOrEqual(12);
    expect(ticks.minor.length).toBeGreaterThan(0);
  });

  it("formats deep-time labels in billions of years ago", () => {
    expect(formatTimelineYear(-13_800_000_000, 1_000_000_000)).toContain(
      "B years ago",
    );
  });
});
