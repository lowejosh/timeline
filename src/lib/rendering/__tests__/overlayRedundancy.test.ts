import { describe, expect, it } from "vitest";
import { DEEP_TIME_LIFE_OVERLAYS } from "../../domain/overlays/deepTimeLife";
import { HUMAN_EVOLUTION_OVERLAYS } from "../../domain/overlays/humanEvolution";
import { TIMELINE_DECORATION_CATEGORY_IDS } from "../../catalog/decorations";
import { getAutoHiddenOverlayIds } from "../overlayRedundancy";
import { getViewportForRange } from "../../core/viewport";

const WIDTH = 1200;
const PAD = 120;
const OVERLAYS = [...DEEP_TIME_LIFE_OVERLAYS, ...HUMAN_EVOLUTION_OVERLAYS];
const HOMO_SAPIENS_RULE = HUMAN_EVOLUTION_OVERLAYS.find(
  (overlay) => overlay.id === "homo-sapiens",
)?.autoToggleRule;
const AGE_OF_MAMMALS_RULE = DEEP_TIME_LIFE_OVERLAYS.find(
  (overlay) => overlay.id === "age-of-mammals",
)?.autoToggleRule;

describe("overlay redundancy", () => {
  it("stores the redundancy rules on the overlay bands themselves", () => {
    expect(HOMO_SAPIENS_RULE).toMatchObject({
      kind: "max-visible-span",
      hideAtOrBelowYears: 25_000,
    });
    expect(AGE_OF_MAMMALS_RULE).toMatchObject({
      kind: "max-visible-span",
      hideAtOrBelowYears: 10_500_000,
      onlyWhenAnyGroupVisible: ["human-evolution"],
    });
  });

  it("hides only homo sapiens at civilization-scale zoom when civilizations are visible", () => {
    const viewport = getViewportForRange(-6_000, 2_026, WIDTH, 0);

    const hiddenIds = getAutoHiddenOverlayIds(
      OVERLAYS,
      viewport,
      WIDTH,
      PAD,
      new Set(["human"]),
      new Set(["human-evolution", "civilizations"]),
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.civilizations]),
    );

    expect(hiddenIds.has("homo-sapiens")).toBe(true);
    expect(hiddenIds.has("age-of-mammals")).toBe(false);
  });

  it("keeps homo sapiens visible when the zoom is still broad", () => {
    const viewport = getViewportForRange(
      -50_000,
      2_026,
      WIDTH,
      0,
    );

    const hiddenIds = getAutoHiddenOverlayIds(
      OVERLAYS,
      viewport,
      WIDTH,
      PAD,
      new Set(["human"]),
      new Set(["human-evolution", "civilizations"]),
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.civilizations]),
    );

    expect(hiddenIds.has("homo-sapiens")).toBe(false);
  });

  it("hides only age of mammals at human-evolution scale zoom when human evolution is visible", () => {
    const viewport = getViewportForRange(-8_000_000, 2_026, WIDTH, 0);

    const hiddenIds = getAutoHiddenOverlayIds(
      OVERLAYS,
      viewport,
      WIDTH,
      PAD,
      new Set(["earth", "human"]),
      new Set(["deep-time-life", "human-evolution"]),
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution]),
    );

    expect(hiddenIds.has("age-of-mammals")).toBe(true);
    expect(hiddenIds.has("homo-sapiens")).toBe(false);
  });

  it("keeps age of mammals visible at broader deep-time zoom spans", () => {
    const viewport = getViewportForRange(
      -25_000_000,
      2_026,
      WIDTH,
      0,
    );

    const hiddenIds = getAutoHiddenOverlayIds(
      OVERLAYS,
      viewport,
      WIDTH,
      PAD,
      new Set(["earth", "human"]),
      new Set(["deep-time-life", "human-evolution"]),
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution]),
    );

    expect(hiddenIds.has("age-of-mammals")).toBe(false);
  });
});
