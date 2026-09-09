import { expect, it } from "vitest";
import { arrangeGuidedTracks } from "./guidedTracks";
import { resolveTimelineOverlayTracks } from "./overlayTracks";
import { STATIC_TIMELINE_CATALOG } from "@/lib/catalog/timelineCatalog";
import { getViewportForRange } from "@/lib/core/viewport";

it("keeps both subjects adjacent without dropping bands or changing their geometry", () => {
  const tracks = resolveTimelineOverlayTracks([...STATIC_TIMELINE_CATALOG.overlays], getViewportForRange(-1100, -300, 1000), 1040, 20);
  const result = arrangeGuidedTracks(tracks, ["phoenicia", "carthage"]);
  expect(result).toHaveLength(tracks.length);
  expect(result.find(track => track.band.id === "phoenicia")?.laneIndex).toBe(0);
  expect(result.find(track => track.band.id === "carthage")?.laneIndex).toBe(1);
  result.forEach((track, i) => {
    expect(track.band).toBe(tracks[i].band);
    expect(track.x0).toBe(tracks[i].x0);
    expect(track.x1).toBe(tracks[i].x1);
    if (!["phoenicia", "carthage"].includes(track.band.id)) expect(track.laneIndex).toBeGreaterThanOrEqual(2);
  });
  expect(arrangeGuidedTracks(tracks)).toBe(tracks);
});
