import type { EraFamilyId, TimelineSetId } from "../../core/timelineTypes";

export const PHYSICS_MILESTONES_GROUP_ID = "physics-milestones";
export const PHYSICS_CONTEXT_BANDS_GROUP_ID = "physics-context-bands";

/**
 * History of Physics set — a research-focused collection of milestone markers
 * and a dedicated overlapping era family spanning ancient natural philosophy
 * through contemporary physics.
 */
export const PHYSICS_SET_ID: TimelineSetId = "physics";

export const PHYSICS_SET_FAMILY_IDS: readonly EraFamilyId[] = [
  "physics-history",
];

export const PHYSICS_SET_CORE_MARKER_IDS: ReadonlySet<string> = new Set();

export const PHYSICS_SET_GROUP_IDS: readonly string[] = [
  PHYSICS_MILESTONES_GROUP_ID,
  PHYSICS_CONTEXT_BANDS_GROUP_ID,
];
