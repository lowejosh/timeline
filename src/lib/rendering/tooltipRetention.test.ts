import { describe, expect, it } from "vitest";
import { shouldRetainTooltipAtPoint } from "./tooltipRetention";

describe("tooltip travel corridor", () => {
  const shell = { left: 100, top: 50, right: 1000, bottom: 850 };
  const card = { left: 300, right: 600, top: 100, bottom: 300 };
  const anchor = { anchorX: 350, anchorY: 300, placement: "above" as const };
  const retain = (x: number, y: number) => shouldRetainTooltipAtPoint(x, y, shell, card, anchor, 16);

  it("allows diagonal travel to either side of the card", () => {
    expect(retain(280, 275)).toBe(true);
    expect(retain(420, 275)).toBe(true);
    expect(retain(360, 299)).toBe(true);
  });
  it("retains the source area but releases outside the corridor", () => {
    expect(retain(490, 240)).toBe(true);
    expect(retain(550, 275)).toBe(false);
    expect(retain(350, 325)).toBe(false);
  });
  it("uses actual placement after a tooltip flips below its anchor", () => {
    const below = { ...card, top: 400, bottom: 600 };
    expect(shouldRetainTooltipAtPoint(400, 325, shell, below, anchor, 16)).toBe(true);
  });
});
