import { describe, expect, it } from "vitest";
import type { Era } from "../data/eras";
import {
  getEraChildOpacity,
  getVisibleEraFillRatio,
  resolveTimelineEraLayers,
} from "./childLayers";
import { getViewportForRange } from "./viewport";

function makeEra(id: string, startYear: number, endYear: number): Era {
  return {
    id,
    name: id,
    startYear,
    endYear,
    color: "rgba(0, 0, 0, 0.2)",
  };
}

describe("timeline child layers", () => {
  it("measures visible fill ratio using clipped viewport width", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const viewport = getViewportForRange(-100, 100, innerWidth, 0);
    const era = makeEra("left-half", -200, 0);

    expect(getVisibleEraFillRatio(era, viewport, width, pad)).toBeCloseTo(0.5, 1);
  });

  it("can resolve multiple sibling descendant layers at once", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const viewport = getViewportForRange(-100, 100, innerWidth, 0);
    const left = makeEra("left", -100, 0);
    left.children = [makeEra("left-child", -100, -50)];
    const right = makeEra("right", 0, 100);
    right.children = [makeEra("right-child", 50, 100)];

    const layers = resolveTimelineEraLayers(
      [left, right],
      "none",
      viewport,
      width,
      pad,
      false,
    );

    expect(layers.filter((layer) => layer.depth === 1)).toHaveLength(2);
    expect(layers.some((layer) => layer.era.id === "left-child")).toBe(true);
    expect(layers.some((layer) => layer.era.id === "right-child")).toBe(true);
  });

  it("snaps the active era child transition to full opacity during animation", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const viewport = getViewportForRange(-100, 100, innerWidth, 0);
    const era = makeEra("focus", -100, 0);
    era.children = [makeEra("focus-child", -100, -50)];

    expect(
      getEraChildOpacity(era, "focus", viewport, width, pad, true),
    ).toBe(1);
  });

  it("resolves grandchildren when a child fills enough of the viewport", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const child = makeEra("child", -100, 0);
    child.children = [makeEra("grandchild", -100, -50)];
    const parent = makeEra("parent", -100, 0);
    parent.children = [child];
    const viewport = getViewportForRange(-100, 0, innerWidth, 0);

    const layers = resolveTimelineEraLayers(
      [parent],
      "none",
      viewport,
      width,
      pad,
      false,
    );

    expect(layers.some((layer) => layer.era.id === "grandchild")).toBe(true);
  });
});
