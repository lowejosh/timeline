import { describe, expect, it } from "vitest";
import {
  getZoomAnchorForCanvasX,
  getMaxZoomForWidth,
  getVisibleRange,
  getMinZoomForWidth,
  getViewportForRange,
  normalizeViewport,
  panByPixels,
  screenToWorld,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  worldToScreen,
  zoomAtPosition,
} from "./viewport";

describe("timeline viewport math", () => {
  it("round-trips between world and screen coordinates", () => {
    const viewport = { centerYear: 1900, zoom: 26 };
    const width = 1200;
    const sourceYear = 1969;

    const screenX = worldToScreen(sourceYear, viewport, width);
    const roundTrip = screenToWorld(screenX, viewport, width);

    expect(roundTrip).toBeCloseTo(sourceYear, 6);
  });

  it("preserves the world coordinate under the cursor during zoom", () => {
    const viewport = { centerYear: 1900, zoom: 22 };
    const width = 1000;
    const anchorX = 320;
    const anchoredYear = screenToWorld(anchorX, viewport, width);

    const zoomed = zoomAtPosition(viewport, viewport.zoom + 3, anchorX, width);

    expect(screenToWorld(anchorX, zoomed, width)).toBeCloseTo(anchoredYear, 6);
  });

  it("creates a viewport that contains the requested range", () => {
    const viewport = getViewportForRange(1500, TIMELINE_MAX_YEAR, 1200);
    const [visibleStart, visibleEnd] = getVisibleRange(viewport, 1200);

    expect(visibleStart).toBeLessThanOrEqual(1500);
    expect(visibleEnd).toBeGreaterThanOrEqual(TIMELINE_MAX_YEAR);
  });

  it("fits the full timeline exactly at minimum zoom", () => {
    const width = 1200;
    const viewport = normalizeViewport(
      {
        centerYear: (TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2,
        zoom: getMinZoomForWidth(width),
      },
      width,
    );

    const [visibleStart, visibleEnd] = getVisibleRange(viewport, width);

    expect(visibleStart).toBeCloseTo(TIMELINE_MIN_YEAR, 3);
    expect(visibleEnd).toBeCloseTo(TIMELINE_MAX_YEAR, 3);
  });

  it("does not allow panning past the present edge", () => {
    const width = 1200;
    const viewport = getViewportForRange(1500, TIMELINE_MAX_YEAR, width, 0);
    const panned = panByPixels(viewport, -100000, width);
    const [, visibleEnd] = getVisibleRange(panned, width);

    expect(visibleEnd).toBeCloseTo(TIMELINE_MAX_YEAR, 3);
  });

  it("does not allow panning past the start edge", () => {
    const width = 1200;
    const viewport = getViewportForRange(-13_800_000_000, -4_000_000_000, width, 0);
    const panned = panByPixels(viewport, 100000, width);
    const [visibleStart] = getVisibleRange(panned, width);

    expect(visibleStart).toBeCloseTo(TIMELINE_MIN_YEAR, 3);
  });

  it("uses the left edge as the zoom anchor from the left margin", () => {
    expect(getZoomAnchorForCanvasX(40, 1200, 120)).toBe(0);
  });

  it("uses the right edge as the zoom anchor from the right margin", () => {
    expect(getZoomAnchorForCanvasX(1180, 1200, 120)).toBe(960);
  });

  it("keeps the left edge fixed when zooming from the left margin", () => {
    const canvasWidth = 1200;
    const pad = 120;
    const innerWidth = canvasWidth - pad * 2;
    const viewport = normalizeViewport(
      {
        centerYear: (TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2,
        zoom: getMinZoomForWidth(innerWidth),
      },
      innerWidth,
    );

    const leftBefore = screenToWorld(0, viewport, innerWidth);
    const anchorX = getZoomAnchorForCanvasX(40, canvasWidth, pad);
    const zoomed = zoomAtPosition(viewport, viewport.zoom + 1, anchorX, innerWidth);
    const leftAfter = screenToWorld(0, zoomed, innerWidth);

    expect(leftAfter).toBeCloseTo(leftBefore, 3);
  });

  it("keeps the right edge fixed when zooming from the right margin", () => {
    const canvasWidth = 1200;
    const pad = 120;
    const innerWidth = canvasWidth - pad * 2;
    const viewport = normalizeViewport(
      {
        centerYear: (TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2,
        zoom: getMinZoomForWidth(innerWidth),
      },
      innerWidth,
    );

    const rightBefore = screenToWorld(innerWidth, viewport, innerWidth);
    const anchorX = getZoomAnchorForCanvasX(1180, canvasWidth, pad);
    const zoomed = zoomAtPosition(viewport, viewport.zoom + 1, anchorX, innerWidth);
    const rightAfter = screenToWorld(innerWidth, zoomed, innerWidth);

    expect(rightAfter).toBeCloseTo(rightBefore, 3);
  });

  it("caps max zoom so at least about fourteen days stay in view", () => {
    const width = 1200;
    const viewport = normalizeViewport(
      {
        centerYear: TIMELINE_MAX_YEAR,
        zoom: getMaxZoomForWidth(width) + 10,
      },
      width,
    );
    const [visibleStart, visibleEnd] = getVisibleRange(viewport, width);

    expect(viewport.zoom).toBeCloseTo(getMaxZoomForWidth(width), 6);
    expect(visibleEnd - visibleStart).toBeGreaterThanOrEqual(14 / 365.2425 - 1e-6);
  });

  it("tracks the present boundary past January first", () => {
    expect(TIMELINE_MAX_YEAR).toBeGreaterThan(new Date().getUTCFullYear());
    expect(TIMELINE_MAX_YEAR).toBeLessThan(new Date().getUTCFullYear() + 1);
  });
});
