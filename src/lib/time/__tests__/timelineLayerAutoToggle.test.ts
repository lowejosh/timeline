import { describe, expect, it } from "vitest";
import { TIMELINE_DECORATION_GROUPS_BY_ID } from "../../data/timelineDecorations";
import {
  isTimelineLayerAutoToggleEnabled,
  shouldAutoSuppressCivilizations,
  shouldAutoSuppressDeepTimeLife,
  shouldAutoSuppressHumanEvolution,
  shouldAutoSuppressTimelineLayer,
} from "../timelineLayerAutoToggle";
import { bce } from "../../data/timelineDateBuilders";
import { getTimelineYearFromYearsAgo } from "../timelineYears";
import { getViewportForRange } from "../viewport";

const WIDTH = 1200;
const PAD = 120;
const HUMAN_EVOLUTION_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID["human-evolution"].autoToggleRule!;
const DEEP_TIME_LIFE_AUTO_TOGGLE_RULE =
  TIMELINE_DECORATION_GROUPS_BY_ID["deep-time-life"].autoToggleRule!;

describe("timeline layer auto toggle", () => {
  it("suppresses human evolution once the viewport has drilled past the first civilizations", () => {
    const viewport = getViewportForRange(bce(3_000), 2026, WIDTH, 0);

    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false)).toBe(
      true,
    );
  });

  it("keeps human evolution enabled while pre-civilization time is still in view", () => {
    const viewport = getViewportForRange(-8_000, 2026, WIDTH, 0);

    expect(shouldAutoSuppressHumanEvolution(viewport, WIDTH, PAD, false)).toBe(
      false,
    );
  });

  it("supports viewport-start handoff rules for drill-past suppression", () => {
    const viewport = getViewportForRange(bce(3_000), 2026, WIDTH, 0);

    expect(
      shouldAutoSuppressTimelineLayer(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        viewport,
        WIDTH,
        PAD,
        false,
      ),
    ).toBe(true);
  });

  it("only enables deep time life auto-hide when the human set is enabled", () => {
    expect(
      isTimelineLayerAutoToggleEnabled(
        DEEP_TIME_LIFE_AUTO_TOGGLE_RULE,
        new Set(["earth"]),
        new Set(["deep-time-life"]),
        new Set(["human-evolution"]),
      ),
    ).toBe(false);

    expect(
      isTimelineLayerAutoToggleEnabled(
        DEEP_TIME_LIFE_AUTO_TOGGLE_RULE,
        new Set(["earth", "human"]),
        new Set(["deep-time-life"]),
        new Set(["human-evolution"]),
      ),
    ).toBe(true);
  });

  it("keeps deep time life auto-hide disabled until human evolution is actually visible", () => {
    expect(
      isTimelineLayerAutoToggleEnabled(
        DEEP_TIME_LIFE_AUTO_TOGGLE_RULE,
        new Set(["earth", "human"]),
        new Set(["deep-time-life", "human-evolution"]),
        new Set(["deep-time-life"]),
      ),
    ).toBe(false);

    expect(
      isTimelineLayerAutoToggleEnabled(
        DEEP_TIME_LIFE_AUTO_TOGGLE_RULE,
        new Set(["earth", "human"]),
        new Set(["deep-time-life", "human-evolution"]),
        new Set(["human-evolution"]),
      ),
    ).toBe(true);
  });

  it("only enables human evolution auto-hide when civilizations are enabled", () => {
    expect(
      isTimelineLayerAutoToggleEnabled(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        new Set(["human"]),
        new Set(["human-evolution"]),
        new Set(["human-evolution"]),
      ),
    ).toBe(false);

    expect(
      isTimelineLayerAutoToggleEnabled(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        new Set(["human"]),
        new Set(["human-evolution", "civilizations"]),
        new Set(["civilizations"]),
      ),
    ).toBe(true);
  });

  it("keeps human evolution auto-hide disabled until civilizations are actually visible", () => {
    expect(
      isTimelineLayerAutoToggleEnabled(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        new Set(["human"]),
        new Set(["human-evolution", "civilizations"]),
        new Set(["human-evolution"]),
      ),
    ).toBe(false);

    expect(
      isTimelineLayerAutoToggleEnabled(
        HUMAN_EVOLUTION_AUTO_TOGGLE_RULE,
        new Set(["human"]),
        new Set(["human-evolution", "civilizations"]),
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

  it("suppresses deep time life once the viewport has drilled fully into human evolution time", () => {
    const viewport = getViewportForRange(
      getTimelineYearFromYearsAgo(6_000_000),
      2026,
      WIDTH,
      0,
    );

    expect(shouldAutoSuppressDeepTimeLife(viewport, WIDTH, PAD, false)).toBe(
      true,
    );
  });
});
