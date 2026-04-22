import { describe, expect, it } from "vitest";
import { TIMELINE_DECORATION_GROUPS_BY_ID } from "../../data/timelineDecorations";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressCivilizations,
  shouldAutoSuppressTimelineLayer,
} from "../timelineLayerAutoToggle";
import { getViewportForRange } from "../viewport";

const WIDTH = 1200;
const PAD = 120;
const CIVILIZATIONS_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID.civilizations.autoToggleRule!;

describe("timeline layer auto toggle", () => {
  it("does not define group-level auto-hide rules for deep time life or human evolution", () => {
    expect(
      TIMELINE_DECORATION_GROUPS_BY_ID["deep-time-life"].autoToggleRule,
    ).toBeUndefined();
    expect(
      TIMELINE_DECORATION_GROUPS_BY_ID["human-evolution"].autoToggleRule,
    ).toBeUndefined();
  });

  it("supports coverage-based civilization suppression rules", () => {
    const viewport = getViewportForRange(1_850, 2_026, WIDTH, 0);

    expect(
      shouldAutoSuppressTimelineLayer(
        CIVILIZATIONS_AUTO_TOGGLE_RULE,
        viewport,
        WIDTH,
        PAD,
        false,
      ),
    ).toBe(true);
  });

  it("keeps civilization auto-hide enabled without extra gating", () => {
    expect(
      isTimelineLayerAutoToggleEnabled(
        CIVILIZATIONS_AUTO_TOGGLE_RULE,
        new Set(["human"]),
        new Set(["civilizations"]),
        new Set(["civilizations"]),
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
});
