import { describe, expect, it } from "vitest";
import {
  ROOT_ERA,
  TIMELINE_DISPLAY,
  findEraById,
  getRootDisplayErasBySets,
} from "../eras";
import {
  applyTimelineSetOrderToEraTree,
  applyTimelineSetOrderToMarkers,
  applyTimelineSetOrderToOverlays,
  getEffectiveTimelinePriority,
  TIMELINE_SETS,
  TIMELINE_SETS_BY_ID,
  filterMarkersBySets,
  filterOverlaysBySets,
  getDefaultEnabledTimelineSetIds,
  getDefaultTimelineSetOrder,
  getSetIdForEraFamily,
  isDecorationSetEnabled,
  normalizeTimelineSetOrder,
  resolveDecorationSetId,
} from "../timelineSets";
import type { TimelineSetId } from "../timelineTypes";

const ALL_SET_IDS: TimelineSetId[] = ["cosmic", "earth", "human"];

describe("timeline set registry", () => {
  it("exposes one entry per set, each owning at least one family or decoration bucket", () => {
    expect(TIMELINE_SETS.map((set) => set.id)).toEqual(ALL_SET_IDS);

    for (const set of TIMELINE_SETS) {
      const hasFamily = set.familyIds.length > 0;
      const hasGroup = set.groupIds.length > 0;
      const hasCore = set.coreMarkerIds.size > 0;
      expect(hasFamily || hasGroup || hasCore).toBe(true);
    }
  });

  it("defaults all three sets to enabled", () => {
    const defaults = getDefaultEnabledTimelineSetIds();
    expect([...defaults].sort()).toEqual(ALL_SET_IDS.slice().sort());
  });

  it("returns the default set order and normalizes custom persisted orders", () => {
    expect(getDefaultTimelineSetOrder()).toEqual(["cosmic", "earth", "human"]);
    expect(
      normalizeTimelineSetOrder(["human", "earth", "human", "bogus"]),
    ).toEqual(["human", "earth", "cosmic"]);
  });

  it("maps each era family to the correct owning set", () => {
    expect(getSetIdForEraFamily("cosmic")).toBe("cosmic");
    expect(getSetIdForEraFamily("geological")).toBe("earth");
    expect(getSetIdForEraFamily("human-history")).toBe("human");
  });

  it("resolves decoration set IDs by groupId and by core marker id", () => {
    expect(
      resolveDecorationSetId({ id: "ignored", groupId: "cosmic-milestones" }),
    ).toBe("cosmic");
    expect(
      resolveDecorationSetId({ id: "ignored", groupId: "earth-milestones" }),
    ).toBe("earth");
    expect(
      resolveDecorationSetId({ id: "ignored", groupId: "deep-time-life" }),
    ).toBe("earth");
    expect(
      resolveDecorationSetId({ id: "ignored", groupId: "civilizations" }),
    ).toBe("human");
    expect(
      resolveDecorationSetId({ id: "solar-system-formation", groupId: undefined }),
    ).toBe("cosmic");
    expect(
      resolveDecorationSetId({ id: "earth-formation", groupId: undefined }),
    ).toBe("earth");
    expect(
      resolveDecorationSetId({ id: "unknown-marker-id", groupId: undefined }),
    ).toBeNull();
  });

  it("treats items without a resolvable set as always enabled", () => {
    expect(isDecorationSetEnabled(null, new Set<TimelineSetId>())).toBe(true);
    expect(
      isDecorationSetEnabled("earth", new Set<TimelineSetId>(["cosmic"])),
    ).toBe(false);
    expect(
      isDecorationSetEnabled("earth", new Set<TimelineSetId>(["earth"])),
    ).toBe(true);
  });
});

describe("era family filtering by set", () => {
  it("returns the full top-level chronology when all sets are enabled", () => {
    const all = getRootDisplayErasBySets(
      ROOT_ERA,
      new Set<TimelineSetId>(ALL_SET_IDS),
    );
    const allByFamily = new Set(all.map((era) => era.familyId));
    expect(allByFamily.has("cosmic")).toBe(true);
    expect(allByFamily.has("geological")).toBe(true);
    expect(allByFamily.has("human-history")).toBe(true);
  });

  it("removes geological family roots when earth set is disabled", () => {
    const withoutEarth = getRootDisplayErasBySets(
      ROOT_ERA,
      new Set<TimelineSetId>(["cosmic", "human"]),
    );
    expect(withoutEarth.every((era) => era.familyId !== "geological")).toBe(
      true,
    );
    expect(withoutEarth.some((era) => era.familyId === "cosmic")).toBe(true);
    expect(withoutEarth.some((era) => era.familyId === "human-history")).toBe(
      true,
    );
  });

  it("removes all family eras when no sets are enabled", () => {
    const none = getRootDisplayErasBySets(
      ROOT_ERA,
      new Set<TimelineSetId>(),
    );
    expect(none.every((era) => era.familyId === undefined)).toBe(true);
  });
});

