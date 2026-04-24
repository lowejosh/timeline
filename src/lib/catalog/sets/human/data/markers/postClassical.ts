import type { TimelineMarker } from "../../../../../core/timelineTypes";
import { ce } from "../../../../../core/timelineDateBuilders";

export const POST_CLASSICAL_MARKERS: TimelineMarker[] = [
  {
    id: "first-crusade-called",
    label: "First Crusade called",
    shortLabel: "First Crusade",
    description:
      "At Clermont in 1095, Pope Urban II called on western Christians to aid Byzantium and launch the First Crusade.",
    year: ce(1095),
    minZoom: 18,
    priority: 74,
    sourceIds: ["historyCrusades"],
  },
];
