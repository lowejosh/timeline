import { describe, expect, it } from "vitest";
import {
  formatApproximateLabel,
  formatTimelineDateLabel,
  formatTimelineElapsedAxisLabel,
  formatTimelineElapsedAxisLabelLines,
  formatTimelineElapsedLabel,
  formatTimelinePointLabel,
  formatTimelineRange,
  formatTimelineYear,
  getTimelineYearFromUtcParts,
  getTimelineTicks,
} from "../bands";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../exactTimestamp";
import { TIMELINE_MIN_YEAR } from "../viewport";

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

  it("formats BCE sub-year labels using calendar dates", () => {
    const caesarDate = getTimelineYearFromExactTimestamp(
      createExactCalendarTimestamp({
        era: "bce",
        year: 44,
        month: 3,
        day: 15,
        hour: 12,
        precision: "hour",
      }),
    );

    expect(formatTimelineDateLabel(caesarDate, 0.02)).toBe("Mar 15");
    expect(formatTimelineDateLabel(caesarDate, 1e-7)).toBe("12:00:00");
    expect(formatTimelineYear(caesarDate, 1)).toBe("44 BCE");
  });

  it("formats CE sub-year labels down to milliseconds", () => {
    const titanicSinksAt = getTimelineYearFromUtcParts(1912, 3, 15, 2, 20, 0, 123);

    expect(formatTimelineDateLabel(titanicSinksAt, 1e-7)).toBe("02:20:00");
    expect(formatTimelineDateLabel(titanicSinksAt, 1e-12)).toMatch(
      /^02:20:00\.12[23]\d{3}$/,
    );
  });

  it("converts UTC date parts into fractional timeline years", () => {
    const titanicSinksAt = getTimelineYearFromUtcParts(1912, 3, 15, 2, 20);

    expect(titanicSinksAt).toBeGreaterThan(1912);
    expect(titanicSinksAt).toBeLessThan(1913);
    expect(titanicSinksAt).toBeCloseTo(1912.287, 3);
  });

  it("formats historical BCE years without adding an extra year", () => {
    expect(formatTimelineYear(-27)).toBe("27 BCE");
    expect(formatTimelineYear(-3000)).toBe("3,000 BCE");
  });

  it("prefixes approximate labels with a tilde only once", () => {
    expect(formatApproximateLabel("3,000 BCE", true)).toBe("~3,000 BCE");
    expect(formatApproximateLabel("~3,000 BCE", true)).toBe("~3,000 BCE");
  });

  it("formats approximate point labels from timeline years", () => {
    expect(formatTimelinePointLabel(-1200, { approximate: true })).toBe(
      "~1,200 BCE",
    );
    expect(
      formatTimelinePointLabel(-3000, {
        label: "3,000 BCE",
        approximate: true,
      }),
    ).toBe("~3,000 BCE");
  });

  it("formats approximate range labels boundary by boundary", () => {
    expect(
      formatTimelineRange(-3300, -1200, {
        approximateStart: true,
        approximateEnd: true,
      }),
    ).toBe("~3,300 BCE — ~1,200 BCE");
    expect(
      formatTimelineRange(-3500, -539, {
        approximateStart: true,
      }),
    ).toBe("~3,500 BCE — 539 BCE");
  });

  it("formats sub-year long-ago labels as years and days ago", () => {
    expect(formatTimelineElapsedLabel(-54_321.5)).toMatchObject({
      primaryText: "56,347 years and 288 days",
    });
    expect(formatTimelineElapsedLabel(-54_321.5)?.secondaryText).toMatch(
      /hours.*ago$/,
    );
  });

  it("formats primordial sub-year labels as time after the Big Bang when requested", () => {
    expect(
      formatTimelineElapsedLabel(TIMELINE_MIN_YEAR + 1.5, "after-big-bang"),
    ).toEqual({
      primaryText: "1 year and 182 days",
      secondaryText: "14 hours, 54 minutes, and 36 seconds after the Big Bang",
    });
  });

  it("formats elapsed sub-day labels with explicit named units", () => {
    expect(
      formatTimelineElapsedLabel(-54_321.500001),
    ).toMatchObject({
      primaryText: "56,347 years and 288 days",
      secondaryText: expect.stringContaining("seconds"),
    });
    expect(
      formatTimelineElapsedAxisLabel(-54_321.500001, 1e-14, "ago"),
    ).toContain("µs ago");
  });

  it("only includes elapsed units as fine as the current axis step requires", () => {
    const yearsPerMinute = 1 / 365.2425 / 24 / 60;
    expect(
      formatTimelineElapsedAxisLabel(-54_321.500001, yearsPerMinute, "ago"),
    ).toContain("m ago");
    expect(
      formatTimelineElapsedAxisLabel(-54_321.500001, yearsPerMinute, "ago"),
    ).not.toContain("s ago");
    expect(
      formatTimelineElapsedAxisLabel(-54_321.500001, yearsPerMinute, "ago"),
    ).not.toContain("ms ago");
    expect(
      formatTimelineElapsedAxisLabel(-54_321.500001, yearsPerMinute, "ago"),
    ).not.toContain("µs ago");
  });

  it("keeps deep-time elapsed microsecond labels distinct at huge year magnitudes", () => {
    const yearsPerMicrosecond = 1 / 365.2425 / 24 / 60 / 60 / 1_000_000;
    const first = {
      wholeYear: -2_315_232_129,
      fraction: 0.5000001,
    };
    const second = {
      wholeYear: -2_315_232_129,
      fraction: 0.5000001 + yearsPerMicrosecond * 12,
    };

    const firstLabel = formatTimelineElapsedAxisLabelLines(
      first,
      yearsPerMicrosecond,
      "ago",
    );
    const secondLabel = formatTimelineElapsedAxisLabelLines(
      second,
      yearsPerMicrosecond,
      "ago",
    );

    expect(`${firstLabel.primaryText} ${firstLabel.secondaryText ?? ""}`).not.toBe(
      `${secondLabel.primaryText} ${secondLabel.secondaryText ?? ""}`,
    );
  });

  it("never prefixes Big Bang microsecond labels with zero years", () => {
    const yearsPerMicrosecond = 1 / 365.2425 / 24 / 60 / 60 / 1_000_000;

    expect(
      formatTimelineElapsedAxisLabelLines(
        {
          wholeYear: TIMELINE_MIN_YEAR,
          fraction: yearsPerMicrosecond * 64,
        },
        yearsPerMicrosecond,
        "after-big-bang",
      ),
    ).toEqual({
      primaryText: "64µs",
      secondaryText: "after the Big Bang",
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

  it("includes day detail on elapsed axis label lines for sub-year zoom levels", () => {
    expect(
      formatTimelineElapsedAxisLabelLines(
        TIMELINE_MIN_YEAR + 1.5,
        1 / 12,
        "after-big-bang",
      ),
    ).toEqual({
      primaryText: "1y 182d",
      secondaryText: "after the Big Bang",
    });
  });

  it("keeps years and days visible on the primary elapsed line while finer units move to the secondary line", () => {
    const yearsPerHour = 1 / 365.2425 / 24;

    expect(
      formatTimelineElapsedAxisLabelLines(
        TIMELINE_MIN_YEAR + 1.5,
        yearsPerHour,
        "after-big-bang",
      ),
    ).toEqual({
      primaryText: "1y 182d",
      secondaryText: "14h after the Big Bang",
    });
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
