import { expect, it } from "vitest";
import { getYearsAgoFromPresent } from "@/lib/core/timelineYears";
import { getVisiblePolarityIntervals } from "./drawMagneticPolarity";
import data from "./gts2020.json";

const ageToX = (year: number) => 1000 - getYearsAgoFromPresent(year) / 1000;

it("includes every sourced reversal, in order, beginning with today's polarity", () => {
  expect(data.boundariesMa).toHaveLength(189);
  expect(data.boundariesMa[0]).toBe(0);
  expect(data.boundariesMa.at(-1)).toBe(82.875);
  for (let i = 1; i < data.boundariesMa.length; i++) expect(data.boundariesMa[i]).toBeGreaterThan(data.boundariesMa[i - 1]);
  const visible = getVisiblePolarityIntervals(ageToX, 0, 1000);
  expect(visible[0]).toMatchObject({ normal: true, youngMa: 0, oldMa: 0.773, x1: 1000 });
  expect(visible[1]).toMatchObject({ normal: false, x0: 10 });
  expect(visible[0].x0).toBeCloseTo(227);
  expect(visible[1].x1).toBeCloseTo(visible[0].x0);
});

it("does not invent polarity beyond coverage or inflate narrow intervals", () => {
  expect(getVisiblePolarityIntervals(ageToX, -100000, -90000)).toEqual([]);
  const tiny = getVisiblePolarityIntervals(year => 1 - getYearsAgoFromPresent(year) / 1e12, 0, 1);
  expect(tiny).toHaveLength(188);
  expect(tiny[0].x1 - tiny[0].x0).toBeLessThan(0.001);
  expect(getVisiblePolarityIntervals(ageToX, 1100, 1200)).toEqual([]);
});
