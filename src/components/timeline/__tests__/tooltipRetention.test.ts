import { describe, expect, it } from "vitest";
import {
  shouldRetainTooltipAtPoint,
  type TooltipRect,
  type TooltipRetentionAnchor,
} from "../tooltipRetention";

const SHELL_RECT: TooltipRect = {
  left: 0,
  right: 800,
  top: 0,
  bottom: 600,
};

const SOURCES_RECT: TooltipRect = {
  left: 320,
  right: 500,
  top: 180,
  bottom: 250,
};

const ABOVE_ANCHOR: TooltipRetentionAnchor = {
  anchorX: 410,
  anchorY: 280,
  placement: "above",
};

describe("tooltip retention", () => {
  it("does not retain the tooltip from the non-interactive header area", () => {
    expect(
      shouldRetainTooltipAtPoint(
        410,
        150,
        SHELL_RECT,
        SOURCES_RECT,
        ABOVE_ANCHOR,
        16,
      ),
    ).toBe(false);
  });

  it("retains the tooltip while hovering the sources area", () => {
    expect(
      shouldRetainTooltipAtPoint(
        410,
        210,
        SHELL_RECT,
        SOURCES_RECT,
        ABOVE_ANCHOR,
        16,
      ),
    ).toBe(true);
  });

  it("retains the tooltip in a small grace strip just above the sources area", () => {
    expect(
      shouldRetainTooltipAtPoint(
        410,
        171,
        SHELL_RECT,
        SOURCES_RECT,
        ABOVE_ANCHOR,
        16,
      ),
    ).toBe(true);
  });

  it("retains the tooltip through the bridge from the anchor to the sources area", () => {
    expect(
      shouldRetainTooltipAtPoint(
        410,
        265,
        SHELL_RECT,
        SOURCES_RECT,
        ABOVE_ANCHOR,
        16,
      ),
    ).toBe(true);
  });

  it("does not retain when there is no interactive sticky area", () => {
    expect(
      shouldRetainTooltipAtPoint(410, 210, SHELL_RECT, null, ABOVE_ANCHOR, 16),
    ).toBe(false);
  });
});
