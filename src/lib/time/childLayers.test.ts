import { describe, expect, it } from "vitest";
import type { Era } from "../data/eras";
import {
  getEraChildOpacity,
  getEraChildOpacityTarget,
  getPreviewFocusChain,
  getVisibleEraFillRatio,
  resolveTimelineEraLayers,
  resolveTimelineEraLayersFromOpacityMap,
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

  it("uses hysteresis when deciding whether child eras stay expanded", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const era = makeEra("focus", -100, 0);
    era.children = [makeEra("focus-child", -100, -50)];

    const barelyExpandedViewport = getViewportForRange(-150, 14.2857142857, innerWidth, 0);
    const mostlyCollapsedViewport = getViewportForRange(-200, 200, innerWidth, 0);

    expect(
      getEraChildOpacityTarget(
        era,
        "focus",
        barelyExpandedViewport,
        width,
        pad,
        false,
        0,
      ),
    ).toBe(1);

    expect(
      getEraChildOpacityTarget(
        era,
        "focus",
        mostlyCollapsedViewport,
        width,
        pad,
        false,
        1,
      ),
    ).toBe(0);
  });

  it("can resolve descendant opacity from an animated child-opacity map", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const child = makeEra("child", -100, 0);
    child.children = [makeEra("grandchild", -100, -50)];
    const parent = makeEra("parent", -100, 0);
    parent.children = [child];
    const viewport = getViewportForRange(-100, 0, innerWidth, 0);

    const hiddenLayers = resolveTimelineEraLayersFromOpacityMap(
      [parent],
      "none",
      viewport,
      width,
      pad,
      new Map([
        ["parent", 0],
        ["child", 0],
      ]),
    );
    const shownLayers = resolveTimelineEraLayersFromOpacityMap(
      [parent],
      "none",
      viewport,
      width,
      pad,
      new Map([
        ["parent", 1],
        ["child", 1],
      ]),
    );

    expect(hiddenLayers.some((layer) => layer.era.id === "child")).toBe(false);
    expect(shownLayers.some((layer) => layer.era.id === "child")).toBe(true);
    expect(shownLayers.some((layer) => layer.era.id === "grandchild")).toBe(true);
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

  it("derives a focused preview chain from visible descendant layers", () => {
    const width = 1000;
    const pad = 100;
    const innerWidth = width - pad * 2;
    const middleBronzeAge = makeEra("middle-bronze-age", -2000, -1550);
    const bronzeAge = makeEra("bronze-age", -3300, -1200);
    bronzeAge.children = [middleBronzeAge];
    const humanHistory = makeEra("human-history", -300000, 2025);
    humanHistory.children = [bronzeAge];
    const geology = makeEra("cenozoic", -66000000, -300000);
    const viewport = getViewportForRange(-2600, -1400, innerWidth, 0);

    const layers = resolveTimelineEraLayers(
      [geology, humanHistory],
      "universe",
      viewport,
      width,
      pad,
      false,
    );

    expect(getPreviewFocusChain([geology, humanHistory], layers).map((era) => era.id)).toEqual([
      "human-history",
      "bronze-age",
    ]);
  });
});
