import { describe, expect, it } from "vitest";
import { duration, subtractDurations, compareDurations, durationInSeconds, formatDuration, serializeDuration, deserializeDuration, minimumViewportDuration } from "./duration";
import { getPreciseTimelineYearFromCalendarTimestamp, getPreciseTimelineYearFromElapsedTimestamp, type TimelineCalendarTimestamp } from "../exactTimestamp";
import { getViewportCenterYear, interpolateViewport, subtractPreciseTimelineYears } from "../viewport";
import { normalizeTimelineSetDocument, type TimelineRawSetDocument } from "@/lib/catalog/setSchema";

describe("time precision", () => {
  it("retains a Planck-scale local difference before converting to a number", () => {
    const origin = duration(10n ** 55n, -44);
    const point = duration(10n ** 55n + 5n, -44);
    expect(durationInSeconds(point)).toBe(durationInSeconds(origin));
    const difference = subtractDurations(point, origin);
    expect(durationInSeconds(difference)).toBe(5e-44);
    expect(compareDurations(point, origin)).toBe(1);
    expect(deserializeDuration(JSON.parse(JSON.stringify(serializeDuration(point))))).toEqual(point);
    expect(formatDuration(difference)).toBe("5.00000e-44 s");
  });
  it("keeps adjacent calendar microseconds distinct throughout camera interpolation", () => {
    const stamp: TimelineCalendarTimestamp = { kind: "calendar", era: "ce", year: 2024, month: 1, day: 1, precision: "microsecond", microsecond: 1 };
    const first = getPreciseTimelineYearFromCalendarTimestamp(stamp);
    const second = getPreciseTimelineYearFromCalendarTimestamp({ ...stamp, microsecond: 2 });
    const microsecondInYear = 1 / (366 * 86400 * 1e6);
    expect(subtractPreciseTimelineYears(second, first) / microsecondInYear).toBeCloseTo(1, 10);
    const from = { centerYear: 2024, centerYearWhole: first.wholeYear, centerYearFraction: first.fraction, zoom: 70 };
    const to = { ...from, centerYearFraction: second.fraction };
    expect(interpolateViewport(from, to, 1)).toEqual(to);
    expect(subtractPreciseTimelineYears(getViewportCenterYear(interpolateViewport(from, to, 0.5)), first) / microsecondInYear).toBeCloseTo(0.5, 10);
  });
  it("preserves elapsed microseconds near the Big Bang and normalizes units", () => {
    const a = getPreciseTimelineYearFromElapsedTimestamp({ kind: "elapsed", reference: "after-big-bang", precision: "microsecond", microseconds: 1n });
    const b = getPreciseTimelineYearFromElapsedTimestamp({ kind: "elapsed", reference: "after-big-bang", precision: "microsecond", microseconds: 2n });
    expect(subtractPreciseTimelineYears(b, a)).toBeGreaterThan(0);
    expect(getPreciseTimelineYearFromElapsedTimestamp({ kind: "elapsed", reference: "after-big-bang", precision: "second", seconds: 60n })).toEqual(getPreciseTimelineYearFromElapsedTimestamp({ kind: "elapsed", reference: "after-big-bang", precision: "minute", minutes: 1n }));
    expect(durationInSeconds(minimumViewportDuration(1200))).toBe(1e-6);
    expect(durationInSeconds(minimumViewportDuration(2400))).toBe(2e-6);
    expect(() => minimumViewportDuration(NaN)).not.toThrow();
  });
  it("retains inline exact catalog timestamps and derives numeric indexes from them", () => {
    const exact = { kind: "calendar", era: "ce", year: 2024, month: 1, day: 1, precision: "microsecond", microsecond: 1 } as const;
    const document: TimelineRawSetDocument = {
      version: 1, metadata: { id: "test", label: "Test", description: "", order: 0, defaultEnabled: true }, sources: {}, categories: [], families: [],
      markers: [{ id: "inline", label: "Inline", year: exact }, { id: "explicit", label: "Explicit", year: 2000, exactTime: exact }],
      overlays: [{ id: "band", label: "Band", startYear: exact, endYear: 2025, color: "#123456" }],
    };
    const catalog = normalizeTimelineSetDocument(document);
    expect(catalog.markers[0].exactTime).toEqual(exact);
    expect(catalog.markers[1].year).toBe(catalog.markers[0].year);
    expect(catalog.overlays[0].exactStartTime).toEqual(exact);
  });
});
