import type { EraDefinition } from "../timelineTypes";
import { afterBigBang, yearsAgo } from "../timelineDateBuilders";

export const EARLY_UNIVERSE_ID = "early-universe";
export const EARLY_UNIVERSE_START_YEAR = afterBigBang(0);
export const EARLY_UNIVERSE_END_YEAR = afterBigBang(380_000);
export const DARK_AGES_END_YEAR = afterBigBang(200_000_000);
export const REIONIZATION_END_YEAR = afterBigBang(1_000_000_000);

export const COSMIC_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: EARLY_UNIVERSE_ID,
    name: "Early Universe",
    startYear: EARLY_UNIVERSE_START_YEAR,
    endYear: EARLY_UNIVERSE_END_YEAR,
    description:
      "Inflation, primordial particles, and the first atoms emerge as the universe cools from a hot dense beginning.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA uses inflation and recombination as foundational early-universe transitions; this band covers the hot early cosmos through recombination, when neutral atoms form and the cosmic microwave background is released.",
      },
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA's Cosmic History page explicitly names cosmic inflation, big bang nucleosynthesis, and recombination, placing recombination at about 380,000 years after the Big Bang.",
      },
    ],
  },
  {
    id: "dark-ages",
    name: "Dark Ages",
    startYear: EARLY_UNIVERSE_END_YEAR,
    endYear: DARK_AGES_END_YEAR,
    description:
      "Neutral hydrogen fills a starless universe after recombination, before the first stars light up space.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA describes the post-recombination neutral universe as the Dark Ages, before the first stars switch on and begin reionizing the intergalactic medium.",
      },
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA says the universe remained dark for the next 200 million years after recombination because no stars yet existed to shine.",
      },
    ],
  },
  {
    id: "first-stars-and-reionization",
    name: "First Stars and Reionization",
    startYear: DARK_AGES_END_YEAR,
    endYear: REIONIZATION_END_YEAR,
    description:
      "The first stars and young galaxies ignite, flooding space with ultraviolet light that reionizes cosmic gas.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA says the first stars formed after the dark ages and that by the time the universe was 1 billion years old, stars and galaxies had reionized nearly all the gas.",
      },
      {
        sourceId: "nasaLambdaCosmology",
        note: "NASA LAMBDA ties cosmic dawn to the first radiation sources and describes their light as reionizing the intergalactic medium across this interval.",
      },
    ],
  },
  {
    id: "galaxy-assembly",
    name: "Galaxy Assembly",
    startYear: REIONIZATION_END_YEAR,
    endYear: yearsAgo(4_567_000_000),
    description:
      "Galaxies grow, merge, and settle into the large-scale cosmic web long before the solar nebula forms.",
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaLambdaCosmology",
        note: "After reionization, NASA LAMBDA describes structure continuing to grow and merge under gravity into the large-scale cosmic web, clusters, and galaxy systems.",
      },
      {
        sourceId: "nasaSolarSystemFacts",
        note: "This band ends when the solar system forms about 4.6 billion years ago from a collapsing cloud of gas and dust that became a solar nebula.",
      },
    ],
  },
];
