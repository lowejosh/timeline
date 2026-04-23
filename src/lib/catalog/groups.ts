import { COSMIC_MILESTONES_GROUP_ID } from "./sets/cosmic";
import { EARTH_MILESTONES_GROUP_ID } from "./sets/earth";
import {
  PHYSICS_MILESTONES_GROUP_ID,
  PHYSICS_CONTEXT_BANDS_GROUP_ID,
} from "./sets/physics";
import { TIMELINE_DECORATION_CATEGORY_IDS } from "./categories";
import type { TimelineDecorationGroup } from "../core/timelineTypes";

const PHYSICS_HISTORY_CATEGORY_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.physicsHistory;
const HUMAN_HISTORY_GROUP_ID = TIMELINE_DECORATION_CATEGORY_IDS.humanHistory;
const DEEP_TIME_LIFE_GROUP_ID = TIMELINE_DECORATION_CATEGORY_IDS.deepTimeLife;
const HUMAN_EVOLUTION_GROUP_ID =
  TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution;
const CULTURES_GROUP_ID = TIMELINE_DECORATION_CATEGORY_IDS.cultures;
const CIVILIZATIONS_GROUP_ID = TIMELINE_DECORATION_CATEGORY_IDS.civilizations;

const DEFAULT_HIDE_RECENT_COVERAGE = 0.82;
const DEFAULT_SHOW_RECENT_COVERAGE = 0.68;

export const TIMELINE_DECORATION_GROUPS: TimelineDecorationGroup[] = [
  {
    id: COSMIC_MILESTONES_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.cosmicMilestones,
    label: "Cosmic Milestones",
    description:
      "Core universe-scale milestone markers from recombination through solar-system formation.",
    contentType: "markers",
    order: 0,
  },
  {
    id: EARTH_MILESTONES_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.earthMilestones,
    label: "Earth Milestones",
    description:
      "Core early-Earth milestone markers from planetary formation through the earliest evidence of life.",
    contentType: "markers",
    order: 0,
  },
  {
    id: PHYSICS_MILESTONES_GROUP_ID,
    categoryId: PHYSICS_HISTORY_CATEGORY_ID,
    label: "Physics Milestones",
    description:
      "Major discoveries, experiments, and theories across the history of physics.",
    contentType: "markers",
    order: 0,
  },
  {
    id: PHYSICS_CONTEXT_BANDS_GROUP_ID,
    categoryId: PHYSICS_HISTORY_CATEGORY_ID,
    label: "Physics Context Bands",
    description:
      "Thematic era overlays marking paradigm shifts and intellectual movements across the history of physics.",
    contentType: "overlays",
    order: 1,
  },
  {
    id: DEEP_TIME_LIFE_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.deepTimeLife,
    label: "Deep Time Life",
    description:
      "Major life-history overlays and milestone markers across deep time.",
    contentType: "mixed",
    order: 0,
    autoToggleRule: {
      kind: "max-visible-span",
      hideAtOrBelowYears: 1_000_000,
      showAboveYears: 2_000_000,
    },
  },
  {
    id: HUMAN_HISTORY_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.humanHistory,
    label: "Human History",
    description: "Archaeological and historical markers across human time.",
    contentType: "markers",
    order: 0,
  },
  {
    id: HUMAN_EVOLUTION_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution,
    label: "Human Evolution",
    description: "Branching hominin overlays and major evolutionary markers.",
    contentType: "mixed",
    order: 0,
    autoToggleRule: {
      kind: "max-visible-span",
      hideAtOrBelowYears: 500_000,
      showAboveYears: 1_000_000,
    },
  },
  {
    id: CULTURES_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.cultures,
    label: "Pre-Civilization Cultures",
    description:
      "Archaeological cultures and village worlds before or alongside the rise of early states and cities.",
    contentType: "overlays",
    order: 0,
  },
  {
    id: CIVILIZATIONS_GROUP_ID,
    categoryId: TIMELINE_DECORATION_CATEGORY_IDS.civilizations,
    label: "Civilizations",
    description: "Ancient through early-modern civilization overlays.",
    contentType: "overlays",
    order: 0,
    autoToggleRule: {
      kind: "coverage-after-year",
      thresholdYear: 1_800,
      hideCoverage: DEFAULT_HIDE_RECENT_COVERAGE,
      showCoverage: DEFAULT_SHOW_RECENT_COVERAGE,
    },
  },
];

export const TIMELINE_DECORATION_GROUPS_BY_ID = Object.fromEntries(
  TIMELINE_DECORATION_GROUPS.map((group) => [group.id, group]),
) satisfies Record<string, TimelineDecorationGroup>;

export function getDefaultEnabledTimelineGroupIds() {
  return new Set(
    TIMELINE_DECORATION_GROUPS.filter(
      (group) => group.defaultEnabled !== false,
    ).map((group) => group.id),
  );
}
