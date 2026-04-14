import type { TimelineMarker } from "../timelineTypes";

export const CORE_TIMELINE_MARKERS: TimelineMarker[] = [
  {
    id: "solar-system-formation",
    label: "Solar System forms",
    shortLabel: "Solar System",
    year: -4_567_000_000,
    color: "rgba(125, 88, 48, 0.92)",
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
    year: -4_540_000_000,
    color: "rgba(65, 112, 88, 0.92)",
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
    id: "earliest-evidence-of-life",
    label: "Earliest evidence of life on Earth",
    shortLabel: "Earliest Life",
    year: -3_500_000_000,
    color: "rgba(72, 126, 92, 0.92)",
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