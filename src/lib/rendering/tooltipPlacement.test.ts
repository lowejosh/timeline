import { describe, expect, it } from "vitest";
import { placeTimelineTooltip } from "./tooltipPlacement";

describe("tooltip placement", () => {
  for (const [width, height] of [[320, 640], [844, 280], [180, 200]]) {
    it(`contains expanded content and clears controls at ${width} x ${height}`, () => {
      const bounds = { left: 10, top: 64, right: width - 10, bottom: height - 10 };
      for (const anchorX of [-20, width / 2, width + 20]) {
        for (const anchorY of [0, height / 2, height + 20]) {
          const placement = placeTimelineTooltip({ bounds, anchorX, anchorY, measuredHeight: 900, preferredBelow: true });
          expect(placement.left).toBeGreaterThanOrEqual(bounds.left);
          expect(placement.left + placement.width).toBeLessThanOrEqual(bounds.right);
          expect(placement.top).toBeGreaterThanOrEqual(bounds.top);
          expect(placement.top + placement.maxHeight).toBeLessThanOrEqual(bounds.bottom);
        }
      }
    });
  }
});

it("only restricts content when it exceeds the available screen height", () => {
  const bounds = { left: 10, top: 64, right: 1200, bottom: 890 };
  const placement = placeTimelineTooltip({ bounds, anchorX: 600, anchorY: 500, measuredHeight: 500, preferredBelow: false });
  expect(placement.maxHeight).toBe(826);
  expect(placement.top + 500).toBeLessThanOrEqual(bounds.bottom);
});
