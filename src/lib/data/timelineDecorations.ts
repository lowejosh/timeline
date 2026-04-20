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
  POST_CLASSICAL_MARKERS,
} from "./markers";
import {
  CIVILIZATION_OVERLAYS,
  CULTURE_OVERLAYS,
  DEEP_TIME_LIFE_OVERLAYS,
  HUMAN_EVOLUTION_OVERLAYS,
} from "./overlays";
import type {
  TimelineDecorationCategory,
  TimelineDecorationGroup,
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
} from "./timelineTypes";
import { resolveDecorationSetId } from "./timelineSets";

const HUMAN_HISTORY_CATEGORY_ID = "human-history";
const DEEP_TIME_LIFE_CATEGORY_ID = "deep-time-life";
const HUMAN_EVOLUTION_CATEGORY_ID = "human-evolution";
const CULTURES_CATEGORY_ID = "cultures";
const CIVILIZATIONS_CATEGORY_ID = "civilizations";

export const TIMELINE_DECORATION_CATEGORY_IDS = {
  deepTimeLife: DEEP_TIME_LIFE_CATEGORY_ID,
  humanHistory: HUMAN_HISTORY_CATEGORY_ID,
  humanEvolution: HUMAN_EVOLUTION_CATEGORY_ID,
  cultures: CULTURES_CATEGORY_ID,
  civilizations: CIVILIZATIONS_CATEGORY_ID,
} as const;

const HUMAN_HISTORY_GROUP_ID = HUMAN_HISTORY_CATEGORY_ID;
const DEEP_TIME_LIFE_GROUP_ID = DEEP_TIME_LIFE_CATEGORY_ID;
const HUMAN_EVOLUTION_GROUP_ID = HUMAN_EVOLUTION_CATEGORY_ID;
const CULTURES_GROUP_ID = CULTURES_CATEGORY_ID;
const CIVILIZATIONS_GROUP_ID = CIVILIZATIONS_CATEGORY_ID;

export const TIMELINE_DECORATION_CATEGORIES: TimelineDecorationCategory[] = [
  {
    id: DEEP_TIME_LIFE_CATEGORY_ID,
    label: "Deep Time Life",
    description: "Toggleable deep-time life overlays and milestone markers.",
    order: 0,
  },
  {
    id: HUMAN_HISTORY_CATEGORY_ID,
    label: "Human History",
    description: "All toggleable human-history marker collections.",
    order: 1,
  },
  {
    id: HUMAN_EVOLUTION_CATEGORY_ID,
    label: "Human Evolution",
    description: "Toggleable hominin overlays and milestone markers.",
    order: 2,
  },
  {
    id: CULTURES_CATEGORY_ID,
    label: "Pre-Civilization Cultures",
    description:
      "Toggleable archaeological cultures and village worlds before early states and cities.",
    order: 3,
  },
  {
    id: CIVILIZATIONS_CATEGORY_ID,
    label: "Civilizations",
    description: "All toggleable civilization overlay bands.",
    order: 4,
  },
];

export const TIMELINE_DECORATION_GROUPS: TimelineDecorationGroup[] = [
  {
    id: DEEP_TIME_LIFE_GROUP_ID,
    categoryId: DEEP_TIME_LIFE_CATEGORY_ID,
    label: "Deep Time Life",
    description:
      "Major life-history overlays and milestone markers across deep time.",
    contentType: "mixed",
    order: 0,
  },
  {
    id: HUMAN_HISTORY_GROUP_ID,
    categoryId: HUMAN_HISTORY_CATEGORY_ID,
    label: "Human History",
    description: "Archaeological and historical markers across human time.",
    contentType: "markers",
    order: 0,
  },
  {
    id: HUMAN_EVOLUTION_GROUP_ID,
    categoryId: HUMAN_EVOLUTION_CATEGORY_ID,
    label: "Human Evolution",
    description: "Branching hominin overlays and major evolutionary markers.",
    contentType: "mixed",
    order: 0,
  },
  {
    id: CULTURES_GROUP_ID,
    categoryId: CULTURES_CATEGORY_ID,
    label: "Pre-Civilization Cultures",
    description:
      "Archaeological cultures and village worlds before or alongside the rise of early states and cities.",
    contentType: "overlays",
    order: 0,
  },
  {
    id: CIVILIZATIONS_GROUP_ID,
    categoryId: CIVILIZATIONS_CATEGORY_ID,
    label: "Civilizations",
    description: "Ancient through early-modern civilization overlays.",
    contentType: "overlays",
    order: 0,
  },
];

type TimelineMarkerCollection = {
  groupId?: string;
  items: TimelineMarker[];
};

type TimelineOverlayCollection = {
  groupId?: string;
  items: TimelineOverlayBand[];
};

const TIMELINE_MARKER_COLLECTIONS: TimelineMarkerCollection[] = [
  { items: CORE_TIMELINE_MARKERS },
  { groupId: DEEP_TIME_LIFE_GROUP_ID, items: DEEP_TIME_LIFE_MARKERS },
  { groupId: HUMAN_EVOLUTION_GROUP_ID, items: HUMAN_EVOLUTION_MARKERS },
  { groupId: HUMAN_HISTORY_GROUP_ID, items: PALEOLITHIC_MARKERS },
  { groupId: HUMAN_HISTORY_GROUP_ID, items: EPIPALEOLITHIC_MARKERS },
  { groupId: HUMAN_HISTORY_GROUP_ID, items: NEOLITHIC_MARKERS },
  { groupId: HUMAN_HISTORY_GROUP_ID, items: CHALCOLITHIC_MARKERS },
  { groupId: HUMAN_HISTORY_GROUP_ID, items: BRONZE_AGE_MARKERS },
  {
    groupId: HUMAN_HISTORY_GROUP_ID,
    items: HISTORICAL_TURNING_POINT_MARKERS,
  },
  {
    groupId: HUMAN_HISTORY_GROUP_ID,
    items: CLASSICAL_ANTIQUITY_MARKERS,
  },
  {
    groupId: HUMAN_HISTORY_GROUP_ID,
    items: POST_CLASSICAL_MARKERS,
  },
];

const TIMELINE_OVERLAY_COLLECTIONS: TimelineOverlayCollection[] = [
  { groupId: DEEP_TIME_LIFE_GROUP_ID, items: DEEP_TIME_LIFE_OVERLAYS },
  { groupId: HUMAN_EVOLUTION_GROUP_ID, items: HUMAN_EVOLUTION_OVERLAYS },
  { groupId: CULTURES_GROUP_ID, items: CULTURE_OVERLAYS },
  {
    groupId: CIVILIZATIONS_GROUP_ID,
    items: CIVILIZATION_OVERLAYS,
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

function assignMarkerGroupId(markers: TimelineMarker[], groupId?: string) {
  return markers.map((marker) => {
    const withGroup: TimelineMarker = { ...marker, groupId };
    const setId = resolveDecorationSetId(withGroup);
    return setId ? { ...withGroup, setId } : withGroup;
  });
}

function assignOverlayGroupId(
  overlays: TimelineOverlayBand[],
  groupId?: string,
): TimelineOverlayBand[] {
  return overlays.map((overlay) => {
    const withGroup: TimelineOverlayBand = {
      ...overlay,
      groupId,
      children: overlay.children
        ? assignOverlayGroupId(overlay.children, groupId)
        : undefined,
    };
    const setId = resolveDecorationSetId(withGroup);
    return setId ? { ...withGroup, setId } : withGroup;
  });
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
