import { describe, expect, it } from "vitest";
import { TIMELINE_DECORATION_CATEGORY_IDS } from "../../data/timelineDecorations";
import {
  AGE_OF_MAMMALS_REDUNDANT_VISIBLE_SPAN_YEARS,
  getAutoHiddenOverlayIds,
  HOMO_SAPIENS_REDUNDANT_VISIBLE_SPAN_YEARS,
} from "../overlayRedundancy";
import { getViewportForRange } from "../viewport";

const WIDTH = 1200;
const PAD = 120;

describe("overlay redundancy", () => {
  it("hides only homo sapiens at civilization-scale zoom when civilizations are visible", () => {
    const viewport = getViewportForRange(-6_000, 2_026, WIDTH, 0);

    const hiddenIds = getAutoHiddenOverlayIds(
      viewport,
      WIDTH,
      PAD,
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.civilizations]),
    );

    expect(hiddenIds.has("homo-sapiens")).toBe(true);
    expect(hiddenIds.has("age-of-mammals")).toBe(false);
  });

  it("keeps homo sapiens visible when the zoom is still broad", () => {
    const viewport = getViewportForRange(
      -HOMO_SAPIENS_REDUNDANT_VISIBLE_SPAN_YEARS * 2,
      2_026,
      WIDTH,
      0,
    );

    const hiddenIds = getAutoHiddenOverlayIds(
      viewport,
      WIDTH,
      PAD,
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.civilizations]),
    );

    expect(hiddenIds.has("homo-sapiens")).toBe(false);
  });

  it("hides only age of mammals at human-evolution scale zoom when human evolution is visible", () => {
    const viewport = getViewportForRange(-8_000_000, 2_026, WIDTH, 0);

    const hiddenIds = getAutoHiddenOverlayIds(
      viewport,
      WIDTH,
      PAD,
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution]),
    );

    expect(hiddenIds.has("age-of-mammals")).toBe(true);
    expect(hiddenIds.has("homo-sapiens")).toBe(false);
  });

  it("keeps age of mammals visible at broader deep-time zoom spans", () => {
    const viewport = getViewportForRange(
      -AGE_OF_MAMMALS_REDUNDANT_VISIBLE_SPAN_YEARS * 2,
      2_026,
      WIDTH,
      0,
    );

    const hiddenIds = getAutoHiddenOverlayIds(
      viewport,
      WIDTH,
      PAD,
      new Set([TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution]),
    );

    expect(hiddenIds.has("age-of-mammals")).toBe(false);
  });
});
