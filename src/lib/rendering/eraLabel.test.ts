import { expect, it } from "vitest";
import { fitEraLabel } from "./eraLabel";
import { getEraInlineLabelVisibility } from "./canvas/eraAnimation";
import { smoothstep01 } from "../core/easing";

it("wraps and truncates narrow labels without overflowing", () => {
  const measure = (text: string) => text.length * 6;
  for (const width of [4, 36, 65, 110, 300]) {
    const lines = fitEraLabel("Persian & Classical Greek Age", width, measure);
    expect(lines.length).toBeLessThanOrEqual(2);
    for (const line of lines) expect(measure(line)).toBeLessThanOrEqual(width);
  }
  expect(fitEraLabel("Bronze Age", 100, measure)).toEqual(["Bronze Age"]);
});

it("keeps parent and child labels complementary throughout the handoff", () => {
  for (const progress of [0, 0.1, 0.25, 0.5, 0.75, 1]) {
    expect(getEraInlineLabelVisibility(progress) + smoothstep01(progress)).toBeCloseTo(1);
  }
});

it("keeps a wrapped era title below the bands and above the ticks", async () => {
  const { placeEraLabelBlock } = await import("./eraLabel");
  const block = placeEraLabelBlock(["Post-classical", "History"], ["Middle", "Ages"], 456, 434, 472);
  expect(block.lines).toEqual(["Post-classical", "History"]);
  expect(block.alternateLines).toHaveLength(1);
  const count = block.lines.length + block.alternateLines.length;
  expect(block.baseline - (count - 1) * 12 - 10).toBeGreaterThanOrEqual(434);
  expect(block.baseline).toBeLessThanOrEqual(472);
});
