import type { TimelineMarker } from "../../core/timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const CORE_TIMELINE_MARKERS: TimelineMarker[] = [
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
