import { describe, expect, it } from "vitest";
import {
  addPreciseTimelineYears,
  getViewportForRange,
  getVisibleRangePrecise,
  normalizeViewport,
  splitTimelineYear,
  subtractPreciseTimelineYears,
  TIMELINE_MIN_YEAR,
  toApproximateTimelineYear,
  worldPreciseToScreen,
  type PreciseTimelineYear,
} from "../core/viewport";
import { projectAxisTicks, resolveAxisTickRenderStates } from "./axisTickStates";
import { resolveViewportAxisTicks } from "./viewportAxisTicks";
import { getTickScaleProgress, measureAxisText, resolveAxisLabelCandidates } from "./canvas/axisLabels";

function preciseTicks(start: PreciseTimelineYear, end: PreciseTimelineYear, width = 1200) {
  const ticks = resolveAxisTickRenderStates(toApproximateTimelineYear(start), toApproximateTimelineYear(end), width, {
    preciseStartYear: start,
    preciseEndYear: end,
  });
  return projectAxisTicks(ticks, start, end, width);
}

describe("scale-driven axis", () => {
  it("keeps ten equal subdivisions with a halfway accent", () => {
    const ticks = preciseTicks(splitTimelineYear(1000), splitTimelineYear(2000), 1000);
    const divisions = ticks.filter((tick) => tick.year >= 1200 && tick.year <= 1300);
    expect(divisions.map((tick) => tick.year)).toEqual(
      Array.from({ length: 11 }, (_, index) => 1200 + index * 10),
    );
    expect(divisions[5].majorProgress).toBeGreaterThan(divisions[4].majorProgress);
    expect(divisions[0].majorProgress).toBeGreaterThan(divisions[5].majorProgress);
  });

  it("bounds density and merges coincident grids during rapid zoom reversals", () => {
    for (const width of [320, 768, 1920, 3840]) {
      for (const zoom of [19, 8, 40, 0, 22, 65, 16, 30, 4]) {
        const viewport = normalizeViewport({ centerYear: -1000, zoom }, width);
        const ticks = resolveViewportAxisTicks(viewport, width);
        expect(ticks.length).toBeGreaterThan(0);
        expect(ticks.length).toBeLessThan(width / 4 + 2);
        for (let i = 0; i < ticks.length; i++) {
          expect(Number.isFinite(ticks[i].x)).toBe(true);
          expect(ticks[i].visibleProgress).toBeGreaterThan(0);
          expect(ticks[i].visibleProgress).toBeLessThanOrEqual(1);
          if (i > 0) expect(ticks[i].x - ticks[i - 1].x).toBeGreaterThan(4);
        }
      }
    }
    const viewport = getViewportForRange(-2500, 500, 1000);
    const before = resolveViewportAxisTicks(viewport, 1000);
    resolveViewportAxisTicks({ centerYear: -1e9, zoom: 0 }, 1000);
    expect(resolveViewportAxisTicks(viewport, 1000)).toEqual(before);
  });

  it("projects ticks to exactly the same coordinates as the timeline in both scale modes", () => {
    for (const scaleMode of ["linear", "logarithmic"] as const) {
      const width = 1200;
      const viewport = getViewportForRange(-3000, 1000, width, 0, scaleMode);
      const ticks = resolveViewportAxisTicks(viewport, width);
      expect(ticks.length).toBeGreaterThan(0);
      for (const tick of ticks) {
        const precise = tick.wholeYear === undefined ? splitTimelineYear(tick.year)
          : { wholeYear: tick.wholeYear, fraction: tick.yearFraction! };
        expect(tick.x).toBeCloseTo(worldPreciseToScreen(precise, viewport, width), 7);
      }
    }
  });

  it("keeps a landmark's stroke continuous across grid thresholds", () => {
    let previous: { alpha: number; size: number; major: number } | undefined;
    // Sweeps several 1/2/5 hierarchy changes in both directions without a clock.
    for (let scale = 0; scale <= 700; scale++) {
      const span = 100 * 2 ** (scale / 100);
      const ticks = preciseTicks(splitTimelineYear(1000 - span / 2), splitTimelineYear(1000 + span / 2));
      const landmark = ticks.find((tick) => Math.abs(tick.x - 600) < 0.01);
      expect(landmark).toBeDefined();
      const current = { alpha: landmark!.visibleProgress, size: getTickScaleProgress(landmark!.pixelsPerStep), major: landmark!.majorProgress };
      if (previous) {
        expect(Math.abs(current.alpha - previous.alpha)).toBeLessThan(0.03);
        expect(Math.abs(current.size - previous.size)).toBeLessThan(0.03);
        expect(Math.abs(current.major - previous.major)).toBeLessThan(0.03);
      }
      previous = current;
    }
  });

  it("anchors microsecond ticks to calendar time, including leap years, while panning", () => {
    for (const year of [2023, 2024]) {
      const unit = 1 / ((year === 2024 ? 366 : 365) * 86400 * 1e6);
      const start = { wholeYear: year, fraction: 0.37 * unit };
      const end = addPreciseTimelineYears(start, 12 * unit);
      const first = preciseTicks(start, end);
      const second = preciseTicks(addPreciseTimelineYears(start, 0.3 * unit), addPreciseTimelineYears(end, 0.3 * unit));
      expect(first.length).toBeGreaterThan(2);
      for (const tick of first.filter((tick) => tick.x > 50 && tick.x < 1150)) {
        const coordinate = { wholeYear: tick.wholeYear!, fraction: tick.yearFraction! };
        const microseconds = subtractPreciseTimelineYears(coordinate, splitTimelineYear(year)) / unit;
        expect(microseconds).toBeCloseTo(Math.round(microseconds), 6);
        const match = second.find((other) => Math.abs(other.yearFraction! - tick.yearFraction!) < unit * 1e-6);
        expect(match).toBeDefined();
        expect(tick.x - match!.x).toBeCloseTo(30, 5);
      }
    }
  });

  it("retains precise distinct ticks near the Big Bang", () => {
    const start = addPreciseTimelineYears(splitTimelineYear(TIMELINE_MIN_YEAR), 1e-10);
    const end = addPreciseTimelineYears(start, 1e-10);
    const ticks = preciseTicks(start, end);
    expect(ticks.length).toBeGreaterThan(5);
    expect(new Set(ticks.map((tick) => tick.yearFraction)).size).toBe(ticks.length);
  });

  it("keeps the number of generated ticks proportional to visible pixels", () => {
    const width = 1200;
    for (let zoom = 0; zoom < 80; zoom += 2) {
      const viewport = normalizeViewport({ centerYear: 1900, zoom }, width);
      const [start, end] = getVisibleRangePrecise(viewport, width);
      const ticks = resolveAxisTickRenderStates(toApproximateTimelineYear(start), toApproximateTimelineYear(end), width, {
        preciseStartYear: start, preciseEndYear: end,
      });
      expect(ticks.length).toBeLessThan(width / 2);
    }
  });
});

