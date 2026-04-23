import { COSMIC_MILESTONES_GROUP_ID } from "./sets/cosmic";
import { EARTH_MILESTONES_GROUP_ID } from "./sets/earth";
import type { TimelineDecorationCategory } from "../core/timelineTypes";

const PHYSICS_HISTORY_CATEGORY_ID = "physics-history";
const HUMAN_HISTORY_CATEGORY_ID = "human-history";
const DEEP_TIME_LIFE_CATEGORY_ID = "deep-time-life";
const HUMAN_EVOLUTION_CATEGORY_ID = "human-evolution";
const CULTURES_CATEGORY_ID = "cultures";
const CIVILIZATIONS_CATEGORY_ID = "civilizations";

export const TIMELINE_DECORATION_CATEGORY_IDS = {
  cosmicMilestones: COSMIC_MILESTONES_GROUP_ID,
  earthMilestones: EARTH_MILESTONES_GROUP_ID,
  physicsHistory: PHYSICS_HISTORY_CATEGORY_ID,
  deepTimeLife: DEEP_TIME_LIFE_CATEGORY_ID,
  humanHistory: HUMAN_HISTORY_CATEGORY_ID,
  humanEvolution: HUMAN_EVOLUTION_CATEGORY_ID,
  cultures: CULTURES_CATEGORY_ID,
  civilizations: CIVILIZATIONS_CATEGORY_ID,
} as const;

export const TIMELINE_DECORATION_CATEGORIES: TimelineDecorationCategory[] = [
  {
    id: COSMIC_MILESTONES_GROUP_ID,
    label: "Cosmic Milestones",
    description: "Foundational universe-scale milestone markers.",
    order: 0,
  },
  {
    id: EARTH_MILESTONES_GROUP_ID,
    label: "Earth Milestones",
    description: "Planetary formation and early-Earth milestone markers.",
    order: 1,
  },
  {
    id: PHYSICS_HISTORY_CATEGORY_ID,
    label: "History of Physics",
    description:
      "Physics milestone markers for the dedicated history-of-physics set.",
    order: 2,
  },
  {
    id: DEEP_TIME_LIFE_CATEGORY_ID,
    label: "Deep Time Life",
    description: "Toggleable deep-time life overlays and milestone markers.",
    order: 3,
  },
  {
    id: HUMAN_HISTORY_CATEGORY_ID,
    label: "Human History",
    description: "All toggleable human-history marker collections.",
    order: 4,
  },
  {
    id: HUMAN_EVOLUTION_CATEGORY_ID,
    label: "Human Evolution",
    description: "Toggleable hominin overlays and milestone markers.",
    order: 5,
  },
  {
    id: CULTURES_CATEGORY_ID,
    label: "Pre-Civilization Cultures",
    description:
      "Toggleable archaeological cultures and village worlds before early states and cities.",
    order: 6,
  },
  {
    id: CIVILIZATIONS_CATEGORY_ID,
    label: "Civilizations",
    description: "All toggleable civilization overlay bands.",
    order: 7,
  },
];
