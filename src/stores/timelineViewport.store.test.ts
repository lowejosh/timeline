import { describe, expect, it } from "vitest";

import { HOME_RANGE, worldToScreen } from "@/lib/core/viewport";

import { useTimelineViewportStore } from "./timelineViewport.store";

describe("useTimelineViewportStore", () => {
  it("refits the home range when the measured viewport width arrives", () => {
    const store = useTimelineViewportStore.getState();

    store.setViewportWidth(320);

    const { viewport, width } = useTimelineViewportStore.getState();

    expect(worldToScreen(HOME_RANGE[0], viewport, width)).toBeCloseTo(0);
    expect(worldToScreen(HOME_RANGE[1], viewport, width)).toBeCloseTo(width);
  });
});
