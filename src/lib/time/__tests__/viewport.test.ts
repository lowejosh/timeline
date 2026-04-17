import { describe, expect, it } from "vitest";
import {
  getMaxZoomForViewport,
  getMinZoomForWidth,
  getZoomAnchorForCanvasX,
  getMaxZoomForWidth,
  getPrecisionLimitedYearsPerPixel,
  getViewportPrecisionLimitedYearsPerPixel,
  getVisibleRange,
  getMinVisibleRangeDaysForWidth,
  MIN_VISIBLE_RANGE_DAYS,
  MAX_ZOOM_DAY_TICK_SPACING_PX,
  getViewportForRange,
  normalizeViewport,
  panByPixels,
  screenToWorld,
  TIMELINE_MAX_YEAR,
  TIMELINE_MIN_YEAR,
  worldToScreen,
  zoomAtPosition,
} from "../viewport";
import {
  getLogarithmicAxisRangeFactor,
  getLogarithmicScreenDeltaFromYearsDelta,
  getLogarithmicYearsDeltaFromScreenDelta,
  resolveLogarithmicAxisGeometry,
} from "../logarithmicAxis";

const FLOAT_EPSILON = 1e-9;

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
    expect(visibleEnd + FLOAT_EPSILON).toBeGreaterThanOrEqual(
      TIMELINE_MAX_YEAR,
    );
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
    const viewport = getViewportForRange(
      -13_800_000_000,
      -4_000_000_000,
      width,
      0,
    );
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
    const zoomed = zoomAtPosition(
      viewport,
      viewport.zoom + 1,
      anchorX,
      innerWidth,
    );
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
    const zoomed = zoomAtPosition(
      viewport,
      viewport.zoom + 1,
      anchorX,
      innerWidth,
    );
    const rightAfter = screenToWorld(innerWidth, zoomed, innerWidth);

    expect(rightAfter).toBeCloseTo(rightBefore, 3);
  });

  it("uses a width-aware day-scale visible-range floor at maximum zoom", () => {
    const width = 1200;
    const viewport = normalizeViewport(
      {
        centerYear: TIMELINE_MAX_YEAR,
        zoom: getMaxZoomForWidth(width) + 10,
      },
      width,
    );
    const [visibleStart, visibleEnd] = getVisibleRange(viewport, width);
    const visibleDays = (visibleEnd - visibleStart) * 365.2425;
    const precisionLimitedDays =
      getViewportPrecisionLimitedYearsPerPixel(viewport) * width * 365.2425;
    const effectiveVisibleRangeDays = getMinVisibleRangeDaysForWidth(width);

    expect(viewport.zoom).toBeCloseTo(getMaxZoomForWidth(width), 6);
    expect(effectiveVisibleRangeDays).toBeGreaterThanOrEqual(
      MIN_VISIBLE_RANGE_DAYS,
    );
    expect(effectiveVisibleRangeDays).toBeCloseTo(
      width / MAX_ZOOM_DAY_TICK_SPACING_PX,
      6,
    );
    expect(visibleDays).toBeGreaterThanOrEqual(
      effectiveVisibleRangeDays * 0.99,
    );
    expect(visibleDays).toBeLessThanOrEqual(effectiveVisibleRangeDays * 1.01);
    expect(precisionLimitedDays).toBeLessThan(effectiveVisibleRangeDays);
  });

  it("reduces allowed zoom further for very large-magnitude center years", () => {
    const width = 1200;

    expect(getMaxZoomForViewport(-13_800_000_000, width)).toBeLessThanOrEqual(
      getMaxZoomForViewport(TIMELINE_MAX_YEAR, width),
    );
    expect(getPrecisionLimitedYearsPerPixel(-13_800_000_000)).toBeGreaterThan(
      getPrecisionLimitedYearsPerPixel(TIMELINE_MAX_YEAR),
    );
  });

  it("tracks the present boundary past January first", () => {
    expect(TIMELINE_MAX_YEAR).toBeGreaterThan(new Date().getUTCFullYear());
    expect(TIMELINE_MAX_YEAR).toBeLessThan(new Date().getUTCFullYear() + 1);
  });

  it("round-trips logarithmic axis deltas", () => {
    const geometry = resolveLogarithmicAxisGeometry(25);
    const sourceDelta = 123_456_789;
    const screenDelta = getLogarithmicScreenDeltaFromYearsDelta(
      sourceDelta,
      geometry,
    );

    expect(
      getLogarithmicYearsDeltaFromScreenDelta(screenDelta, geometry),
    ).toBeCloseTo(sourceDelta, 6);
    expect(getLogarithmicAxisRangeFactor(1200)).toBeGreaterThan(1200);
  });

  it("round-trips between world and screen coordinates in logarithmic mode", () => {
    const viewport = {
      centerYear: -1_000_000,
      zoom: 20,
      scaleMode: "logarithmic" as const,
    };
    const width = 1200;
    const sourceYear = -987_654.321;

    const screenX = worldToScreen(sourceYear, viewport, width);
    const roundTrip = screenToWorld(screenX, viewport, width);

    expect(roundTrip).toBeCloseTo(sourceYear, 6);
  });

  it("preserves the zoom anchor in logarithmic mode", () => {
    const viewport = {
      centerYear: -50_000,
      zoom: 18,
      scaleMode: "logarithmic" as const,
    };
    const width = 1000;
    const anchorX = 320;
    const anchoredYear = screenToWorld(anchorX, viewport, width);

    const zoomed = zoomAtPosition(viewport, viewport.zoom + 3, anchorX, width);

    expect(screenToWorld(anchorX, zoomed, width)).toBeCloseTo(anchoredYear, 6);
  });

  it("fits the full timeline exactly at minimum zoom in logarithmic mode", () => {
    const width = 1200;
    const viewport = normalizeViewport(
      {
        centerYear: (TIMELINE_MIN_YEAR + TIMELINE_MAX_YEAR) / 2,
        zoom: getMinZoomForWidth(width, "logarithmic"),
        scaleMode: "logarithmic",
      },
      width,
    );

    const [visibleStart, visibleEnd] = getVisibleRange(viewport, width);

    expect(visibleStart).toBeCloseTo(TIMELINE_MIN_YEAR, 3);
    expect(visibleEnd).toBeCloseTo(TIMELINE_MAX_YEAR, 3);
  });
});
