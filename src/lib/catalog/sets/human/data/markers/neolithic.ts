import type { TimelineMarker } from "@/lib/core/timelineTypes";
import { bce } from "@/lib/core/timelineDateBuilders";

export const NEOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "mehrgarh-early-farming-community",
    label: "Mehrgarh early farming community",
    shortLabel: "Mehrgarh",
    description:
      "Mehrgarh was an early farming settlement of mud-brick houses, domesticated animals, and cultivated wheat and barley in South Asia.",
    year: bce(8_000),
    regionalScopeLabel: "South Asia",
    approximate: true,
    minZoom: 19,
    priority: 74,
    sourceIds: ["britannicaMehrgarh"],
  },
  {
    id: "jiahu-bone-flutes-and-village-life",
    label: "Jiahu bone flutes and village life",
    shortLabel: "Jiahu",
    description:
      "Jiahu preserves a flourishing Neolithic village, including houses, pottery kilns, tools, and some of the world's earliest bone flutes.",
    year: bce(7_000),
    regionalScopeLabel: "North China",
    approximate: true,
    minZoom: 19,
    priority: 73,
    sourceIds: ["metJiahu"],
  },
];