describe("axis labels", () => {
  it("never forces a label over edge labels or another label on narrow screens", () => {
    const occupied = [{ left: 0, right: 75 }, { left: 235, right: 320 }];
    const candidates = Array.from({ length: 13 }, (_, index) => ({
      x: index * 25, text: String(index), width: 60, alpha: 1, step: 1, pixelsPerStep: 25,
    }));
    const labels = resolveAxisLabelCandidates(candidates, occupied);
    for (const label of labels) {
      expect(label.x - label.width / 2).toBeGreaterThan(75);
      expect(label.x + label.width / 2).toBeLessThan(235);
      for (const other of labels) {
        if (other !== label) expect(Math.abs(other.x - label.x)).toBeGreaterThan((other.width + label.width) / 2);
      }
    }
    expect(resolveAxisLabelCandidates([{ ...candidates[0], x: 160, width: 300 }], occupied)).toEqual([]);
  });

  it("reuses text measurements and separates fonts and canvas contexts", () => {
    let measurements = 0;
    const context = { font: "13px sans-serif", measureText: () => { measurements++; return { width: 42 }; } } as unknown as CanvasRenderingContext2D;
    expect(measureAxisText(context, "1000 BCE")).toBe(42);
    measureAxisText(context, "1000 BCE");
    expect(measurements).toBe(1);
    context.font = "11px sans-serif";
    measureAxisText(context, "1000 BCE");
    measureAxisText({ ...context } as CanvasRenderingContext2D, "1000 BCE");
    expect(measurements).toBe(3);
    for (let index = 0; index < 2100; index++) measureAxisText(context, String(index));
    measureAxisText(context, "1000 BCE");
    expect(measurements).toBe(2104);
  });
});
