import { describe, expect, it } from "vitest";
import {
  isAnimatedContextBandLabelStateActive,
  resolveAnimatedContextBandLabelLayers,
  resolveContextBandLabelVariant,
  resolveContextBandRenderState,
  resolveOverlayLabelPaint,
  stepAnimatedContextBandLabelState,
  syncAnimatedContextBandLabelState,
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

  it("prefers light text for warmer mid-tone bands once the fill gets stronger", () => {
    expect(
      resolveOverlayLabelPaint({
        bandColor: "rgb(186, 144, 108)",
        bandOpacity: 1,
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

  it("uses hysteresis for short and full context-band labels", () => {
    expect(
      resolveContextBandLabelVariant({
        availableWidth: 35,
        fullLabelWidth: 46,
        shortLabelWidth: 20,
        currentVariant: "hidden",
      }),
    ).toBe("hidden");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 36,
        fullLabelWidth: 46,
        shortLabelWidth: 20,
        currentVariant: "hidden",
      }),
    ).toBe("short");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 66,
        fullLabelWidth: 46,
        shortLabelWidth: 20,
        currentVariant: "short",
      }),
    ).toBe("full");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 58,
        fullLabelWidth: 46,
        shortLabelWidth: 20,
        currentVariant: "full",
      }),
    ).toBe("full");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 57,
        fullLabelWidth: 46,
        shortLabelWidth: 20,
        currentVariant: "full",
      }),
    ).toBe("short");
  });

  it("skips the short variant when no distinct short label exists", () => {
    expect(
      resolveContextBandLabelVariant({
        availableWidth: 50,
        fullLabelWidth: 46,
        shortLabelWidth: 46,
        currentVariant: "hidden",
        hasDistinctShortLabel: false,
      }),
    ).toBe("hidden");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 66,
        fullLabelWidth: 46,
        shortLabelWidth: 46,
        currentVariant: "hidden",
        hasDistinctShortLabel: false,
      }),
    ).toBe("full");

    expect(
      resolveContextBandLabelVariant({
        availableWidth: 66,
        fullLabelWidth: 46,
        shortLabelWidth: 46,
        currentVariant: "short",
        hasDistinctShortLabel: false,
      }),
    ).toBe("full");
  });

  it("queues label reversals instead of interrupting an in-flight transition", () => {
    const toShort = syncAnimatedContextBandLabelState({
      nextVariant: "short",
      now: 0,
      duration: 160,
      hasInitialized: true,
    });

    expect(toShort).toMatchObject({
      fromVariant: "hidden",
      toVariant: "short",
      queuedVariant: null,
    });
    expect(isAnimatedContextBandLabelStateActive(toShort, 20)).toBe(true);

    const toFull = syncAnimatedContextBandLabelState({
      existing: toShort,
      nextVariant: "full",
      now: 200,
      duration: 160,
      hasInitialized: true,
    });

    expect(toFull).toMatchObject({
      fromVariant: "short",
      toVariant: "full",
      queuedVariant: null,
    });

    const queuedHidden = syncAnimatedContextBandLabelState({
      existing: toFull,
      nextVariant: "hidden",
      now: 260,
      duration: 160,
      hasInitialized: true,
    });

    expect(queuedHidden).toMatchObject({
      fromVariant: "short",
      toVariant: "full",
      queuedVariant: "hidden",
    });

    const reversed = stepAnimatedContextBandLabelState(queuedHidden, 361);

    expect(reversed).toMatchObject({
      fromVariant: "full",
      toVariant: "hidden",
      queuedVariant: null,
      startTime: 361,
    });
  });

  it("resolves label layers from time-based animation progress", () => {
    const fadeIn = syncAnimatedContextBandLabelState({
      nextVariant: "short",
      now: 0,
      duration: 100,
      hasInitialized: true,
    });

    expect(resolveAnimatedContextBandLabelLayers(fadeIn, 0)).toEqual([
      { variant: "short", opacity: 0 },
    ]);

    expect(resolveAnimatedContextBandLabelLayers(fadeIn, 100)).toEqual([
      { variant: "short", opacity: 1 },
    ]);

    const swap = syncAnimatedContextBandLabelState({
      existing: {
        fromVariant: "short",
        toVariant: "short",
        queuedVariant: null,
        startTime: 100,
        duration: 100,
      },
      nextVariant: "full",
      now: 100,
      duration: 100,
      hasInitialized: true,
    });

    expect(resolveAnimatedContextBandLabelLayers(swap, 120)).toEqual([
      { variant: "short", opacity: expect.any(Number) },
    ]);
    expect(resolveAnimatedContextBandLabelLayers(swap, 180)).toEqual([
      { variant: "full", opacity: expect.any(Number) },
    ]);
  });
});
