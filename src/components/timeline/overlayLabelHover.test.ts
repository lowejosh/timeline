import { describe, expect, it } from "vitest";
import {
  resolveOverlayLabelHoverBounds,
  resolveTextHoverBounds,
} from "./overlayLabelHover";

describe("text hover bounds", () => {
  it("wraps a freestanding label with a small grace area", () => {
    expect(
      resolveTextHoverBounds({
        centerX: 300,
        labelWidth: 64,
        boxTop: 80,
        boxBottom: 91,
      }),
    ).toEqual({
      left: 258,
      right: 342,
      top: 74,
      bottom: 97,
    });
  });
});

describe("overlay label hover bounds", () => {
  it("wraps the visible label with grace padding instead of the full band", () => {
    expect(
      resolveOverlayLabelHoverBounds({
        centerX: 300,
        labelWidth: 64,
        bandLeft: 200,
        bandRight: 420,
        bandTop: 100,
        bandBottom: 116,
      }),
    ).toEqual({
      left: 258,
      right: 342,
      top: 94,
      bottom: 122,
    });
  });

  it("clamps the hover bounds to the band width", () => {
    expect(
      resolveOverlayLabelHoverBounds({
        centerX: 110,
        labelWidth: 80,
        bandLeft: 100,
        bandRight: 150,
        bandTop: 100,
        bandBottom: 116,
      }),
    ).toEqual({
      left: 100,
      right: 150,
      top: 94,
      bottom: 122,
    });
  });

  it("keeps very short labels reasonably hoverable", () => {
    expect(
      resolveOverlayLabelHoverBounds({
        centerX: 300,
        labelWidth: 8,
        bandLeft: 260,
        bandRight: 340,
        bandTop: 100,
        bandBottom: 116,
      }),
    ).toEqual({
      left: 286,
      right: 314,
      top: 94,
      bottom: 122,
    });
  });
});
