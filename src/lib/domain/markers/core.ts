import type { TimelineMarker } from "../../core/timelineTypes";
import { afterBigBang, yearsAgo } from "../timelineDateBuilders";

export const CORE_TIMELINE_MARKERS: TimelineMarker[] = [
  {
    id: "cosmic-microwave-background-released",
    label: "Cosmic microwave background released",
    shortLabel: "CMB Released",
    year: afterBigBang(380_000),
    approximate: true,
    description:
      "About 380,000 years after the Big Bang, the first atoms formed and the cosmic fog cleared, releasing the oldest light we can still observe today.",
    minZoom: 0,
    priority: 92,
    sourceIds: [
      "nasaUniverseOverview",
      "nasaLambdaCosmology"
    ],
  },
  {
    id: "first-stars-ignite",
    label: "First stars ignite",
    shortLabel: "First Stars",
    year: afterBigBang(200_000_000),
    approximate: true,
    description:
      "The first stars ended the fully dark universe, flooding space with new light and helping seed the earliest galaxies.",
    minZoom: 0,
    priority: 91,
    sourceIds: [
      "nasaUniverseOverview",
      "nasaLambdaCosmology"
    ],
  },
  {
    id: "reionization-largely-complete",
    label: "Reionization largely complete",
    shortLabel: "Reionization",
    year: afterBigBang(1_000_000_000),
    approximate: true,
    description:
      "By roughly 1 billion years after the Big Bang, starlight and young galaxies had reionized nearly all intergalactic gas, leaving the universe broadly transparent to light again.",
    minZoom: 0,
    priority: 90,
    sourceIds: [
      "nasaUniverseOverview",
      "nasaLambdaCosmology"
    ],
  },
  {
    id: "milky-way-like-star-birth-peaks",
    label: "Milky Way-like star birth peaks",
    shortLabel: "Star-Birth Peak",
    year: yearsAgo(10_300_000_000),
    approximate: true,
    description:
      "Milky Way-like galaxies hit a stellar baby boom, forming stars far faster than our galaxy does today.",
    minZoom: 0,
    priority: 89,
    sourceIds: [
      "nasaMilkyWayGrowth",
      "nasaSunLateToMilkyWayParty"
    ],
  },
  {
    id: "milky-way-like-spiral-shape-emerges",
    label: "Milky Way-like spiral shape emerges",
    shortLabel: "Spiral Shape",
    year: yearsAgo(8_900_000_000),
    approximate: true,
    description:
      "By this stage, Milky Way-like galaxies have grown larger and show a clear spiral form with older stars concentrated toward the center.",
    minZoom: 0,
    priority: 88,
    sourceIds: [
      "nasaMilkyWayGrowth",
      "nasaGalaxyBasics"
    ],
  },
  {
    id: "solar-system-formation",
    label: "Solar System forms",
    shortLabel: "Solar System",
    year: yearsAgo(4_567_000_000),
    approximate: true,
    description:
      "A collapsing cloud of gas and dust forms the Sun, a spinning solar nebula, and the raw material of the planets.",
    minZoom: 0,
    priority: 90,
    sourceIds: ["nasaSolarSystemFacts"],
  },
  {
    id: "earth-formation",
    label: "Earth forms",
    shortLabel: "Earth",
    year: yearsAgo(4_540_000_000),
    approximate: true,
    description:
      "Dust and rock clump together in the young solar system, building the planet Earth.",
    minZoom: 0,
    priority: 100,
    sourceIds: ["usgsAgeOfEarth"],
  },
  {
    id: "moon-forms",
    label: "Moon forms",
    shortLabel: "Moon",
    year: yearsAgo(4_500_000_000),
    approximate: true,
    description:
      "A giant collision with the young Earth blasted debris into orbit, eventually assembling the Moon.",
    minZoom: 0,
    priority: 99,
    sourceIds: [
      "nasaMoonFormation",
      "uwMadisonCoolEarlyEarth"
    ],
  },
  {
    id: "oldest-known-zircons-form",
    label: "Oldest known zircons form",
    shortLabel: "Oldest Zircons",
    year: yearsAgo(4_400_000_000),
    approximate: true,
    description:
      "Jack Hills zircons preserve the oldest known material formed on Earth, hinting that crust had already solidified surprisingly early.",
    minZoom: 0,
    priority: 98,
    sourceIds: [
      "uwMadisonCoolEarlyEarth",
      "amnhZirconsEarlyEarth"
    ],
  },
  {
    id: "early-oceans-and-hydrosphere",
    label: "Early oceans and hydrosphere",
    shortLabel: "Early Oceans",
    year: yearsAgo(4_300_000_000),
    approximate: true,
    description:
      "Evidence from ancient zircons suggests Earth already had liquid water, oceans, and a hydrosphere not long after its crust formed.",
    minZoom: 0,
    priority: 97,
    sourceIds: [
      "uwMadisonCoolEarlyEarth",
      "amnhZirconsEarlyEarth"
    ],
  },
];
