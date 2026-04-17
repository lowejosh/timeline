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
      "parent",
      40,
      1,
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
      "parent",
      40,
      0.5,
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
      "parent",
      40,
      0,
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
});