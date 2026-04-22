import { describe, expect, it } from "vitest";
import {
  getExpandedOverlayPanelBounds,
  resolveExpandedOverlayLayout,
} from "../expandedOverlayLayout";

describe("expanded overlay layout", () => {
  it("globally repacks visible overlays into the lowest valid positions", () => {
    const { yById } = resolveExpandedOverlayLayout(
      [
        {
          id: "below",
          laneIndex: 0,
          renderX: 0,
          renderWidth: 80,
          baseY: 200,
        },
        {
          id: "parent",
          laneIndex: 1,
          renderX: 0,
          renderWidth: 80,
          baseY: 176,
        },
        {
          id: "overlap-upper",
          laneIndex: 2,
          renderX: 0,
          renderWidth: 80,
          baseY: 152,
        },
        {
          id: "cascade-upper",
          laneIndex: 3,
          renderX: 0,
          renderWidth: 80,
          baseY: 128,
        },
        {
          id: "far-upper",
          laneIndex: 4,
          renderX: 120,
          renderWidth: 60,
          baseY: 104,
        },
      ],
      [
        {
          parentId: "parent",
          panelHeight: 40,
          expansionProgress: 1,
        },
      ],
      200,
      16,
      8,
    );

    expect(yById.get("below")).toBe(200);
    expect(yById.get("parent")).toBe(136);
    expect(yById.get("overlap-upper")).toBe(112);
    expect(yById.get("cascade-upper")).toBe(88);
    expect(yById.get("far-upper")).toBe(200);
  });

  it("eases non-parent overlays toward their packed positions during expansion", () => {
    const { yById } = resolveExpandedOverlayLayout(
      [
        {
          id: "below",
          laneIndex: 0,
          renderX: 0,
          renderWidth: 80,
          baseY: 200,
        },
        {
          id: "parent",
          laneIndex: 1,
          renderX: 0,
          renderWidth: 80,
          baseY: 176,
        },
        {
          id: "overlap-upper",
          laneIndex: 2,
          renderX: 0,
          renderWidth: 80,
          baseY: 152,
        },
        {
          id: "cascade-upper",
          laneIndex: 3,
          renderX: 0,
          renderWidth: 80,
          baseY: 128,
        },
        {
          id: "far-upper",
          laneIndex: 4,
          renderX: 120,
          renderWidth: 60,
          baseY: 104,
        },
      ],
      [
        {
          parentId: "parent",
          panelHeight: 40,
          expansionProgress: 0.5,
        },
      ],
      200,
      16,
      8,
    );

    expect(yById.get("below")).toBe(200);
    expect(yById.get("parent")).toBe(156);
    expect(yById.get("overlap-upper")).toBe(132);
    expect(yById.get("cascade-upper")).toBe(108);
    expect(yById.get("far-upper")).toBe(152);
  });

  it("keeps all overlays at their base positions when expansion has not started", () => {
    const { yById } = resolveExpandedOverlayLayout(
      [
        {
          id: "below",
          laneIndex: 0,
          renderX: 0,
          renderWidth: 80,
          baseY: 200,
        },
        {
          id: "parent",
          laneIndex: 1,
          renderX: 0,
          renderWidth: 80,
          baseY: 176,
        },
        {
          id: "overlap-upper",
          laneIndex: 2,
          renderX: 0,
          renderWidth: 80,
          baseY: 152,
        },
      ],
      [
        {
          parentId: "parent",
          panelHeight: 40,
          expansionProgress: 0,
        },
      ],
      200,
      16,
      8,
    );

    expect(yById.get("below")).toBe(200);
    expect(yById.get("parent")).toBe(176);
    expect(yById.get("overlap-upper")).toBe(152);
  });

  it("places the expanded panel directly underneath the shifted parent band", () => {
    expect(getExpandedOverlayPanelBounds(136, 40, 16)).toEqual({
      panelTop: 152,
      panelBottom: 192,
      unionTop: 136,
      unionHeight: 56,
    });
  });

  it("only pushes overlays whose current screen positions would collide with the expanded parent", () => {
    const { yById } = resolveExpandedOverlayLayout(
      [
        {
          id: "below",
          laneIndex: 0,
          renderX: 0,
          renderWidth: 80,
          baseY: 200,
        },
        {
          id: "parent",
          laneIndex: 1,
          renderX: 0,
          renderWidth: 80,
          baseY: 176,
        },
        {
          id: "overlap-upper",
          laneIndex: 2,
          renderX: 0,
          renderWidth: 80,
          baseY: 152,
        },
        {
          id: "non-overlap-upper",
          laneIndex: 3,
          renderX: 160,
          renderWidth: 60,
          baseY: 128,
        },
      ],
      [
        {
          parentId: "parent",
          panelHeight: 40,
          expansionProgress: 1,
        },
      ],
      200,
      16,
      8,
    );

    expect(yById.get("below")).toBe(200);
    expect(yById.get("parent")).toBe(136);
    expect(yById.get("overlap-upper")).toBe(112);
    expect(yById.get("non-overlap-upper")).toBe(200);
  });

  it("supports two expanded parents at once", () => {
    const { yById } = resolveExpandedOverlayLayout(
      [
        {
          id: "below",
          laneIndex: 0,
          renderX: 0,
          renderWidth: 80,
          baseY: 200,
        },
        {
          id: "parent-a",
          laneIndex: 1,
          renderX: 0,
          renderWidth: 80,
          baseY: 176,
        },
        {
          id: "between",
          laneIndex: 2,
          renderX: 0,
          renderWidth: 80,
          baseY: 152,
        },
        {
          id: "parent-b",
          laneIndex: 3,
          renderX: 0,
          renderWidth: 80,
          baseY: 128,
        },
        {
          id: "upper",
          laneIndex: 4,
          renderX: 0,
          renderWidth: 80,
          baseY: 104,
        },
      ],
      [
        {
          parentId: "parent-a",
          panelHeight: 40,
          expansionProgress: 1,
        },
        {
          parentId: "parent-b",
          panelHeight: 40,
          expansionProgress: 1,
        },
      ],
      200,
      16,
      8,
    );

    expect(yById.get("below")).toBe(200);
    expect(yById.get("parent-a")).toBe(136);
    expect(yById.get("between")).toBe(112);
    expect(yById.get("parent-b")).toBe(48);
    expect(yById.get("upper")).toBe(24);
  });
});
