import {
  CHALCOLITHIC_MARKERS,
  CLASSICAL_ANTIQUITY_MARKERS,
  BRONZE_AGE_MARKERS,
  CORE_TIMELINE_MARKERS,
  DEEP_TIME_LIFE_MARKERS,
  EPIPALEOLITHIC_MARKERS,
  HISTORICAL_TURNING_POINT_MARKERS,
  NEOLITHIC_MARKERS,
  PALEOLITHIC_MARKERS,
  POST_CLASSICAL_MARKERS,
} from "./markers";
import {
  ANCIENT_CIVILIZATION_OVERLAYS,
  DEEP_TIME_LIFE_OVERLAYS,
  POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
} from "./overlays";
import type {
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
} from "./timelineTypes";

const PLANET_AND_LIFE_CATEGORY_ID = "planet-and-life";
const HUMAN_HISTORY_CATEGORY_ID = "human-history";
const CIVILIZATIONS_CATEGORY_ID = "civilizations";

export const TIMELINE_DECORATION_CATEGORY_IDS = {
  planetAndLife: PLANET_AND_LIFE_CATEGORY_ID,
  humanHistory: HUMAN_HISTORY_CATEGORY_ID,
  civilizations: CIVILIZATIONS_CATEGORY_ID,
} as const;

const PLANETARY_FOUNDATIONS_GROUP_ID = "planetary-foundations";
const DEEP_TIME_LIFE_GROUP_ID = "deep-time-life";
const PALEOLITHIC_GROUP_ID = "paleolithic";
const EPIPALEOLITHIC_GROUP_ID = "epipaleolithic";
const NEOLITHIC_GROUP_ID = "neolithic";
const CHALCOLITHIC_GROUP_ID = "chalcolithic";
const BRONZE_AGE_GROUP_ID = "bronze-age";
const CLASSICAL_ANTIQUITY_GROUP_ID = "classical-antiquity";
const POST_CLASSICAL_HISTORY_GROUP_ID = "post-classical-history";
const HISTORICAL_TURNING_POINTS_GROUP_ID = "historical-turning-points";
const ANCIENT_CIVILIZATIONS_GROUP_ID = "ancient-civilizations";
const POST_CLASSICAL_EARLY_MODERN_GROUP_ID = "post-classical-early-modern";

export const TIMELINE_DECORATION_CATEGORIES: TimelineDecorationCategory[] = [
  {
    id: PLANET_AND_LIFE_CATEGORY_ID,
    label: "Planet & Life",
    description: "Foundational deep-time layers, thresholds, and life signals.",
    order: 0,
  },
  {
    id: HUMAN_HISTORY_CATEGORY_ID,
    label: "Human History",
    description: "Archaeological and historical marker sets across human time.",
    order: 1,
  },
  {
    id: CIVILIZATIONS_CATEGORY_ID,
    label: "Civilizations",
    description: "Long-running civilization overlays and state-scale bands.",
    order: 2,
  },
];

export const TIMELINE_DECORATION_GROUPS: TimelineDecorationGroup[] = [
  {
    id: PLANETARY_FOUNDATIONS_GROUP_ID,
    categoryId: PLANET_AND_LIFE_CATEGORY_ID,
    label: "Planetary Foundations",
    description: "Solar System, Earth, and earliest planetary thresholds.",
    contentType: "markers",
    order: 0,
  },
  {
    id: DEEP_TIME_LIFE_GROUP_ID,
    categoryId: PLANET_AND_LIFE_CATEGORY_ID,
    label: "Deep Time Life",
    description: "Life milestones, extinction shocks, and broad biosphere overlays.",
    contentType: "mixed",
    order: 1,
  },
  {
    id: PALEOLITHIC_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Paleolithic",
    description: "Early Homo sapiens, symbolic expression, and Upper Paleolithic culture.",
    contentType: "markers",
    order: 0,
  },
  {
    id: EPIPALEOLITHIC_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Epipaleolithic",
    description: "Settled foragers and late hunter-gatherer transitions.",
    contentType: "markers",
    order: 1,
  },
  {
    id: NEOLITHIC_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Neolithic",
    description: "Farming villages, monuments, and early settled life.",
    contentType: "markers",
    order: 2,
  },
  {
    id: CHALCOLITHIC_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Chalcolithic",
    description: "Copper Age experiments, irrigation, and urban thresholds.",
    contentType: "markers",
    order: 3,
  },
  {
    id: BRONZE_AGE_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Bronze Age",
    description: "States, writing, and Bronze Age upheavals.",
    contentType: "markers",
    order: 4,
  },
  {
    id: CLASSICAL_ANTIQUITY_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Classical Antiquity",
    description: "Mediterranean turning points from Alexander to Rome.",
    contentType: "markers",
    order: 5,
  },
  {
    id: POST_CLASSICAL_HISTORY_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Post-classical Milestones",
    description: "Major markers from late antiquity into the modern world.",
    contentType: "markers",
    order: 6,
  },
  {
    id: HISTORICAL_TURNING_POINTS_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Turning Points",
    description: "Cross-civilizational threshold events and global shocks.",
    contentType: "markers",
    order: 7,
  },
  {
    id: ANCIENT_CIVILIZATIONS_GROUP_ID,
    categoryId: CIVILIZATIONS_CATEGORY_ID,
    label: "Ancient Civilizations",
    description: "Ancient Nile, Near Eastern, Mediterranean, and Asian overlays.",
    contentType: "overlays",
    order: 0,
  },
  {
    id: POST_CLASSICAL_EARLY_MODERN_GROUP_ID,
    categoryId: CIVILIZATIONS_CATEGORY_ID,
    label: "Post-classical & Early Modern",
    description: "Imperial and dynastic overlays after late antiquity.",
    contentType: "overlays",
    order: 1,
  },
];

