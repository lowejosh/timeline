import {
  COSMIC_ERA_DEFINITIONS as CANONICAL_COSMIC_ERA_DEFINITIONS,
  COSMIC_FAMILY_ROOT_DEFINITION,
} from "../../catalog/sets/cosmic";

function getRequiredEra(eraId: string) {
  const era = CANONICAL_COSMIC_ERA_DEFINITIONS.find(
    (candidate) => candidate.id === eraId,
  );

  if (!era) {
    throw new Error(`Missing canonical cosmic era: ${eraId}`);
  }

  return era;
}

export const EARLY_UNIVERSE_ID = "early-universe";
export const EARLY_UNIVERSE_START_YEAR = COSMIC_FAMILY_ROOT_DEFINITION.startYear;
export const EARLY_UNIVERSE_END_YEAR = getRequiredEra("recombination").endYear;
export const DARK_AGES_END_YEAR = getRequiredEra("dark-ages").endYear;
export const REIONIZATION_END_YEAR = getRequiredEra(
  "first-stars-and-reionization",
).endYear;
export const DARK_ENERGY_ACCELERATION_START_YEAR = getRequiredEra(
  "dark-energy-acceleration",
).startYear;
export const EARLY_UNIVERSE_CHILD_ERA_ORDER =
  CANONICAL_COSMIC_ERA_DEFINITIONS.slice(0, 10).map((era) => era.id);

export const COSMIC_ERA_DEFINITIONS = CANONICAL_COSMIC_ERA_DEFINITIONS;
