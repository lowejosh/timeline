import { expect, it } from "vitest";
import { getEraZoomFill, sampleZoomTint } from "./eraZoomGradient";

it("reveals the upcoming tint early while retaining the previous colour farther out", () => {
  const from = sampleZoomTint(0.8, 0, 17);
  const to = sampleZoomTint(0.8, 4, 17);
  const preview = sampleZoomTint(0.8, 1, 17);
  const progress = (preview.hue - from.hue) / (to.hue - from.hue);
  expect(progress).toBeGreaterThan(0.22);
  expect(progress).toBeLessThan(0.4);
  const near = sampleZoomTint(0.8, 2, 17);
  const far = sampleZoomTint(0.72, 2, 17);
  expect(Math.abs(near.hue - to.hue)).toBeLessThan(Math.abs(far.hue - to.hue));
});

it("expands each tint outward from both sides of the axis", () => {
  const axis = 0.65;
  for (const zoom of [0, 15.4, 30, 70]) {
    for (const distance of [0.04, 0.15, 0.3]) {
      const tint = sampleZoomTint(axis - distance, zoom, 17, axis);
      const opposite = sampleZoomTint(axis + distance, zoom, 17, axis);
      const expanded = 0.03 * Math.sqrt((1 + (distance / 0.03) ** 2) * 2 ** 0.5 - 1);
      const next = sampleZoomTint(axis - expanded, zoom + 0.25, 17, axis);
      for (const channel of ["hue", "saturation", "lightness"] as const) {
        expect(opposite[channel]).toBeCloseTo(tint[channel], 10);
        expect(next[channel]).toBeCloseTo(tint[channel], 10);
      }
    }
  }
});

it("keeps the more frequent tint transitions continuous", () => {
  for (let zoom = 0; zoom < 80; zoom += 0.125) {
    const from = sampleZoomTint(0.8, zoom, 17);
    const to = sampleZoomTint(0.8, zoom + 0.125, 17);
    expect(Math.abs(from.hue - to.hue)).toBeLessThan(4);
    expect(Math.abs(from.lightness - to.lightness)).toBeLessThan(0.014);
  }
  const current = sampleZoomTint(0.8, 0, 17);
  const next = sampleZoomTint(0.8, 4, 17);
  expect(Math.abs(next.hue - current.hue)).toBeGreaterThan(10);
});

it("gives eras distinct shading even when they share a colour", () => {
  const context = {
    createLinearGradient: () => {
      const stops: Array<[number, string]> = [];
      return { stops, addColorStop: (offset: number, color: string) => stops.push([offset, color]) };
    },
  } as unknown as CanvasRenderingContext2D;
  const first = getEraZoomFill(context, "rgb(55, 157, 238)", 900, 750, 19, "iron-age");
  const second = getEraZoomFill(context, "rgb(55, 157, 238)", 900, 750, 19, "classical-age");
  expect(first).not.toEqual(second);
  expect(getEraZoomFill(context, "rgb(55, 157, 238)", 900, 750, 19, "iron-age")).toBe(first);
  expect(getEraZoomFill(context, "rgba(0,0,0,0)", 900, 750, 19, "transparent")).toBe("rgba(0,0,0,0)");
});
