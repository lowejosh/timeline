import { describe, expect, it } from "vitest";
import { ANCIENT_CIVILIZATION_OVERLAYS } from "../../data/overlays/ancientCivilizations";
import { POST_CLASSICAL_EARLY_MODERN_OVERLAYS } from "../../data/overlays/postClassicalEarlyModern";
import type {
  TimelineMarker,
  TimelineOverlayBand,
} from "../../data/timelineTypes";
import {
  getVisibleTimelineMarkers,
  resolveTimelineOverlayTracks,
} from "../overlayTracks";

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

    expect(
      getVisibleTimelineMarkers(markers, viewport, width, pad).map(
        (marker) => marker.id,
      ),
    ).toEqual(["visible"]);
  });

  it("filters markers by enabled group ids before rendering", () => {
    const width = 1000;
    const pad = 100;
    const markers: TimelineMarker[] = [
      {
        id: "enabled-marker",
        label: "Enabled marker",
        year: -4_560_000_000,
        minZoom: 8,
        groupId: "enabled-group",
      },
      {
        id: "disabled-marker",
        label: "Disabled marker",
        year: -4_550_000_000,
        minZoom: 8,
        groupId: "disabled-group",
      },
    ];

    const viewport = {
      centerYear: -4_555_000_000,
      zoom: 9,
    };

    expect(
      getVisibleTimelineMarkers(
        markers,
        viewport,
        width,
        pad,
        new Set(["enabled-group"]),
      ).map((marker) => marker.id),
    ).toEqual(["enabled-marker"]);
  });

  it("keeps higher-priority markers visible below their nominal min zoom", () => {
    const width = 1000;
    const pad = 100;
    const markers: TimelineMarker[] = [
      {
        id: "high-priority",
        label: "High priority marker",
        year: -4_560_000_000,
        minZoom: 10,
        priority: 92,
      },
      {
        id: "low-priority",
        label: "Low priority marker",
        year: -4_550_000_000,
        minZoom: 10,
        priority: 72,
      },
    ];

    const viewport = {
      centerYear: -4_555_000_000,
      zoom: 7,
    };

    expect(
      getVisibleTimelineMarkers(markers, viewport, width, pad).map(
        (marker) => marker.id,
      ),
    ).toEqual(["high-priority"]);
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

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual(["a", "b", "c"]);
    expect(resolved.map((band) => band.laneIndex)).toEqual([0, 1, 0]);
    expect(resolved.every((band) => band.laneCount === 2)).toBe(true);
  });

  it("filters overlays by enabled group ids before lane assignment", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "enabled-overlay",
        label: "Enabled overlay",
        startYear: -3500,
        endYear: -2500,
        color: "rgba(0, 0, 0, 0.1)",
        groupId: "enabled-group",
      },
      {
        id: "disabled-overlay",
        label: "Disabled overlay",
        startYear: -3400,
        endYear: -1500,
        color: "rgba(0, 0, 0, 0.1)",
        groupId: "disabled-group",
      },
    ];

    const viewport = {
      centerYear: -2600,
      zoom: 21,
    };

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
      1,
      new Set(["enabled-group"]),
    );

    expect(resolved.map((band) => band.band.id)).toEqual(["enabled-overlay"]);
    expect(resolved[0].laneIndex).toBe(0);
    expect(resolved[0].laneCount).toBe(1);
  });

  it("keeps higher-priority overlays visible below their nominal min zoom", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "high-priority-overlay",
        label: "High priority overlay",
        startYear: -7_000_000,
        endYear: -6_000_000,
        minZoom: 8,
        priority: 95,
        color: "rgba(0, 0, 0, 0.1)",
      },
      {
        id: "low-priority-overlay",
        label: "Low priority overlay",
        startYear: -6_200_000,
        endYear: -5_800_000,
        minZoom: 8,
        priority: 72,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: -6_400_000,
      zoom: 7,
    };

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual([
      "high-priority-overlay",
    ]);
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

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
    );

    expect(resolved.map((band) => band.band.id)).toEqual(["c"]);
    expect(resolved[0].laneCount).toBe(2);
  });

  it("renders overlays at their exact clipped width once they cross the visibility threshold", () => {
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

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
    );

    expect(resolved).toHaveLength(1);
    expect(resolved[0].renderWidth).toBeGreaterThanOrEqual(0.5);
    expect(resolved[0].renderWidth).toBe(resolved[0].visibleWidth);
    expect(resolved[0].renderAlphaMultiplier).toBe(1);
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

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
    );

    expect(resolved).toHaveLength(0);
  });

  it("renders narrow overlays as single-device-pixel hairlines on Retina displays", () => {
    const width = 1000;
    const pad = 100;
    const overlays: TimelineOverlayBand[] = [
      {
        id: "hairline",
        label: "Hairline",
        startYear: -10_000_000,
        endYear: -4_000_000,
        color: "rgba(0, 0, 0, 0.1)",
      },
    ];

    const viewport = {
      centerYear: 0,
      zoom: 0,
    };

    const resolved = resolveTimelineOverlayTracks(
      overlays,
      viewport,
      width,
      pad,
      2,
    );

    expect(resolved).toHaveLength(1);
    expect(resolved[0].renderWidth).toBeCloseTo(0.5, 6);
    expect(resolved[0].isHairline).toBe(true);
    expect(resolved[0].renderAlphaMultiplier).toBeGreaterThan(0);
    expect(resolved[0].renderAlphaMultiplier).toBeLessThan(1);
  });

  it("switches overlay visibility on cleanly at the zoom threshold", () => {
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

    const hiddenViewport = {
      centerYear: -3000,
      zoom: 19.5,
    };
    const visibleViewport = {
      centerYear: -3000,
      zoom: 20.5,
    };

    const hiddenResolved = resolveTimelineOverlayTracks(
      overlays,
      hiddenViewport,
      width,
      pad,
    );
    const visibleResolved = resolveTimelineOverlayTracks(
      overlays,
      visibleViewport,
      width,
      pad,
    );

    expect(hiddenResolved).toHaveLength(0);
    expect(visibleResolved).toHaveLength(1);
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
      "hittite-empire",
      "mycenaean-greece",
      "ancient-greece",
      "achaemenid-persia",
      "roman-republic",
      "hellenistic-world",
      "han-china",
      "roman-empire",
    ]);
    expect(new Set(resolved.map((band) => band.laneIndex)).size).toBe(5);
    expect(resolved.every((band) => band.laneCount === 5)).toBe(true);
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

  it("keeps post-classical overlays visible below the old zoom-18 cutoff", () => {
    const width = 1000;
    const pad = 100;
    const viewport = {
      centerYear: 1100,
      zoom: 16,
    };

    const resolved = resolveTimelineOverlayTracks(
      POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
      viewport,
      width,
      pad,
      2,
    );

    expect(resolved.map((band) => band.band.id)).toEqual([
      "byzantine-empire",
      "abbasid-caliphate",
      "song-china",
      "ottoman-empire",
      "ming-dynasty",
    ]);
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
