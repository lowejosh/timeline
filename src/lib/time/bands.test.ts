import { describe, expect, it } from "vitest";
import {
  formatTimelineDateLabel,
  formatTimelineElapsedAxisLabel,
  formatTimelineElapsedLabel,
  formatTimelineYear,
  getTimelineTicks,
} from "./bands";
import { TIMELINE_MIN_YEAR } from "./viewport";

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

  it("keeps marker-style deep-time labels on the default formatter", () => {
    expect(formatTimelineYear(-4_567_000_000)).toBe("4.567B years ago");
  });

  it("keeps broad axis labels in friendly billions", () => {
    expect(
      formatTimelineYear(-13_800_000_000, 1_000_000_000, { mode: "axis" }),
    ).toBe("13.8B years ago");
  });

  it("switches axis labels from billions to millions before decimals get noisy", () => {
    expect(formatTimelineYear(-13_812_345_678, 100_000, { mode: "axis" })).toBe(
      "13,812.3M years ago",
    );
  });

  it("uses thousands for mid-range prehistoric axis labels while they stay readable", () => {
    expect(formatTimelineYear(-543_210, 100, { mode: "axis" })).toBe(
      "543.2k years ago",
    );
  });

  it("falls back to raw axis labels when abbreviated units get too nitty-gritty", () => {
    expect(formatTimelineYear(-54_321, 10, { mode: "axis" })).toBe(
      "54,321 years ago",
    );
    expect(formatTimelineYear(-13_800_123, 100, { mode: "axis" })).toBe(
      "13,800,123 years ago",
    );
  });

  it("formats sub-year labels as months before day-level zoom", () => {
    expect(formatTimelineDateLabel(2024, 0.5)).toBe("Jan");
    expect(formatTimelineDateLabel(2024.5, 0.25)).toBe("Jul");
  });

  it("formats day-level sub-year labels with month and day", () => {
    expect(formatTimelineDateLabel(2024, 0.02)).toBe("Jan 1");
  });

  it("formats historical BCE years without adding an extra year", () => {
    expect(formatTimelineYear(-27)).toBe("27 BCE");
    expect(formatTimelineYear(-3000)).toBe("3,000 BCE");
  });

  it("formats sub-year long-ago labels as years and days ago", () => {
    expect(formatTimelineElapsedLabel(-54_321.5)).toMatchObject({
      primaryText: "56,347 years",
    });
    expect(formatTimelineElapsedLabel(-54_321.5)?.secondaryText).toMatch(
      /^and \d+ days ago$/,
    );
  });

  it("formats primordial sub-year labels as time after the Big Bang when requested", () => {
    expect(
      formatTimelineElapsedLabel(TIMELINE_MIN_YEAR + 1.5, "after-big-bang"),
    ).toEqual({
      primaryText: "1 year",
      secondaryText: "and 183 days after the Big Bang",
    });
  });

  it("formats primordial axis labels as time after the Big Bang before fine-grained zoom", () => {
    expect(
      formatTimelineElapsedAxisLabel(
        TIMELINE_MIN_YEAR + 50_000_000,
        10_000_000,
        "after-big-bang",
      ),
    ).toBe("50M years after the Big Bang");
  });

  it("formats exact zero elapsed primordial time as Big Bang", () => {
    expect(
      formatTimelineElapsedAxisLabel(TIMELINE_MIN_YEAR, 1, "after-big-bang"),
    ).toBe("Big Bang");
    expect(
      formatTimelineElapsedLabel(TIMELINE_MIN_YEAR, "after-big-bang"),
    ).toEqual({ primaryText: "Big Bang" });
  });
});
