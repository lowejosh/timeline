import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/core/timelineYears";
import { normalizeTimelineSetSource } from "@/lib/catalog/setSource";
import { GEOLOGICAL_ERA_DEFINITIONS } from "./data/eras";
import {
  EARTH_MILESTONE_MARKERS,
  DEEP_TIME_LIFE_MARKERS,
} from "./data/markers";
import { DEEP_TIME_LIFE_OVERLAYS } from "./data/overlays";
import { EARTH_SOURCES } from "./data/sources";

const geologicalRoot = {
  id: "geological-history",
  name: "Geological History",
  startYear: GEOLOGICAL_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    GEOLOGICAL_ERA_DEFINITIONS[GEOLOGICAL_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "chronostratigraphic" as const,
  children: GEOLOGICAL_ERA_DEFINITIONS,
};

export const EARTH_SET = normalizeTimelineSetSource({
  version: 1,
  metadata: {
    id: "earth",
    label: "Earth",
    description:
      "Earth-system and deep-time-life history from planetary formation through prehistory.",
    tags: ["geology", "planet", "life"],
    order: 1,
    defaultEnabled: true,
  },
  sources: EARTH_SOURCES,
  categories: [
    {
      id: "earth-milestones",
      label: "Earth Milestones",
      description: "Planetary formation and early-Earth milestone markers.",
      order: 1,
      groups: [
        {
          id: "earth-milestones",
          label: "Earth Milestones",
          description:
            "Core early-Earth milestone markers from planetary formation through the earliest evidence of life.",
          contentType: "markers",
          order: 0,
          markers: EARTH_MILESTONE_MARKERS,
        },
      ],
    },
    {
      id: "deep-time-life",
      label: "Deep Time Life",
      description: "Toggleable deep-time life overlays and milestone markers.",
      order: 3,
      groups: [
        {
          id: "deep-time-life",
          label: "Deep Time Life",
          description:
            "Major life-history overlays and milestone markers across deep time.",
          contentType: "mixed",
          order: 0,
          autoToggleRule: {
            kind: "max-visible-span",
            hideAtOrBelowYears: 1_000_000,
            showAboveYears: 2_000_000,
            onlyWhenHigherPrioritySetSpanVisible: true,
          },
          markers: DEEP_TIME_LIFE_MARKERS,
          overlays: DEEP_TIME_LIFE_OVERLAYS,
        },
      ],
    },
  ],
  families: [
    {
      id: "geological",
      label: "Geological History",
      description: "Earth-system and chronostratigraphic eras.",
      order: 1,
      priority: 200,
      defaultEnabled: true,
      root: geologicalRoot,
    },
  ],
});