type TimelineMarkerCollection = {
  groupId: string;
  items: TimelineMarker[];
};

type TimelineOverlayCollection = {
  groupId: string;
  items: TimelineOverlayBand[];
};

const TIMELINE_MARKER_COLLECTIONS: TimelineMarkerCollection[] = [
  { groupId: PLANETARY_FOUNDATIONS_GROUP_ID, items: CORE_TIMELINE_MARKERS },
  { groupId: DEEP_TIME_LIFE_GROUP_ID, items: DEEP_TIME_LIFE_MARKERS },
  { groupId: PALEOLITHIC_GROUP_ID, items: PALEOLITHIC_MARKERS },
  { groupId: EPIPALEOLITHIC_GROUP_ID, items: EPIPALEOLITHIC_MARKERS },
  { groupId: NEOLITHIC_GROUP_ID, items: NEOLITHIC_MARKERS },
  { groupId: CHALCOLITHIC_GROUP_ID, items: CHALCOLITHIC_MARKERS },
  { groupId: BRONZE_AGE_GROUP_ID, items: BRONZE_AGE_MARKERS },
  {
    groupId: HISTORICAL_TURNING_POINTS_GROUP_ID,
    items: HISTORICAL_TURNING_POINT_MARKERS,
  },
  {
    groupId: CLASSICAL_ANTIQUITY_GROUP_ID,
    items: CLASSICAL_ANTIQUITY_MARKERS,
  },
  {
    groupId: POST_CLASSICAL_HISTORY_GROUP_ID,
    items: POST_CLASSICAL_MARKERS,
  },
];

const TIMELINE_OVERLAY_COLLECTIONS: TimelineOverlayCollection[] = [
  { groupId: DEEP_TIME_LIFE_GROUP_ID, items: DEEP_TIME_LIFE_OVERLAYS },
  {
    groupId: ANCIENT_CIVILIZATIONS_GROUP_ID,
    items: ANCIENT_CIVILIZATION_OVERLAYS,
  },
  {
    groupId: POST_CLASSICAL_EARLY_MODERN_GROUP_ID,
    items: POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
  },
];

function sortMarkers(left: TimelineMarker, right: TimelineMarker) {
  return (
    left.year - right.year ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

function sortOverlays(left: TimelineOverlayBand, right: TimelineOverlayBand) {
  return (
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id)
  );
}

function assignMarkerGroupId(markers: TimelineMarker[], groupId: string) {
  return markers.map((marker) => ({
    ...marker,
    groupId,
  }));
}

function assignOverlayGroupId(
  overlays: TimelineOverlayBand[],
  groupId: string,
): TimelineOverlayBand[] {
  return overlays.map((overlay) => ({
    ...overlay,
    groupId: overlay.groupId ?? groupId,
    children: overlay.children
      ? assignOverlayGroupId(overlay.children, overlay.groupId ?? groupId)
      : undefined,
  }));
}

export const TIMELINE_MARKERS = TIMELINE_MARKER_COLLECTIONS.flatMap(
  ({ groupId, items }) => assignMarkerGroupId(items, groupId),
).sort(sortMarkers);

export const TIMELINE_OVERLAYS = TIMELINE_OVERLAY_COLLECTIONS.flatMap(
  ({ groupId, items }) => assignOverlayGroupId(items, groupId),
).sort(sortOverlays);

export const TIMELINE_DECORATION_GROUPS_BY_ID = Object.fromEntries(
  TIMELINE_DECORATION_GROUPS.map((group) => [group.id, group]),
) satisfies Record<string, TimelineDecorationGroup>;

export const TIMELINE_DISPLAY: TimelineDisplayConfig = {
  markers: TIMELINE_MARKERS,
  overlays: TIMELINE_OVERLAYS,
};

export function getDefaultEnabledTimelineGroupIds() {
  return new Set(
    TIMELINE_DECORATION_GROUPS.filter(
      (group) => group.defaultEnabled !== false,
    ).map((group) => group.id),
  );
}
