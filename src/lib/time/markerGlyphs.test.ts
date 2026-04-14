import { describe, expect, it } from "vitest";
import type { TimelineMarker } from "../data/timelineTypes";
import {
  resolveMarkerRenderStates,
  type MarkerTextMeasurer,
  type VisibleMarkerPosition,
} from "./markerGlyphs";

const WIDTH = 1000;
const PAD = 100;

function makeMarker(id: string, priority: number): TimelineMarker {
  return {
    id,
    label: id,
    shortLabel: id,
    year: 0,
    priority,
  };
}

function resolveStates(
  markers: Array<{ id: string; priority: number; x: number }>,
  measureText: MarkerTextMeasurer = () => ({
    fullLabelWidth: 1,
    shortLabelWidth: 1,
    dateLabelWidth: 1,
  }),
) {
  const positions: VisibleMarkerPosition[] = markers.map(({ id, priority, x }) => ({
    marker: makeMarker(id, priority),
    x,
  }));

  return resolveMarkerRenderStates(positions, WIDTH, PAD, measureText);
}

describe("marker glyph timing", () => {
  it("grows crowded dots from zero while keeping the stem hidden", () => {
    const states = resolveStates([
      { id: "anchor", priority: 100, x: 160 },
      { id: "crowded", priority: 10, x: 162 },
    ]);
    const crowded = states.find((state) => state.marker.id === "crowded");

    expect(crowded).toBeDefined();
    expect(crowded?.revealProgress).toBe(0);
    expect(crowded?.timingProgress).toBeCloseTo(0.28, 6);
    expect(crowded?.dotProgress).toBe(0);
    expect(crowded?.labelOpacity).toBe(0);
    expect(crowded?.stemProgress).toBe(0);
  });

  it("retimes stem growth to the label's final rendered opacity", () => {
    const states = resolveStates([
      { id: "anchor", priority: 100, x: 160 },
      { id: "half-visible", priority: 10, x: 193 },
    ]);
    const halfVisible = states.find(
      (state) => state.marker.id === "half-visible",
    );
    const anchor = states.find((state) => state.marker.id === "anchor");

    expect(halfVisible).toBeDefined();
    expect(halfVisible?.revealProgress).toBe(1);
    expect(halfVisible?.dotProgress).toBe(1);
    expect(halfVisible?.intrinsicLabelOpacity).toBe(1);
    expect(halfVisible?.labelOpacity).toBeCloseTo(0.5, 6);
    expect(halfVisible?.stemProgress).toBeCloseTo(0.5, 6);
    expect(anchor?.labelOpacity).toBe(1);
    expect(anchor?.stemProgress).toBe(1);
  });

  it("keeps the stem collapsed when clearance culls the label", () => {
    const states = resolveStates([
      { id: "anchor", priority: 100, x: 160 },
      { id: "culled", priority: 10, x: 179 },
    ]);
    const culled = states.find((state) => state.marker.id === "culled");

    expect(culled).toBeDefined();
    expect(culled?.revealProgress).toBeCloseTo(0.9375, 6);
    expect(culled?.dotProgress).toBeGreaterThan(0.98);
    expect(culled?.intrinsicLabelOpacity).toBe(1);
    expect(culled?.labelOpacity).toBe(0);
    expect(culled?.stemProgress).toBe(0);
  });

  it("chooses the short label when the full label is too wide", () => {
    const measureText: MarkerTextMeasurer = (_, input) => ({
      fullLabelWidth: input.fullLabel === "wide" ? 200 : 80,
      shortLabelWidth: input.shortLabel === "wide-short" ? 90 : 80,
      dateLabelWidth: 40,
    });
    const positions: VisibleMarkerPosition[] = [
      {
        marker: {
          id: "wide",
          label: "wide",
          shortLabel: "wide-short",
          year: 0,
          priority: 100,
        },
        x: 160,
      },
    ];

    const [state] = resolveMarkerRenderStates(positions, WIDTH, PAD, measureText);

    expect(state.label).toBe("wide-short");
  });
});