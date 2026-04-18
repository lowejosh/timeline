import type { TimelineMarker } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const CORE_TIMELINE_MARKERS: TimelineMarker[] = [
  {
    id: "solar-system-formation",
    label: "Solar System forms",
    shortLabel: "Solar System",
    year: yearsAgo(4_567_000_000),
    approximate: true,
    minZoom: 0,
    priority: 90,
    sourceRefs: [
      {
        sourceId: "nasaSolarSystemFacts",
        note: "NASA rounds the solar system's formation to about 4.6 billion years ago; this marker aligns to the 4.567 Ga Hadean boundary already used in the primary chronology.",
      },
    ],
  },
  {
    id: "earth-formation",
    label: "Earth forms",
    shortLabel: "Earth",
    year: yearsAgo(4_540_000_000),
    approximate: true,
    minZoom: 0,
    priority: 100,
    sourceRefs: [
      {
        sourceId: "usgsAgeOfEarth",
        note: "USGS summarizes Earth's age as about 4.54 billion years.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "nasaMoonFormation",
        note: "NASA says that near the time of the solar system's formation, about 4.5 billion years ago, an impact with the young Earth flung debris into space that created the Moon.",
      },
      {
        sourceId: "uwMadisonCoolEarlyEarth",
        note: "UW–Madison likewise summarizes a Mars-sized collision about 4.5 billion years ago that formed the Moon and melted and homogenized the Earth.",
      },
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
    sourceRefs: [
      {
        sourceId: "uwMadisonCoolEarlyEarth",
        note: "UW–Madison says Jack Hills zircons confirm Earth's crust first formed at least 4.4 billion years ago and identifies the dated grain as the oldest known material formed on Earth.",
      },
      {
        sourceId: "amnhZirconsEarlyEarth",
        note: "AMNH says the oldest Jack Hills zircons are 4.375 billion years old and that zircons are the oldest preserved material we have from early Earth.",
      },
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
    sourceRefs: [
      {
        sourceId: "uwMadisonCoolEarlyEarth",
        note: "UW–Madison says the study reinforces the conclusion that Earth had a hydrosphere before 4.3 billion years ago, with temperatures low enough for liquid water and oceans.",
      },
      {
        sourceId: "amnhZirconsEarlyEarth",
        note: "AMNH summarizes zircon evidence as implying that by about 4.4 billion years ago Earth had continents above sea level and oceans, meaning liquid water existed at the surface.",
      },
    ],
  },
  {
    id: "earliest-evidence-of-life",
    label: "Earliest evidence of life on Earth",
    shortLabel: "Earliest Life",
    year: yearsAgo(3_500_000_000),
    approximate: true,
    minZoom: 0,
    priority: 95,
    sourceRefs: [
      {
        sourceId: "berkeleyOriginOfLife",
        note: "Understanding Evolution says evidence suggests life first evolved around 3.5 billion years ago; the app phrases this conservatively as the earliest evidence of life rather than an exact moment life began.",
      },
    ],
  },
];
