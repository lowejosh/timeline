import { cosmicSetDocument } from "./cosmicDocument";
import {
  normalizeTimelineSetDocument,
} from "../setSchema";

export const COSMIC_SET = normalizeTimelineSetDocument(
  cosmicSetDocument,
);

const cosmicMilestonesGroup = COSMIC_SET.groups.find(
  (group) => group.id === "cosmic-milestones",
);

if (!cosmicMilestonesGroup) {
  throw new Error("Cosmic set must define the cosmic-milestones group.");
}

const cosmicFamily = COSMIC_SET.families.find((family) => family.id === "cosmic");

if (!cosmicFamily) {
  throw new Error("Cosmic set must define the cosmic era family.");
}

export const COSMIC_MILESTONES_GROUP_ID = cosmicMilestonesGroup.id;
export const COSMIC_SET_ID = COSMIC_SET.metadata.id;
export const COSMIC_SET_CONFIG = COSMIC_SET.metadata;
export const COSMIC_SET_FAMILY_IDS = COSMIC_SET.metadata.familyIds;
export const COSMIC_SET_GROUP_IDS = COSMIC_SET.groups.map((group) => group.id);
export const COSMIC_SET_CORE_MARKER_IDS: ReadonlySet<string> = new Set(
  COSMIC_SET.markers.map((marker) => marker.id),
);
export const COSMIC_SET_CATEGORIES = COSMIC_SET.categories;
export const COSMIC_SET_GROUP_TREE = COSMIC_SET.groupTree;
export const COSMIC_SET_GROUPS = COSMIC_SET.groups;
export const COSMIC_SET_SOURCES = COSMIC_SET.sources;
export const COSMIC_SET_MARKERS = COSMIC_SET.markers;
export const COSMIC_SET_OVERLAYS = COSMIC_SET.overlays;
export const COSMIC_SET_ERA_FAMILIES = COSMIC_SET.families;
export const COSMIC_FAMILY_ROOT_DEFINITION = cosmicFamily.root;
export const COSMIC_ERA_DEFINITIONS = cosmicFamily.root.children ?? [];
