import { expect, it } from "vitest";
import { getExperienceViewport, resolveExperienceContent } from "./experienceModel";
import { PHOENICIA_EXPERIENCE } from "./experiences";
import { STATIC_TIMELINE_CATALOG } from "@/lib/catalog/timelineCatalog";
import { getVisibleRange, worldToScreen } from "@/lib/core/viewport";
import { getOverlayLaneY, getTimelineLayout } from "@/lib/rendering/canvas/overlayLayout";
import { OVERLAY_LANE_HEIGHT, OVERLAY_LANE_GAP } from "@/lib/rendering/canvas/constants";

it("centers each chapter's exact year at phone, landscape, and desktop widths", () => {
  for (const width of [252, 460, 1120]) for (const stop of PHOENICIA_EXPERIENCE.stops) {
    const viewport = getExperienceViewport(stop, width);
    expect(worldToScreen(stop.year, viewport, width)).toBeCloseTo(width / 2, 7);
    const [start, end] = getVisibleRange(viewport, width);
    expect(end - start).toBeCloseTo(stop.range[1] - stop.range[0], 5);
  }
});

it("uses the original history catalog objects and retains future civilization geometry", () => {
  const content = resolveExperienceContent(PHOENICIA_EXPERIENCE, STATIC_TIMELINE_CATALOG);
  expect(content.era.id).toBe("human-history-root");
  expect(content.overlays.length).toBeGreaterThan(20);
  expect(content.markers.length).toBeGreaterThan(20);
  for (const id of [...PHOENICIA_EXPERIENCE.subjectIds, ...PHOENICIA_EXPERIENCE.contextIds, "safavid-iran"]) {
    const original = STATIC_TIMELINE_CATALOG.overlays.find(band => band.id === id);
    expect(original, id).toBeDefined();
    expect(content.overlays.find(band => band.id === id), id).toBe(original);
    expect(content.enabledGroupIds.has(original!.groupId!)).toBe(true);
  }
});

it("can center the first and last band even when the canvas is taller than the band stack", () => {
  for (const height of [190, 340, 700]) for (const lanes of [2, 12, 25]) {
    const base = getTimelineLayout(height, lanes, 0, { centerOverlays: true });
    for (const lane of [0, lanes - 1]) {
      const offset = (base.overlayClipTop - base.overlayClipBottom) / 2 + OVERLAY_LANE_HEIGHT / 2 + lane * (OVERLAY_LANE_HEIGHT + OVERLAY_LANE_GAP);
      const framed = getTimelineLayout(height, lanes, offset, { centerOverlays: true });
      expect(getOverlayLaneY(framed, lane) + OVERLAY_LANE_HEIGHT / 2).toBeCloseTo((base.overlayClipTop + base.overlayClipBottom) / 2);
    }
  }
});

it("keeps normal explorer scroll bounds unchanged", () => {
  const top = getTimelineLayout(400, 12, -1000);
  expect(top.overlayScrollOffset).toBe(0);
  const bottom = getTimelineLayout(400, 12, 1000);
  expect(bottom.overlayScrollOffset).toBe(bottom.overlayScrollMax);
});
