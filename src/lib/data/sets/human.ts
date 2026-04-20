import type {
  EraFamilyId,
  TimelineSetId,
} from "../timelineTypes";

/**
 * Human set — everything about humans: hominin evolution, archaeological
 * cultures, civilizations, and recorded history. Owns the `human-history`
 * era family and all human-scoped decoration groups.
 */
export const HUMAN_SET_ID: TimelineSetId = "human";

export const HUMAN_SET_FAMILY_IDS: readonly EraFamilyId[] = ["human-history"];

/**
 * Core markers file contains no human-era entries, but the field is declared
 * for registry uniformity and future additions.
 */
export const HUMAN_SET_CORE_MARKER_IDS: ReadonlySet<string> = new Set();

/**
 * Decoration `groupId`s owned by the human set. Values mirror the
 * `TIMELINE_DECORATION_CATEGORY_IDS` string literals in `timelineDecorations.ts`
 * but are redeclared here to avoid a circular dependency with the set registry.
 */
export const HUMAN_SET_GROUP_IDS: readonly string[] = [
  "human-evolution",
  "human-history",
  "cultures",
  "civilizations",
];
