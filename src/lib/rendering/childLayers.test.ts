import { describe, expect, it } from "vitest";

import { getViewportForRange } from "@/lib/core/viewport";
import type { Era } from "@/lib/catalog/eras";

import { getEraChildOpacityTarget } from "./childLayers";

const parentEra: Era = {
  id: "parent",
  name: "Parent",
  startYear: 0,
  endYear: 100,
  color: "rgb(0, 0, 0)",
  children: [
    {
      id: "child",
      name: "Child",
      startYear: 0,
      endYear: 100,
      color: "rgb(255, 255, 255)",
    },
  ],
};

describe("getEraChildOpacityTarget", () => {
  it("allows child eras to expand during panning-sized viewport updates", () => {
    const viewport = getViewportForRange(0, 100, 1000, 0);

    expect(
      getEraChildOpacityTarget(
        parentEra,
        "root",
        viewport,
        1000,
        0,
        false,
        0,
        false,
      ),
    ).toBe(1);
  });

  it("does not newly expand child eras while zooming out", () => {
    const viewport = getViewportForRange(0, 100, 1000, 0);

    expect(
      getEraChildOpacityTarget(
        parentEra,
        "root",
        viewport,
        1000,
        0,
        false,
        0,
        true,
      ),
    ).toBe(0);
  });
});
