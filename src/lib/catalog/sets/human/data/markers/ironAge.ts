import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { bce } from "@/lib/core/timelineDateBuilders";

export const IRON_AGE_MARKERS: TimelineMarker[] = [
  {
    id: "battle-of-qarqar",
    label: "Battle of Qarqar",
    shortLabel: "Qarqar",
    description:
      "A Levantine coalition met Shalmaneser III at Qarqar in 853 BC, temporarily halting the Assyrian advance.",
    year: bce(853),
    regionalScopeLabel: "Levant",
    minZoom: 18,
    priority: 77,
    sourceIds: ["battleOfQarqarWikipedia"],
  },
  {
    id: "first-olympic-games-recorded",
    label: "First Olympic Games recorded",
    shortLabel: "Olympics Recorded",
    description:
      "The first Olympic champion listed in the records was Coroebus of Elis, who won the sprint race in 776 BCE.",
    year: bce(776),
    regionalScopeLabel: "Greece",
    minZoom: 18,
    priority: 76,
    sourceIds: ["britannicaOlympicGames"],
  },
  {
    id: "nineveh-falls",
    label: "Nineveh falls",
    shortLabel: "Nineveh Falls",
    description:
      "Median and Babylonian forces took Nineveh in 612 BCE, marking the climactic defeat of the Neo-Assyrian Empire.",
    year: bce(612),
    regionalScopeLabel: "Mesopotamia",
    minZoom: 18,
    priority: 79,
    sourceIds: ["fallOfNinevehWikipedia"],
  },
  {
    id: "siege-of-jerusalem",
    label: "Jerusalem falls to Babylon",
    shortLabel: "Jerusalem Falls",
    description:
      "Babylonian forces captured Jerusalem in 587 BC, destroyed the Temple, and carried much of Judah's elite into exile.",
    year: bce(587),
    regionalScopeLabel: "Levant",
    minZoom: 18,
    priority: 78,
    sourceIds: ["siegeOfJerusalem587Wikipedia"],
  },
  {
    id: "cyrus-captures-babylon",
    label: "Cyrus captures Babylon",
    shortLabel: "Babylon Captured",
    description:
      "Cyrus conquered Babylon in 539 B.C., ending the Neo-Babylonian Empire and extending Persian rule across Mesopotamia.",
    year: bce(539),
    regionalScopeLabel: "Mesopotamia",
    minZoom: 18,
    priority: 80,
    sourceIds: ["historyPersianEmpire"],
  },
];
