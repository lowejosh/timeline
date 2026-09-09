import { describe, expect, it } from "vitest";
import { formatMeasuredSpan } from "./timeMeasurement";
import { SECONDS_PER_YEAR } from "@/lib/core/time/duration";
import { screenToWorldPrecise, subtractPreciseTimelineYears, worldPreciseToScreen } from "@/lib/core/viewport";

describe("time measurements", () => {
  it("formats either drag direction and zero without inventing a minimum duration", () => {
    expect(formatMeasuredSpan(-1250)).toBe("1.25 thousand years");
    expect(formatMeasuredSpan(1)).toBe("1 year");
    expect(formatMeasuredSpan(0)).toBe("0 years");
    expect(formatMeasuredSpan(0.000001 / SECONDS_PER_YEAR)).toBe("1 µs");
  });

  it("retains sub-microsecond differences at a historical date", () => {
    const viewport = { centerYear: 1500, zoom: 80 };
    const start = screenToWorldPrecise(590, viewport, 1200);
    const end = screenToWorldPrecise(600, viewport, 1200);
    const span = subtractPreciseTimelineYears(end, start);
    expect(span).toBeGreaterThan(0);
    expect(span * SECONDS_PER_YEAR).toBeLessThan(0.000001);
    expect(formatMeasuredSpan(span)).not.toBe("0 years");
  });

  it("projects retained endpoints through logarithmic zoom and pan", () => {
    const viewport = { centerYear: 0, zoom: 20, scaleMode: "logarithmic" as const };
    const year = screenToWorldPrecise(300, viewport, 1000);
    const next = { ...viewport, centerYear: 100, zoom: 21 };
    const x = worldPreciseToScreen(year, next, 1000);
    expect(subtractPreciseTimelineYears(screenToWorldPrecise(x, next, 1000), year)).toBeCloseTo(0, 7);
  });
});
