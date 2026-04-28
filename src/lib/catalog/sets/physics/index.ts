import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "@/lib/core/timelineYears";
import { normalizeTimelineSetSource } from "@/lib/catalog/setSource";
import { PHYSICS_HISTORY_ERA_DEFINITIONS } from "./data/eras";
import { PHYSICS_HISTORY_MARKERS } from "./data/markers";
import { PHYSICS_CONTEXT_OVERLAYS } from "./data/overlays";
import { PHYSICS_SOURCES } from "./data/sources";

const physicsFamilyRoot = {
  id: "physics-history",
  name: "History of Physics",
  startYear: PHYSICS_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    PHYSICS_HISTORY_ERA_DEFINITIONS[PHYSICS_HISTORY_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "history-of-science" as const,
  children: PHYSICS_HISTORY_ERA_DEFINITIONS,
};

export const PHYSICS_SET = normalizeTimelineSetSource({
  version: 1,
  metadata: {
    id: "physics",
    label: "History of Physics",
    description:
      "Ideas, experiments, and theories from ancient natural philosophy to modern particle physics.",
    tags: ["physics", "history", "science"],
    order: 3,
    defaultEnabled: true,
  },
  sources: PHYSICS_SOURCES,
  categories: [
    {
      id: "physics-history",
      label: "History of Physics",
      description:
        "Physics milestone markers and context bands for the dedicated history-of-physics set.",
      order: 2,
      groups: [
        {
          id: "physics-milestones",
          label: "Physics Milestones",
          description:
            "Major discoveries, experiments, and theories across the history of physics.",
          contentType: "markers",
          order: 0,
          markers: PHYSICS_HISTORY_MARKERS,
        },
        {
          id: "physics-context-bands",
          label: "Physics Context Bands",
          description:
            "Thematic era overlays marking paradigm shifts and intellectual movements across the history of physics.",
          contentType: "overlays",
          order: 1,
          overlays: PHYSICS_CONTEXT_OVERLAYS,
        },
      ],
    },
  ],
  families: [
    {
      id: "physics-history",
      label: "History of Physics",
      description:
        "Historical ages for major shifts in physical thought and discovery.",
      order: 3,
      priority: 350,
      defaultEnabled: false,
      root: physicsFamilyRoot,
    },
  ],
});