describe("marker and overlay filtering by set", () => {
  it("assembled markers/overlays are tagged with a resolvable setId where owned", () => {
    const markers = TIMELINE_DISPLAY.markers;
    const overlays = TIMELINE_DISPLAY.overlays;

    const taggedMarkers = markers.filter((marker) => marker.setId);
    expect(taggedMarkers.length).toBeGreaterThan(0);
    for (const marker of taggedMarkers) {
      expect(ALL_SET_IDS).toContain(marker.setId);
    }

    const taggedOverlays = overlays.filter((overlay) => overlay.setId);
    expect(taggedOverlays.length).toBeGreaterThan(0);
    for (const overlay of taggedOverlays) {
      expect(ALL_SET_IDS).toContain(overlay.setId);
    }
  });

  it("disabling the human set removes all human-owned markers/overlays", () => {
    const withoutHuman = new Set<TimelineSetId>(["cosmic", "earth"]);
    const filteredMarkers = filterMarkersBySets(
      TIMELINE_DISPLAY.markers,
      withoutHuman,
    );
    const filteredOverlays = filterOverlaysBySets(
      TIMELINE_DISPLAY.overlays,
      withoutHuman,
    );
    expect(filteredMarkers.every((marker) => marker.setId !== "human")).toBe(
      true,
    );
    expect(filteredOverlays.every((overlay) => overlay.setId !== "human")).toBe(
      true,
    );

    // Regression guard: human-owned group ids should be fully absent.
    const humanGroupIds = new Set(TIMELINE_SETS_BY_ID.human.groupIds);
    expect(
      filteredMarkers.every(
        (marker) => !marker.groupId || !humanGroupIds.has(marker.groupId),
      ),
    ).toBe(true);
    expect(
      filteredOverlays.every(
        (overlay) => !overlay.groupId || !humanGroupIds.has(overlay.groupId),
      ),
    ).toBe(true);
  });

  it("enabling only the cosmic set keeps pre-earth core markers and drops earth/human markers", () => {
    const cosmicOnly = new Set<TimelineSetId>(["cosmic"]);
    const filteredMarkers = filterMarkersBySets(
      TIMELINE_DISPLAY.markers,
      cosmicOnly,
    );
    const filteredIds = new Set(filteredMarkers.map((marker) => marker.id));
    expect(filteredIds.has("solar-system-formation")).toBe(true);
    expect(filteredIds.has("earth-formation")).toBe(false);
    expect(
      filteredMarkers.every(
        (marker) =>
          !marker.setId || marker.setId === "cosmic",
      ),
    ).toBe(true);
  });

  it("default-enabled sets preserve the full visible marker/overlay arrays", () => {
    const defaults = getDefaultEnabledTimelineSetIds();
    expect(
      filterMarkersBySets(TIMELINE_DISPLAY.markers, defaults).length,
    ).toBe(TIMELINE_DISPLAY.markers.length);
    expect(
      filterOverlaysBySets(TIMELINE_DISPLAY.overlays, defaults).length,
    ).toBe(TIMELINE_DISPLAY.overlays.length);
  });

  it("applies reordered set precedence to effective marker and overlay priority", () => {
    const prioritizedMarkers = applyTimelineSetOrderToMarkers(
      [
        {
          id: "earth-marker",
          label: "Earth marker",
          year: 0,
          setId: "earth",
          priority: 10,
        },
        {
          id: "human-marker",
          label: "Human marker",
          year: 0,
          setId: "human",
          priority: 999,
        },
      ],
      ["earth", "human", "cosmic"],
    );
    const earthMarker = prioritizedMarkers.find((marker) => marker.id === "earth-marker");
    const humanMarker = prioritizedMarkers.find((marker) => marker.id === "human-marker");

    expect(getEffectiveTimelinePriority(earthMarker!)).toBeGreaterThan(
      getEffectiveTimelinePriority(humanMarker!),
    );

    const prioritizedOverlays = applyTimelineSetOrderToOverlays(
      [
        {
          id: "cosmic-overlay",
          label: "Cosmic overlay",
          startYear: -10,
          endYear: 10,
          color: "rgb(0,0,0)",
          setId: "cosmic",
          priority: 500,
        },
        {
          id: "human-overlay",
          label: "Human overlay",
          startYear: -10,
          endYear: 10,
          color: "rgb(0,0,0)",
          setId: "human",
          priority: 20,
        },
      ],
      ["human", "earth", "cosmic"],
    );
    const cosmicOverlay = prioritizedOverlays.find(
      (overlay) => overlay.id === "cosmic-overlay",
    );
    const humanOverlay = prioritizedOverlays.find(
      (overlay) => overlay.id === "human-overlay",
    );

    expect(getEffectiveTimelinePriority(humanOverlay!)).toBeGreaterThan(
      getEffectiveTimelinePriority(cosmicOverlay!),
    );
  });

  it("applies reordered set precedence to era effective priority without mutating base priorities", () => {
    const prioritizedRoot = applyTimelineSetOrderToEraTree(ROOT_ERA, [
      "earth",
      "human",
      "cosmic",
    ]);
    const quaternary = findEraById(prioritizedRoot, "quaternary");
    const paleolithic = findEraById(prioritizedRoot, "paleolithic");

    expect(quaternary?.priority).toBe(findEraById(ROOT_ERA, "quaternary")?.priority);
    expect(getEffectiveTimelinePriority(quaternary!)).toBeGreaterThan(
      getEffectiveTimelinePriority(paleolithic!),
    );
  });
});
