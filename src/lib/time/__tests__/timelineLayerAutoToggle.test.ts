import { describe, expect, it } from "vitest";
import { shouldAutoSuppressHumanEvolution } from "../timelineLayerAutoToggle";
import { getViewportForRange } from "../viewport";

const WIDTH = 1200;
const PAD = 120;

describe("timeline layer auto toggle", () => {
  it("suppresses human evolution when the viewport is fully inside recent history", () => {
    const viewport = getViewportForRange(-8_000, 2026, WIDTH, 0);

    expect(
      shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false),
    ).toBe(true);
  });

  it("keeps human evolution enabled when deeper prehistory still occupies much of the view", () => {
    const viewport = getViewportForRange(-30_000, 2026, WIDTH, 0);

    expect(
      shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false),
    ).toBe(false);
  });

  it("uses hysteresis near the threshold so the toggle does not flap", () => {
    const viewport = getViewportForRange(-15_000, 2026, WIDTH, 0);

    expect(
      shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false),
    ).toBe(false);
    expect(
      shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, true),
    ).toBe(true);
  });
});