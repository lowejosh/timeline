import type { EraDefinition } from "../timelineTypes";

export const COSMIC_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "primordial-universe",
    name: "Primordial Universe",
    startYear: -13_800_000_000,
    endYear: -13_600_000_000,
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "Broad app band covering inflation, the big bang, nucleosynthesis, recombination, and the cosmic dark ages up to roughly 200 million years after the Big Bang.",
      },
    ],
  },
  {
    id: "cosmic-dawn",
    name: "Cosmic Dawn",
    startYear: -13_600_000_000,
    endYear: -12_800_000_000,
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "NASA places the first stars after about 200 million years and says reionization is largely complete by the time the universe is about 1 billion years old.",
      },
      {
        sourceId: "nasaStarBasics",
        note: "Adds general context for star formation from collapsing clouds of gas and dust.",
      },
    ],
  },
  {
    id: "galaxies-take-shape",
    name: "Galaxies Take Shape",
    startYear: -12_800_000_000,
    endYear: -4_567_000_000,
    scheme: "cosmic",
    sourceRefs: [
      {
        sourceId: "nasaUniverseOverview",
        note: "This band begins after reionization, when the universe has become transparent to light in the way we observe today.",
      },
      {
        sourceId: "nasaGalaxyBasics",
        note: "NASA notes that most galaxies are roughly 10 to 13.6 billion years old; this broad app band covers the long era of galaxy growth and evolution before our solar system forms.",
      },
      {
        sourceId: "nasaSolarSystemFacts",
        note: "Ends when the solar system forms about 4.6 billion years ago.",
      },
    ],
  },
];