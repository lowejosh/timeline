import { normalizeTimelineSetSource } from "@/lib/catalog/setSource";
import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";
import { COMPUTING_HISTORY_ERA_DEFINITIONS } from "./data/eras";
import { COMPUTING_HISTORY_MARKERS } from "./data/markers";
import { COMPUTER_MODEL_OVERLAYS } from "./data/overlays";
import { COMPUTING_SOURCES } from "./data/sources";

const computingFamilyRoot = {
  id: "computing-history-root",
  name: "Computing & Information",
  startYear: COMPUTING_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? 0,
  endYear:
    COMPUTING_HISTORY_ERA_DEFINITIONS[
      COMPUTING_HISTORY_ERA_DEFINITIONS.length - 1
    ]?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "history-of-science" as const,
  children: COMPUTING_HISTORY_ERA_DEFINITIONS,
};

export const COMPUTING_SET = normalizeTimelineSetSource({
  version: 1,
  metadata: {
    id: "computing",
    label: "Computing & Information",
    description:
      "Computation, machines, platforms, and networked information systems from Babbage to the web and smartphones.",
    tags: ["computing", "internet", "technology"],
    order: 4,
    defaultEnabled: false,
  },
  sources: COMPUTING_SOURCES,
  categories: [
    {
      id: "computing-history",
      label: "Computing History",
      description: "Computing-history milestones across machines, platforms, and networked systems.",
      order: 8,
      groups: [
        {
          id: "computing-history",
          label: "Computing Milestones",
          description:
            "Milestones in computation theory, networking, and the rise of the web.",
          contentType: "markers",
          order: 0,
          defaultEnabled: true,
          markers: COMPUTING_HISTORY_MARKERS,
        },
        {
          id: "computer-models",
          label: "Computer Models",
          description:
            "Notable machines, systems, and consumer computer models from early electronic computers to the smartphone era.",
          contentType: "overlays",
          order: 1,
          defaultEnabled: true,
          overlays: COMPUTER_MODEL_OVERLAYS,
        },
      ],
    },
  ],
  families: [
    {
      id: "computing-history",
      label: "Computing History",
      description: "Broad eras across the history of computation and digital systems.",
      order: 4,
      priority: 340,
      defaultEnabled: false,
      root: computingFamilyRoot,
    },
  ],
});
