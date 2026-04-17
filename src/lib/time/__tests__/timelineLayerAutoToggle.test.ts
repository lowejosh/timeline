import { describe, expect, it } from "vitest";
import {
  shouldAutoSuppressCivilizations,
  shouldAutoSuppressHumanEvolution,
} from "../timelineLayerAutoToggle";
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

  it("suppresses civilizations when the viewport is fully after their range", () => {
    const viewport = getViewportForRange(1_850, 2_026, WIDTH, 0);

    expect(shouldAutoSuppressCivilizations(viewport, WIDTH, PAD, false)).toBe(
      true,
    );
  });

  it("keeps civilizations enabled when the viewport is inside historical time", () => {
    const viewport = getViewportForRange(-2_000, 1_600, WIDTH, 0);

    expect(shouldAutoSuppressCivilizations(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
  });

  it("uses hysteresis near the civilization threshold so the toggle does not flap", () => {
    const viewport = Array.from({ length: 800 }, (_, index) =>
      getViewportForRange(1_200 + index, 2_026, WIDTH, 0),
    ).find(
      (candidate) =>
        !shouldAutoSuppressCivilizations(candidate, WIDTH, PAD, false) &&
        shouldAutoSuppressCivilizations(candidate, WIDTH, PAD, true),
    );

    expect(viewport).toBeDefined();

    if (!viewport) {
      return;
    }

    expect(shouldAutoSuppressCivilizations(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
    expect(shouldAutoSuppressCivilizations(viewport, WIDTH, PAD, true)).toBe(
      true,
    );
  });
});