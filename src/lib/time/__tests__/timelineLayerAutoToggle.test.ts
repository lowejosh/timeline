import { describe, expect, it } from "vitest";
import {
  HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
  shouldAutoSuppressCivilizations,
  shouldAutoSuppressDeepTimeLife,
  shouldAutoSuppressHumanEvolution,
  shouldAutoSuppressTimelineLayer,
} from "../timelineLayerAutoToggle";
import { getTimelineYearFromYearsAgo } from "../timelineYears";
import { getViewportForRange } from "../viewport";

const WIDTH = 1200;
const PAD = 120;

describe("timeline layer auto toggle", () => {
  it("suppresses human evolution when the viewport is fully inside recent history", () => {
    const viewport = getViewportForRange(-8_000, 2026, WIDTH, 0);

    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false)).toBe(
      true,
    );
  });

  it("keeps human evolution enabled when deeper prehistory still occupies much of the view", () => {
    const viewport = getViewportForRange(-30_000, 2026, WIDTH, 0);

    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
  });

  it("uses hysteresis near the threshold so the toggle does not flap", () => {
    const viewport = getViewportForRange(-15_000, 2026, WIDTH, 0);

    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, true)).toBe(
      true,
    );
  });

  it("supports reusable coverage-based rules for auto-suppressed layers", () => {
    const viewport = getViewportForRange(-15_000, 2026, WIDTH, 0);

    expect(
      shouldAutoSuppressTimelineLayer(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        viewport,
        WIDTH,
        PAD,
        false,
      ),
    ).toBe(false);
    expect(
      shouldAutoSuppressTimelineLayer(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        viewport,
        WIDTH,
        PAD,
        true,
      ),
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

  it("keeps deep time life visible while zooming into older geological history away from the recent handoff", () => {
    const viewport = getViewportForRange(-320_000_000, -66_000_000, WIDTH, 0);

    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
  });

  it("keeps deep time life visible while zoomed into the age of mammals before the recent handoff", () => {
    const viewport = getViewportForRange(
      getTimelineYearFromYearsAgo(18_000_000),
      getTimelineYearFromYearsAgo(3_500_000),
      WIDTH,
      0,
    );

    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
  });

  it("suppresses deep time life once the viewport is mostly inside recent mammal and human time", () => {
    const viewport = getViewportForRange(
      getTimelineYearFromYearsAgo(12_000_000),
      2026,
      WIDTH,
      0,
    );

    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, false)).toBe(
      true,
    );
  });

  it("uses hysteresis for deep time life near the recent handoff so the toggle does not flap", () => {
    const viewport = Array.from({ length: 80 }, (_, index) =>
      getViewportForRange(
        getTimelineYearFromYearsAgo(14_500_000 + index * 50_000),
        2026,
        WIDTH,
        0,
      ),
    ).find(
      (candidate) =>
        !shouldAutoSuppressDeepTimeLife(candidate, WIDTH, PAD, false) &&
        shouldAutoSuppressDeepTimeLife(candidate, WIDTH, PAD, true),
    );

    expect(viewport).toBeDefined();

    if (!viewport) {
      return;
    }

    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, true)).toBe(
      true,
    );
  });
});
