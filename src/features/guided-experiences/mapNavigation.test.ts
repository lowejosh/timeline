import { expect, it } from "vitest";
import { DEFAULT_MAP_NAVIGATION, zoomGuideMap, constrainGuideMap, getGuideMapFrame } from "./mapNavigation";

it("keeps the point beneath the cursor fixed through zoom and reversal", () => {
  const start = { x: 40, y: -30, zoom: 2 };
  const next = zoomGuideMap(start, 1.5, 123, 87);
  expect((123 - next.x) / next.zoom).toBeCloseTo((123 - start.x) / start.zoom);
  expect((87 - next.y) / next.zoom).toBeCloseTo((87 - start.y) / start.zoom);
  expect(zoomGuideMap(next, 1 / 1.5, 123, 87)).toEqual(start);
});

it("bounds zoom without moving the anchor at the limit", () => {
  const max = zoomGuideMap(DEFAULT_MAP_NAVIGATION, 1000, 300, 150);
  expect(max.zoom).toBe(8);
  expect(zoomGuideMap(max, 2, 300, 150)).toEqual(max);
  expect(zoomGuideMap(max, 0.0001, 300, 150).zoom).toBeLessThan(0.5);
});

it("keeps the world covering the viewport when panned to any edge", () => {
  for (const index of [0, 5, 6]) for (const offset of [-1e6, 1e6]) {
    const nav = constrainGuideMap({ x: offset, y: offset, zoom: 2 }, index);
    const frame = getGuideMapFrame(index);
    const unit = frame.scale * nav.zoom;
    expect(nav.x - frame.west * unit).toBeLessThanOrEqual(0);
    expect(nav.x + (360 - frame.west) * unit).toBeGreaterThanOrEqual(600);
    expect(nav.y - frame.north * unit).toBeLessThanOrEqual(0);
    expect(nav.y + (180 - frame.north) * unit).toBeGreaterThanOrEqual(300);
  }
});
it("centres the map when zoomed out beyond world fit", () => {
  const nav = constrainGuideMap({ x: 9999, y: -9999, zoom: 0.001 }, 6);
  const frame = getGuideMapFrame(6);
  expect(360 * frame.scale * nav.zoom).toBeCloseTo(600);
  expect(nav.x + (180 - frame.west) * frame.scale * nav.zoom).toBeCloseTo(300);
  expect(nav.y + (90 - frame.north) * frame.scale * nav.zoom).toBeCloseTo(150);
});
