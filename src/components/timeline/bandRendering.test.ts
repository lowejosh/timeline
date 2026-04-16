import { describe, expect, it } from "vitest";
import {
  resolveContextBandRenderState,
  resolveOverlayLabelPaint,
} from "./bandRendering";

describe("band rendering helpers", () => {
  it("switches medium-dark overlay bands to light text more aggressively", () => {
    expect(
      resolveOverlayLabelPaint({
        bandColor: "rgb(118, 132, 186)",
        bandOpacity: 0.9,
        fallbackLabelColor: "rgba(53, 39, 29, 0.92)",
        backgroundColor: "#f7f0e2",
      }).usesLightLabel,
    ).toBe(true);
  });

  it("keeps dark text for lighter warm bands", () => {
    expect(
      resolveOverlayLabelPaint({
        bandColor: "rgb(202, 156, 105)",
        bandOpacity: 0.9,
        fallbackLabelColor: "rgba(53, 39, 29, 0.92)",
        backgroundColor: "#f7f0e2",
      }).usesLightLabel,
    ).toBe(false);
  });

  it("keeps context bands visible down into subpixel widths", () => {
    const renderState = resolveContextBandRenderState({
      x0: 100,
      x1: 100.8,
      minX: 0,
      maxX: 200,
    });

    expect(renderState).toMatchObject({
      renderLeft: 100,
      renderWidth: 1,
    });
    expect(renderState?.visibleWidth).toBeCloseTo(0.8, 6);
    expect(renderState?.alphaMultiplier).toBeCloseTo(0.8, 6);
  });

  it("keeps full alpha once the visible width has reached a whole pixel", () => {
    const renderState = resolveContextBandRenderState({
      x0: 100,
      x1: 101.2,
      minX: 0,
      maxX: 200,
    });

    expect(renderState).toMatchObject({
      renderLeft: 100,
      alphaMultiplier: 1,
    });
    expect(renderState?.renderWidth).toBeCloseTo(1.2, 6);
  });

  it("uses a single-device-pixel hairline on high-DPI canvases", () => {
    const renderState = resolveContextBandRenderState({
      x0: 100,
      x1: 100.4,
      minX: 0,
      maxX: 200,
      devicePixelRatio: 2,
    });

    expect(renderState).toMatchObject({
      renderLeft: 100,
      renderWidth: 0.5,
    });
    expect(renderState?.visibleWidth).toBeCloseTo(0.4, 6);
    expect(renderState?.alphaMultiplier).toBeCloseTo(0.8, 6);
  });

  it("drops high-DPI context bands below half a device pixel", () => {
    expect(
      resolveContextBandRenderState({
        x0: 100,
        x1: 100.24,
        minX: 0,
        maxX: 200,
        devicePixelRatio: 2,
      }),
    ).toBeNull();
  });

  it("drops context bands once the clipped width falls below half a pixel", () => {
    expect(
      resolveContextBandRenderState({
        x0: 100,
        x1: 100.49,
        minX: 0,
        maxX: 200,
      }),
    ).toBeNull();
  });
});