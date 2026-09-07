import { getAssignedOverlayLanes } from "@/lib/rendering/layout/laneAssignment";
import { expect, it } from "vitest";
import { CIVILIZATION_OVERLAYS } from "./data/overlays/civilizations";
import { BRONZE_AGE_MARKERS } from "./data/markers/bronzeAge";
import { HUMAN_HISTORY_ERA_DEFINITIONS } from "./data/eras";
import { HUMAN_SOURCES } from "./data/sources";
import type { TimelineOverlayBand } from "@/lib/core/timelineTypes";

it("keeps civilization children within their parents and their citations resolvable", () => {
  const ids = new Set<string>();
  const visit = (bands: TimelineOverlayBand[], parent?: TimelineOverlayBand) => {
    for (const band of bands) {
      expect(ids.has(band.id), band.id).toBe(false);
      ids.add(band.id);
      expect(band.startYear, band.id).toBeLessThan(band.endYear);
      if (parent) {
        expect(band.startYear, band.id).toBeGreaterThanOrEqual(parent.startYear);
        expect(band.endYear, band.id).toBeLessThanOrEqual(parent.endYear);
      }
      for (const id of band.sourceIds ?? []) expect(HUMAN_SOURCES, id).toHaveProperty(id);
      visit(band.children ?? [], band);
    }
  };
  visit(CIVILIZATION_OVERLAYS);
  for (const marker of BRONZE_AGE_MARKERS) {
    expect(ids.has(marker.id), marker.id).toBe(false);
    ids.add(marker.id);
    expect(marker.regionalScopeLabel, marker.id).toBeTruthy();
    expect(marker.sourceIds?.length, marker.id).toBeGreaterThan(0);
    for (const id of marker.sourceIds ?? []) expect(HUMAN_SOURCES, id).toHaveProperty(id);
  }
});

it("keeps later Mesopotamian states in their regional sequences and Digital Age undivided", () => {
  const assyria = CIVILIZATION_OVERLAYS.find(band => band.id === "assyria");
  const babylonia = CIVILIZATION_OVERLAYS.find(band => band.id === "babylonia");
  expect(assyria?.children?.some(band => band.id === "neo-assyrian-empire")).toBe(true);
  expect(babylonia?.children?.some(band => band.id === "neo-babylonian-empire")).toBe(true);
  for (const id of ["mesopotamia", "canaan", "elam", "kingdom-of-aksum"]) {
    expect(CIVILIZATION_OVERLAYS.some(band => band.id === id)).toBe(false);
  }
  const digital = HUMAN_HISTORY_ERA_DEFINITIONS.find(era => era.id === "contemporary-history")?.children?.find(era => era.id === "digital-age");
  expect(digital).toBeDefined();
  expect(digital?.children?.length ?? 0).toBe(0);
});

it("keeps Iranian, South Asian, and Mesoamerican sequences cohesive without empty reserved rows", () => {
  const { assigned, laneCount } = getAssignedOverlayLanes(CIVILIZATION_OVERLAYS);
  const lane = (id: string) => assigned.find(entry => entry.band.id === id)!.laneIndex;
  expect(lane("safavid-iran")).toBe(lane("achaemenid-persia"));
  expect(lane("sasanian-empire")).toBe(lane("achaemenid-persia"));
  expect(lane("mughal-empire")).toBe(lane("maurya-empire"));
  expect(Math.abs(lane("aztec-empire") - lane("maya-civilization"))).toBeLessThanOrEqual(1);
  for (const a of assigned) for (const b of assigned) {
    if (a === b || a.laneIndex !== b.laneIndex) continue;
    expect(a.band.endYear <= b.band.startYear || b.band.endYear <= a.band.startYear, `${a.band.id} / ${b.band.id}`).toBe(true);
  }
  const peak = Math.max(...CIVILIZATION_OVERLAYS.map(a => CIVILIZATION_OVERLAYS.filter(b => b.startYear <= a.startYear && b.endYear > a.startYear).length));
  expect(laneCount).toBeLessThanOrEqual(peak + 1);
});
