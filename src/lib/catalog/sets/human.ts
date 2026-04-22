import type { EraFamilyId, TimelineSetId } from "../../core/timelineTypes";
import { TIMELINE_DECORATION_CATEGORY_IDS } from "../categories";

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
 * Decoration `groupId`s owned by the human set. Pulled from the canonical
 * category-id registry to keep a single source of truth.
 */
export const HUMAN_SET_GROUP_IDS: readonly string[] = [
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution,
  TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
  TIMELINE_DECORATION_CATEGORY_IDS.cultures,
  TIMELINE_DECORATION_CATEGORY_IDS.civilizations,
];
