import { expect, it } from "vitest";
import { PHOENICIA_EXPERIENCE as experience, resolveStopIndex } from "./experiences";
import { getGuidedBandEmphasis } from "@/lib/rendering/guidedFocus";
import { STATIC_TIMELINE_CATALOG } from "@/lib/catalog/timelineCatalog";

it("resolves every guide band and provides citations and a valid frame for every stop", () => {
  for (const id of [...experience.subjectIds, ...experience.contextIds]) expect(STATIC_TIMELINE_CATALOG.overlays.some(band => band.id === id), id).toBe(true);
  expect(new Set(experience.stops.map(stop => stop.id)).size).toBe(experience.stops.length);
  for (const stop of experience.stops) {
    expect(stop.sources.length).toBeGreaterThan(0);
    for (const source of stop.sources) expect(new URL(source.url).protocol).toBe("https:");
    expect(stop.range[0]).toBeLessThan(stop.year);
    expect(stop.range[1]).toBeGreaterThan(stop.year);
  }
  expect(resolveStopIndex(experience, -1)).toBe(0);
  expect(resolveStopIndex(experience, 99)).toBe(experience.stops.length - 1);
  expect(resolveStopIndex(experience, NaN)).toBe(0);
});
it("grows subject emphasis without clipping future band geometry, and rewinds deterministically", () => {
  const band = STATIC_TIMELINE_CATALOG.overlays.find(band => band.id === "phoenicia")!;
  const focus = { subjectIds: experience.subjectIds, revealYear: -1100 };
  expect(getGuidedBandEmphasis(focus, band.id, band.startYear, band.endYear)).toEqual({ muted: true, highlightedEnd: -1100 });
  expect(getGuidedBandEmphasis({ ...focus, revealYear: -539 }, band.id, band.startYear, band.endYear).highlightedEnd).toBe(-539);
  expect(getGuidedBandEmphasis(focus, band.id, band.startYear, band.endYear).highlightedEnd).toBe(-1100);
  expect(getGuidedBandEmphasis(focus, "future", -800, -100).highlightedEnd).toBe(-800);
  expect(getGuidedBandEmphasis(focus, "child", -1200, -1000, band.id).highlightedEnd).toBe(-1100);
  expect(getGuidedBandEmphasis(undefined, band.id, band.startYear, band.endYear)).toEqual({ muted: false, highlightedEnd: band.endYear });
});

