import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "../../core/timelineYears";
import { PHYSICS_HISTORY_ERA_DEFINITIONS } from "../../domain/eraTrees/physicsHistory";
import { ERA_SOURCES } from "../../domain/eraSources";
import { PHYSICS_HISTORY_MARKERS } from "../../domain/markers";
import { PHYSICS_CONTEXT_OVERLAYS } from "../../domain/overlays";
import { normalizeTimelineSetDocument } from "../setSchema";
import {
  buildTimelineSetDocument,
  toRawEraNode,
  toRawMarker,
  toRawOverlay,
} from "./shared";

export const PHYSICS_SET_ID = "physics";
export const PHYSICS_MILESTONES_GROUP_ID = "physics-milestones";
export const PHYSICS_CONTEXT_BANDS_GROUP_ID = "physics-context-bands";
const PHYSICS_FAMILY_ID = "physics-history";

const physicsFamilyRoot = {
  id: "physics-history",
  name: "History of Physics",
  startYear: PHYSICS_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    PHYSICS_HISTORY_ERA_DEFINITIONS[
      PHYSICS_HISTORY_ERA_DEFINITIONS.length - 1
    ]?.endYear ?? TIMELINE_MAX_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "history-of-science" as const,
  children: PHYSICS_HISTORY_ERA_DEFINITIONS.map(toRawEraNode),
};

const physicsSetDocument = buildTimelineSetDocument({
  metadata: {
    id: PHYSICS_SET_ID,
    label: "History of Physics",
    description:
      "Ideas, experiments, and theories from ancient natural philosophy to modern particle physics.",
    tags: ["physics", "history", "science"],
    order: 3,
    defaultEnabled: false,
  },
  categories: [
    {
      id: "physics-history",
      label: "History of Physics",
      description:
        "Physics milestone markers and context bands for the dedicated history-of-physics set.",
      order: 2,
      groups: [
        {
          id: PHYSICS_MILESTONES_GROUP_ID,
          label: "Physics Milestones",
          description:
            "Major discoveries, experiments, and theories across the history of physics.",
          contentType: "markers",
          order: 0,
        },
        {
          id: PHYSICS_CONTEXT_BANDS_GROUP_ID,
          label: "Physics Context Bands",
          description:
            "Thematic era overlays marking paradigm shifts and intellectual movements across the history of physics.",
          contentType: "overlays",
          order: 1,
        },
      ],
    },
  ],
  families: [
    {
      id: PHYSICS_FAMILY_ID,
      label: "History of Physics",
      description:
        "Historical ages for major shifts in physical thought and discovery.",
      order: 3,
      priority: 350,
      defaultEnabled: false,
      root: physicsFamilyRoot,
    },
  ],
  markers: PHYSICS_HISTORY_MARKERS.map((marker) =>
    toRawMarker(marker, PHYSICS_MILESTONES_GROUP_ID),
  ),
  overlays: PHYSICS_CONTEXT_OVERLAYS.map((overlay) =>
    toRawOverlay(overlay, PHYSICS_CONTEXT_BANDS_GROUP_ID),
  ),
  sourceCatalog: ERA_SOURCES,
});

export const PHYSICS_SET = normalizeTimelineSetDocument(physicsSetDocument);
export const PHYSICS_SET_FAMILY_IDS = PHYSICS_SET.metadata.familyIds;
export const PHYSICS_SET_CATEGORIES = PHYSICS_SET.categories;
export const PHYSICS_SET_GROUPS = PHYSICS_SET.groups;
export const PHYSICS_SET_MARKERS = PHYSICS_SET.markers;
export const PHYSICS_SET_OVERLAYS = PHYSICS_SET.overlays;
export const PHYSICS_SET_ERA_FAMILIES = PHYSICS_SET.families;
