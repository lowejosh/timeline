import { TIMELINE_MAX_YEAR } from "../../core/timelineYears";
import { HUMAN_HISTORY_ERA_DEFINITIONS } from "../../domain/eraTrees/humanHistory";
import { ERA_SOURCES } from "../../domain/eraSources";
import {
  BRONZE_AGE_MARKERS,
  CHALCOLITHIC_MARKERS,
  CLASSICAL_ANTIQUITY_MARKERS,
  EPIPALEOLITHIC_MARKERS,
  HISTORICAL_TURNING_POINT_MARKERS,
  HUMAN_EVOLUTION_MARKERS,
  NEOLITHIC_MARKERS,
  PALEOLITHIC_MARKERS,
  POST_CLASSICAL_MARKERS,
} from "../../domain/markers";
import {
  CIVILIZATION_OVERLAYS,
  CULTURE_OVERLAYS,
  HUMAN_EVOLUTION_OVERLAYS,
} from "../../domain/overlays";
import { normalizeTimelineSetDocument } from "../setSchema";
import {
  buildTimelineSetDocument,
  toRawEraNode,
  toRawMarker,
  toRawOverlay,
} from "./shared";

export const HUMAN_SET_ID = "human";
export const HUMAN_EVOLUTION_GROUP_ID = "human-evolution";
export const HUMAN_HISTORY_GROUP_ID = "human-history";
export const CULTURES_GROUP_ID = "cultures";
export const CIVILIZATIONS_GROUP_ID = "civilizations";
const HUMAN_FAMILY_ID = "human-history";

const humanFamilyRoot = {
  id: "human-history-root",
  name: "Human History",
  startYear: HUMAN_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? 0,
  endYear:
    HUMAN_HISTORY_ERA_DEFINITIONS[HUMAN_HISTORY_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "world-history" as const,
  children: HUMAN_HISTORY_ERA_DEFINITIONS.map(toRawEraNode),
};

const humanHistoryMarkers = [
  ...PALEOLITHIC_MARKERS,
  ...EPIPALEOLITHIC_MARKERS,
  ...NEOLITHIC_MARKERS,
  ...CHALCOLITHIC_MARKERS,
  ...BRONZE_AGE_MARKERS,
  ...HISTORICAL_TURNING_POINT_MARKERS,
  ...CLASSICAL_ANTIQUITY_MARKERS,
  ...POST_CLASSICAL_MARKERS,
];

const humanSetDocument = buildTimelineSetDocument({
  metadata: {
    id: HUMAN_SET_ID,
    label: "Human",
    description:
      "Hominin evolution, archaeological cultures, civilizations, and recorded history.",
    tags: ["history", "archaeology", "civilization"],
    order: 2,
    defaultEnabled: true,
  },
  categories: [
    {
      id: HUMAN_HISTORY_GROUP_ID,
      label: "Human History",
      description: "All toggleable human-history marker collections.",
      order: 4,
      groups: [
        {
          id: HUMAN_HISTORY_GROUP_ID,
          label: "Human History",
          description:
            "Archaeological and historical markers across human time.",
          contentType: "markers",
          order: 0,
        },
      ],
    },
    {
      id: HUMAN_EVOLUTION_GROUP_ID,
      label: "Human Evolution",
      description: "Toggleable hominin overlays and milestone markers.",
      order: 5,
      groups: [
        {
          id: HUMAN_EVOLUTION_GROUP_ID,
          label: "Human Evolution",
          description:
            "Branching hominin overlays and major evolutionary markers.",
          contentType: "mixed",
          order: 0,
          autoToggleRule: {
            kind: "max-visible-span",
            hideAtOrBelowYears: 500_000,
            showAboveYears: 1_000_000,
          },
        },
      ],
    },
    {
      id: CULTURES_GROUP_ID,
      label: "Pre-Civilization Cultures",
      description:
        "Toggleable archaeological cultures and village worlds before early states and cities.",
      order: 6,
      groups: [
        {
          id: CULTURES_GROUP_ID,
          label: "Pre-Civilization Cultures",
          description:
            "Archaeological cultures and village worlds before or alongside the rise of early states and cities.",
          contentType: "overlays",
          order: 0,
        },
      ],
    },
    {
      id: CIVILIZATIONS_GROUP_ID,
      label: "Civilizations",
      description: "All toggleable civilization overlay bands.",
      order: 7,
      groups: [
        {
          id: CIVILIZATIONS_GROUP_ID,
          label: "Civilizations",
          description: "Ancient through early-modern civilization overlays.",
          contentType: "overlays",
          order: 0,
          autoToggleRule: {
            kind: "coverage-after-year",
            thresholdYear: 1_800,
            hideCoverage: 0.82,
            showCoverage: 0.68,
          },
        },
      ],
    },
  ],
  families: [
    {
      id: HUMAN_FAMILY_ID,
      label: "Human History",
      description: "Archaeological and world-history eras.",
      order: 2,
      priority: 300,
      defaultEnabled: true,
      root: humanFamilyRoot,
    },
  ],
  markers: [
    ...HUMAN_EVOLUTION_MARKERS.map((marker) =>
      toRawMarker(marker, HUMAN_EVOLUTION_GROUP_ID),
    ),
    ...humanHistoryMarkers.map((marker) =>
      toRawMarker(marker, HUMAN_HISTORY_GROUP_ID),
    ),
  ],
  overlays: [
    ...HUMAN_EVOLUTION_OVERLAYS.map((overlay) =>
      toRawOverlay(overlay, HUMAN_EVOLUTION_GROUP_ID),
    ),
    ...CULTURE_OVERLAYS.map((overlay) =>
      toRawOverlay(overlay, CULTURES_GROUP_ID),
    ),
    ...CIVILIZATION_OVERLAYS.map((overlay) =>
      toRawOverlay(overlay, CIVILIZATIONS_GROUP_ID),
    ),
  ],
  sourceCatalog: ERA_SOURCES,
  overlayLaneBias: {
    "chinese-civilization": -250,
    "homo-sapiens": -7_000_000,
  },
});

export const HUMAN_SET = normalizeTimelineSetDocument(humanSetDocument);
export const HUMAN_SET_FAMILY_IDS = HUMAN_SET.metadata.familyIds;
export const HUMAN_SET_CATEGORIES = HUMAN_SET.categories;
export const HUMAN_SET_GROUPS = HUMAN_SET.groups;
export const HUMAN_SET_MARKERS = HUMAN_SET.markers;
export const HUMAN_SET_OVERLAYS = HUMAN_SET.overlays;
export const HUMAN_SET_ERA_FAMILIES = HUMAN_SET.families;
