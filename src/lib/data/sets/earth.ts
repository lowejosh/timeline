import type {
  EraFamilyId,
  TimelineSetId,
} from "../timelineTypes";

/**
 * Earth set — Earth-system history from planetary formation through the end
 * of prehistory (deep-time life, geological eras). Owns the `geological` era
 * family and the deep-time-life decoration group.
 */
export const EARTH_SET_ID: TimelineSetId = "earth";

export const EARTH_SET_FAMILY_IDS: readonly EraFamilyId[] = ["geological"];

/**
 * Marker IDs from the shared core markers file that belong to the earth set
 * (Earth formation through earliest evidence of life).
 */
export const EARTH_SET_CORE_MARKER_IDS: ReadonlySet<string> = new Set([
  "earth-formation",
  "moon-forms",
  "oldest-known-zircons-form",
  "early-oceans-and-hydrosphere",
  "earliest-evidence-of-life",
]);

/**
 * Decoration `groupId`s owned by the earth set. Values mirror the
 * `TIMELINE_DECORATION_CATEGORY_IDS` string literals in `timelineDecorations.ts`
 * but are redeclared here to avoid a circular dependency with the set registry.
 */
export const EARTH_SET_GROUP_IDS: readonly string[] = ["deep-time-life"];
