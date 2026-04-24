export { TIMELINE_DECORATION_CATEGORIES } from "./timelineRegistry";
import { COSMIC_MILESTONES_GROUP_ID } from "./sets/cosmic";
import { DEEP_TIME_LIFE_GROUP_ID, EARTH_MILESTONES_GROUP_ID } from "./sets/earth";
import {
  CIVILIZATIONS_GROUP_ID,
  CULTURES_GROUP_ID,
  HUMAN_EVOLUTION_GROUP_ID,
  HUMAN_HISTORY_GROUP_ID,
} from "./sets/human";

const PHYSICS_HISTORY_CATEGORY_ID = "physics-history";

export const TIMELINE_DECORATION_CATEGORY_IDS = {
  cosmicMilestones: COSMIC_MILESTONES_GROUP_ID,
  earthMilestones: EARTH_MILESTONES_GROUP_ID,
  physicsHistory: PHYSICS_HISTORY_CATEGORY_ID,
  deepTimeLife: DEEP_TIME_LIFE_GROUP_ID,
  humanHistory: HUMAN_HISTORY_GROUP_ID,
  humanEvolution: HUMAN_EVOLUTION_GROUP_ID,
  cultures: CULTURES_GROUP_ID,
  civilizations: CIVILIZATIONS_GROUP_ID,
} as const;
