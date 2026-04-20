import type {
  EraFamilyId,
  TimelineSetId,
} from "../timelineTypes";

export const COSMIC_MILESTONES_GROUP_ID = "cosmic-milestones";

/**
 * Cosmic set — universe-scale history from the Big Bang through the formation
 * of the Solar System. Owns the `cosmic` era family and the pre-Earth portion
 * of the core timeline markers.
 */
export const COSMIC_SET_ID: TimelineSetId = "cosmic";

export const COSMIC_SET_FAMILY_IDS: readonly EraFamilyId[] = ["cosmic"];

/**
 * Marker IDs from the shared core markers file that belong to the cosmic set
 * (everything from the CMB through the Solar System forming). IDs are listed
 * explicitly so the core markers file does not need to be split.
 */
export const COSMIC_SET_CORE_MARKER_IDS: ReadonlySet<string> = new Set([
  "cosmic-microwave-background-released",
  "first-stars-ignite",
  "reionization-largely-complete",
  "milky-way-like-star-birth-peaks",
  "milky-way-like-spiral-shape-emerges",
  "solar-system-formation",
]);

/**
 * Decoration `groupId`s fully owned by the cosmic set. The milestone markers
 * are grouped into a dedicated marker-only bucket so the user-facing set tree
 * can expose a consistent child-toggle model.
 */
export const COSMIC_SET_GROUP_IDS: readonly string[] = [
  COSMIC_MILESTONES_GROUP_ID,
];
