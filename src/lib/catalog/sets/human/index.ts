import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";
import { normalizeTimelineSetSource } from "@/lib/catalog/setSource";
import { HUMAN_HISTORY_ERA_DEFINITIONS } from "./data/eras";
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
} from "./data/markers";
import {
  CIVILIZATION_OVERLAYS,
  CULTURE_OVERLAYS,
  HUMAN_EVOLUTION_OVERLAYS,
} from "./data/overlays";
import { HUMAN_SOURCES } from "./data/sources";

const humanFamilyRoot = {
  id: "human-history-root",
  name: "Human History",
  startYear: HUMAN_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? 0,
  endYear:
    HUMAN_HISTORY_ERA_DEFINITIONS[HUMAN_HISTORY_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "world-history" as const,
  children: HUMAN_HISTORY_ERA_DEFINITIONS,
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

export const HUMAN_SET = normalizeTimelineSetSource({
  version: 1,
  metadata: {
    id: "human",
    label: "Human",
    description:
      "Hominin evolution, archaeological cultures, civilizations, and recorded history.",
    tags: ["history", "archaeology", "civilization"],
    order: 2,
    defaultEnabled: true,
  },
  sources: HUMAN_SOURCES,
  categories: [
    {
      id: "human-history",
      label: "Human History",
      description: "All toggleable human-history marker collections.",
      order: 4,
      groups: [
        {
          id: "human-history",
          label: "Human History",
          description:
            "Archaeological and historical markers across human time.",
          contentType: "markers",
          order: 0,
          markers: humanHistoryMarkers,
        },
      ],
    },
    {
      id: "human-evolution",
      label: "Human Evolution",
      description: "Toggleable hominin overlays and milestone markers.",
      order: 5,
      groups: [
        {
          id: "human-evolution",
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
          markers: HUMAN_EVOLUTION_MARKERS,
          overlays: HUMAN_EVOLUTION_OVERLAYS,
        },
      ],
    },
    {
      id: "cultures",
      label: "Pre-Civilization Cultures",
      description:
        "Toggleable archaeological cultures and village worlds before early states and cities.",
      order: 6,
      groups: [
        {
          id: "cultures",
          label: "Pre-Civilization Cultures",
          description:
            "Archaeological cultures and village worlds before or alongside the rise of early states and cities.",
          contentType: "overlays",
          order: 0,
          overlays: CULTURE_OVERLAYS,
        },
      ],
    },
    {
      id: "civilizations",
      label: "Civilizations",
      description: "All toggleable civilization overlay bands.",
      order: 7,
      groups: [
        {
          id: "civilizations",
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
          overlays: CIVILIZATION_OVERLAYS,
        },
      ],
    },
  ],
  families: [
    {
      id: "human-history",
      label: "Human History",
      description: "Archaeological and world-history eras.",
      order: 2,
      priority: 300,
      defaultEnabled: true,
      root: humanFamilyRoot,
    },
  ],
  overlayLaneBias: {
    "chinese-civilization": -250,
    "homo-sapiens": -7_000_000,
  },
});
