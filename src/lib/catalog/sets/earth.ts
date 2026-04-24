import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "../../core/timelineYears";
import { GEOLOGICAL_ERA_DEFINITIONS } from "../../domain/eraTrees/geological";
import { ERA_SOURCES } from "../../domain/eraSources";
import {
  CORE_TIMELINE_MARKERS,
  DEEP_TIME_LIFE_MARKERS,
} from "../../domain/markers";
import { DEEP_TIME_LIFE_OVERLAYS } from "../../domain/overlays";
import { normalizeTimelineSetDocument } from "../setSchema";
import {
  buildTimelineSetDocument,
  toRawEraNode,
  toRawMarker,
  toRawOverlay,
} from "./shared";

export const EARTH_SET_ID = "earth";
export const EARTH_MILESTONES_GROUP_ID = "earth-milestones";
export const DEEP_TIME_LIFE_GROUP_ID = "deep-time-life";
const GEOLOGICAL_FAMILY_ID = "geological";

const geologicalRoot = {
  id: "geological-history",
  name: "Geological History",
  startYear: GEOLOGICAL_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    GEOLOGICAL_ERA_DEFINITIONS[GEOLOGICAL_ERA_DEFINITIONS.length - 1]?.endYear ??
    TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "chronostratigraphic" as const,
  children: GEOLOGICAL_ERA_DEFINITIONS.map(toRawEraNode),
};

const earthSetDocument = buildTimelineSetDocument({
  metadata: {
    id: EARTH_SET_ID,
    label: "Earth",
    description:
      "Earth-system and deep-time-life history from planetary formation through prehistory.",
    tags: ["geology", "planet", "life"],
    order: 1,
    defaultEnabled: true,
  },
  categories: [
    {
      id: EARTH_MILESTONES_GROUP_ID,
      label: "Earth Milestones",
      description: "Planetary formation and early-Earth milestone markers.",
      order: 1,
      groups: [
        {
          id: EARTH_MILESTONES_GROUP_ID,
          label: "Earth Milestones",
          description:
            "Core early-Earth milestone markers from planetary formation through the earliest evidence of life.",
          contentType: "markers",
          order: 0,
        },
      ],
    },
    {
      id: DEEP_TIME_LIFE_GROUP_ID,
      label: "Deep Time Life",
      description: "Toggleable deep-time life overlays and milestone markers.",
      order: 3,
      groups: [
        {
          id: DEEP_TIME_LIFE_GROUP_ID,
          label: "Deep Time Life",
          description:
            "Major life-history overlays and milestone markers across deep time.",
          contentType: "mixed",
          order: 0,
          autoToggleRule: {
            kind: "max-visible-span",
            hideAtOrBelowYears: 1_000_000,
            showAboveYears: 2_000_000,
          },
        },
      ],
    },
  ],
  families: [
    {
      id: GEOLOGICAL_FAMILY_ID,
      label: "Geological History",
      description: "Earth-system and chronostratigraphic eras.",
      order: 1,
      priority: 200,
      defaultEnabled: true,
      root: geologicalRoot,
    },
  ],
  markers: [
    ...CORE_TIMELINE_MARKERS.map((marker) =>
      toRawMarker(marker, EARTH_MILESTONES_GROUP_ID),
    ),
    ...DEEP_TIME_LIFE_MARKERS.map((marker) =>
      toRawMarker(marker, DEEP_TIME_LIFE_GROUP_ID),
    ),
  ],
  overlays: DEEP_TIME_LIFE_OVERLAYS.map((overlay) =>
    toRawOverlay(overlay, DEEP_TIME_LIFE_GROUP_ID),
  ),
  sourceCatalog: ERA_SOURCES,
});

export const EARTH_SET = normalizeTimelineSetDocument(earthSetDocument);
export const EARTH_SET_FAMILY_IDS = EARTH_SET.metadata.familyIds;
export const EARTH_SET_CATEGORIES = EARTH_SET.categories;
export const EARTH_SET_GROUPS = EARTH_SET.groups;
export const EARTH_SET_MARKERS = EARTH_SET.markers;
export const EARTH_SET_OVERLAYS = EARTH_SET.overlays;
export const EARTH_SET_ERA_FAMILIES = EARTH_SET.families;
