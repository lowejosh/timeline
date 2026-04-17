import { describe, expect, it } from "vitest";
import { getTimelineYearFromUtcParts } from "../bands";
import {
  createExactCalendarTimestamp,
  createExactElapsedTimestamp,
  formatTimelineExactTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../exactTimestamp";

describe("exact timeline timestamps", () => {
  it("formats CE calendar timestamps with microsecond precision", () => {
    const timestamp = createExactCalendarTimestamp({
      era: "ce",
      year: 1912,
      month: 4,
      day: 15,
      hour: 2,
      minute: 20,
      second: 0,
      millisecond: 123,
      microsecond: 456,
      precision: "microsecond",
    });

    expect(formatTimelineExactTimestamp(timestamp)).toBe(
      "Apr 15, 1912, 02:20:00.123456 UTC",
    );
  });

  it("formats BCE calendar timestamps without leaking a year zero", () => {
    const timestamp = createExactCalendarTimestamp({
      era: "bce",
      year: 44,
      month: 3,
      day: 15,
      hour: 12,
      precision: "hour",
    });

    expect(formatTimelineExactTimestamp(timestamp)).toBe(
      "Mar 15, 44 BCE, 12:00 UTC",
    );
    expect(getTimelineYearFromExactTimestamp(
      createExactCalendarTimestamp({
        era: "bce",
        year: 1,
        precision: "year",
      }),
    )).toBeCloseTo(-1, 9);
  });

  it("formats elapsed timestamps with explicit named units", () => {
    const timestamp = createExactElapsedTimestamp({
      reference: "ago",
      years: 54_321n,
      days: 183n,
      hours: 4n,
      minutes: 12n,
      seconds: 9n,
      milliseconds: 123n,
      microseconds: 456n,
      precision: "microsecond",
    });

    expect(formatTimelineExactTimestamp(timestamp)).toBe(
      "54,321 years, 183 days, 4 hours, 12 minutes, 9 seconds, 123 milliseconds, and 456 microseconds ago",
    );
    expect(formatTimelineExactTimestamp(timestamp, { style: "compact" })).toBe(
      "54,321y 183d 4h 12m 9s 123ms 456µs ago",
    );
  });

  it("derives render years from calendar timestamps with sub-millisecond precision", () => {
    const timestamp = createExactCalendarTimestamp({
      era: "ce",
      year: 1912,
      month: 4,
      day: 15,
      hour: 2,
      minute: 20,
      second: 0,
      millisecond: 123,
      microsecond: 456,
      precision: "microsecond",
    });
    const baseYear = getTimelineYearFromUtcParts(1912, 3, 15, 2, 20, 0, 123);
    const exactYear = getTimelineYearFromExactTimestamp(timestamp);

    expect(exactYear).toBeGreaterThan(baseYear);
    expect(exactYear - baseYear).toBeLessThan(1e-9);
  });
});
