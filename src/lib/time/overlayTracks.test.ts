import { describe, expect, it } from "vitest";
import { ANCIENT_CIVILIZATION_OVERLAYS } from "../data/overlays/ancientCivilizations";
import { POST_CLASSICAL_EARLY_MODERN_OVERLAYS } from "../data/overlays/postClassicalEarlyModern";
import type { TimelineMarker, TimelineOverlayBand } from "../data/timelineTypes";
import {
  getVisibleTimelineMarkers,
  resolveTimelineOverlayTracks,
} from "./overlayTracks";

describe("timeline overlay tracks", () => {
  it("filters markers by zoom visibility and viewport range", () => {
    const width = 1000;
    const pad = 100;
    const markers: TimelineMarker[] = [
      {
        id: "visible",
        label: "Visible marker",
        year: -4_560_000_000,
        minZoom: 8,
      },
      {
        id: "too-zoomed-out",
        label: "Too zoomed out",
        year: -4_540_000_000,
        minZoom: 10,
      },
      {
        id: "off-screen",
        label: "Off screen",
        year: -100,
        minZoom: 8,
      },
    ];

    const viewport = {
      centerYear: -4_550_000_000,
      zoom: 9,
    };

    expect(getVisibleTimelineMarkers(markers, viewport, width, pad).map((marker) => marker.id)).toEqual([
      "visible",
    ]);
  });

  it("packs overlapping overlays into separate lanes and reuses free lanes", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "a",
        label: "A",
        startYear: -3500,
        endYear: -2500,
        color: "rgba(0, 0, 0, 0.1)",
      },
      {
        id: "b",
        label: "B",
        startYear: -3400,
        endYear: -1500,
        color: "rgba(0, 0, 0, 0.1)",
      },
      {
        id: "c",
        label: "C",
        startYear: -2000,
        endYear: -1000,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: -2250,
      zoom: 21,
    };

    const resolved = resolveTimelineOverlayTracks(overlays, viewport, width, pad);

    expect(resolved.map((band) => band.band.id)).toEqual(["a", "b", "c"]);
    expect(resolved.map((band) => band.laneIndex)).toEqual([0, 1, 0]);
    expect(resolved.every((band) => band.laneCount === 2)).toBe(true);
    expect(resolved.every((band) => band.visibilityProgress === 1)).toBe(true);
  });

  it("keeps lane count stable even when only a subset is visible", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "a",
        label: "A",
        startYear: -3500,
        endYear: -2500,
        color: "rgba(0, 0, 0, 0.1)",
      },
      {
        id: "b",
        label: "B",
        startYear: -3400,
        endYear: -1500,
        color: "rgba(0, 0, 0, 0.1)",
      },
      {
        id: "c",
        label: "C",
        startYear: -1200,
        endYear: -1000,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: -1100,
      zoom: 27,
    };

    const resolved = resolveTimelineOverlayTracks(overlays, viewport, width, pad);

    expect(resolved.map((band) => band.band.id)).toEqual(["c"]);
    expect(resolved[0].laneCount).toBe(2);
  });

  it("renders technically visible overlays at a minimum width of one pixel", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "tiny",
        label: "Tiny",
        startYear: -60_000_000,
        endYear: -10_000_000,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: 0,
      zoom: 0,
    };

    const resolved = resolveTimelineOverlayTracks(overlays, viewport, width, pad);

    expect(resolved).toHaveLength(1);
    expect(resolved[0].renderWidth).toBeGreaterThanOrEqual(1);
    expect(resolved[0].renderOpacity).toBeGreaterThan(0);
  });

  it("hides overlays once they fall below the tiny-width threshold", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "almost-gone",
        label: "Almost gone",
        startYear: -3,
        endYear: -2,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: 0,
      zoom: 0,
    };

    const resolved = resolveTimelineOverlayTracks(overlays, viewport, width, pad);

    expect(resolved).toHaveLength(0);
  });

  it("eases overlay visibility in near the zoom threshold", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "fade-in",
        label: "Fade in",
        startYear: -3500,
        endYear: -2500,
        color: "rgba(0, 0, 0, 0.1)",
        minZoom: 20,
      },
    ];

    const earlyViewport = {
      centerYear: -3000,
      zoom: 19.5,
    };
    const fullViewport = {
      centerYear: -3000,
      zoom: 20.5,
    };

    const earlyResolved = resolveTimelineOverlayTracks(
      overlays,
      earlyViewport,
      width,
      pad,
    );
    const fullResolved = resolveTimelineOverlayTracks(
      overlays,
      fullViewport,
      width,
      pad,
    );

    expect(earlyResolved).toHaveLength(1);
    expect(earlyResolved[0].visibilityProgress).toBeGreaterThan(0);
    expect(earlyResolved[0].visibilityProgress).toBeLessThan(1);
    expect(fullResolved[0].visibilityProgress).toBe(1);
  });

  it("keeps the expanded civilization overlays in stable lanes when visible", () => {
    const width = 1000;
    const pad = 100;
    const viewport = {
      centerYear: -1800,
      zoom: 21,
    };

    const resolved = resolveTimelineOverlayTracks(
      ANCIENT_CIVILIZATION_OVERLAYS,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual([
      "mesopotamia",
      "indus-valley-civilization",
      "ancient-egypt",
      "ancient-greece",
      "achaemenid-persia",
      "roman-republic",
      "hellenistic-world",
      "han-china",
      "roman-empire",
    ]);
    expect(new Set(resolved.map((band) => band.laneIndex)).size).toBe(4);
    expect(resolved.every((band) => band.laneCount === 4)).toBe(true);
  });

  it("keeps post-classical overlays in stable lanes around 1100 CE", () => {
    const width = 1000;
    const pad = 100;
    const viewport = {
      centerYear: 1100,
      zoom: 26,
    };

    const resolved = resolveTimelineOverlayTracks(
      POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual([
      "byzantine-empire",
      "abbasid-caliphate",
      "song-china",
      "mongol-empire",
      "ottoman-empire",
      "ming-dynasty",
    ]);
    expect(resolved.map((band) => band.laneIndex)).toEqual([0, 1, 2, 3, 1, 2]);
    expect(resolved.every((band) => band.laneCount === 5)).toBe(true);
  });

  it("shows the Mongol Empire band in the post-classical stack once it starts", () => {
    const width = 1000;
    const pad = 100;
    const viewport = {
      centerYear: 1170,
      zoom: 28,
    };

    const resolved = resolveTimelineOverlayTracks(
      POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual([
      "byzantine-empire",
      "abbasid-caliphate",
      "song-china",
      "mongol-empire",
    ]);
    expect(resolved.map((band) => band.laneIndex)).toEqual([0, 1, 2, 3]);
    expect(resolved.every((band) => band.laneCount === 5)).toBe(true);
  });
});