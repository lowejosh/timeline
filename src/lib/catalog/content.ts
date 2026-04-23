import { COSMIC_SET_CORE_MARKER_IDS } from "./sets/cosmic";
import { EARTH_SET_CORE_MARKER_IDS } from "./sets/earth";
import { PHYSICS_MILESTONES_GROUP_ID } from "./sets/physics";
import { TIMELINE_DECORATION_CATEGORY_IDS } from "./categories";
import {
  CHALCOLITHIC_MARKERS,
  CLASSICAL_ANTIQUITY_MARKERS,
  BRONZE_AGE_MARKERS,
  CORE_TIMELINE_MARKERS,
  DEEP_TIME_LIFE_MARKERS,
  EPIPALEOLITHIC_MARKERS,
  HUMAN_EVOLUTION_MARKERS,
  HISTORICAL_TURNING_POINT_MARKERS,
  NEOLITHIC_MARKERS,
  PALEOLITHIC_MARKERS,
  PHYSICS_HISTORY_MARKERS,
  POST_CLASSICAL_MARKERS,
} from "../domain/markers";
import {
  CIVILIZATION_OVERLAYS,
  CULTURE_OVERLAYS,
  DEEP_TIME_LIFE_OVERLAYS,
  HUMAN_EVOLUTION_OVERLAYS,
} from "../domain/overlays";
import type {
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
} from "../core/timelineTypes";
import {
  getEffectiveTimelinePriority,
  resolveDecorationSetId,
} from "./timelineSets";

type MarkerCollection = { groupId?: string; items: TimelineMarker[] };
type OverlayCollection = { groupId?: string; items: TimelineOverlayBand[] };

const CORE_GROUPED_MARKER_IDS = new Set<string>([
  ...COSMIC_SET_CORE_MARKER_IDS,
  ...EARTH_SET_CORE_MARKER_IDS,
]);

const within = (markers: TimelineMarker[], ids: ReadonlySet<string>) =>
  markers.filter((marker) => ids.has(marker.id));
const without = (markers: TimelineMarker[], ids: ReadonlySet<string>) =>
  markers.filter((marker) => !ids.has(marker.id));

const MARKER_COLLECTIONS: MarkerCollection[] = [
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.cosmicMilestones,
    items: within(CORE_TIMELINE_MARKERS, COSMIC_SET_CORE_MARKER_IDS),
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.earthMilestones,
    items: within(CORE_TIMELINE_MARKERS, EARTH_SET_CORE_MARKER_IDS),
  },
  { items: without(CORE_TIMELINE_MARKERS, CORE_GROUPED_MARKER_IDS) },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.deepTimeLife,
    items: DEEP_TIME_LIFE_MARKERS,
  },
  {
    groupId: PHYSICS_MILESTONES_GROUP_ID,
    items: PHYSICS_HISTORY_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution,
    items: HUMAN_EVOLUTION_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: PALEOLITHIC_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: EPIPALEOLITHIC_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: NEOLITHIC_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: CHALCOLITHIC_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: BRONZE_AGE_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: HISTORICAL_TURNING_POINT_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: CLASSICAL_ANTIQUITY_MARKERS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    items: POST_CLASSICAL_MARKERS,
  },
];

const OVERLAY_COLLECTIONS: OverlayCollection[] = [
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.deepTimeLife,
    items: DEEP_TIME_LIFE_OVERLAYS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution,
    items: HUMAN_EVOLUTION_OVERLAYS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.cultures,
    items: CULTURE_OVERLAYS,
  },
  {
    groupId: TIMELINE_DECORATION_CATEGORY_IDS.civilizations,
    items: CIVILIZATION_OVERLAYS,
  },
];

function byMarkerOrder(left: TimelineMarker, right: TimelineMarker) {
  return (
    left.year - right.year ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

function byOverlayOrder(left: TimelineOverlayBand, right: TimelineOverlayBand) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.id.localeCompare(right.id)
  );
}

function tagMarker(marker: TimelineMarker, groupId?: string): TimelineMarker {
  const withGroup: TimelineMarker = { ...marker, groupId };
  const setId = resolveDecorationSetId(withGroup);
  return setId ? { ...withGroup, setId } : withGroup;
}

function tagOverlay(
  overlay: TimelineOverlayBand,
  groupId?: string,
): TimelineOverlayBand {
  const tagged: TimelineOverlayBand = {
    ...overlay,
    groupId,
    children: overlay.children?.map((child) => tagOverlay(child, groupId)),
  };
  const setId = resolveDecorationSetId(tagged);
  return setId ? { ...tagged, setId } : tagged;
}

export const TIMELINE_MARKERS: TimelineMarker[] = MARKER_COLLECTIONS.flatMap(
  ({ groupId, items }) => items.map((marker) => tagMarker(marker, groupId)),
).sort(byMarkerOrder);

export const TIMELINE_OVERLAYS: TimelineOverlayBand[] =
  OVERLAY_COLLECTIONS.flatMap(({ groupId, items }) =>
    items.map((overlay) => tagOverlay(overlay, groupId)),
  ).sort(byOverlayOrder);

export const TIMELINE_DISPLAY: TimelineDisplayConfig = {
  markers: TIMELINE_MARKERS,
  overlays: TIMELINE_OVERLAYS,
};
