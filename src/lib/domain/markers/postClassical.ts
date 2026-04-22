import type { TimelineMarker } from "../../core/timelineTypes";
import { ce } from "../timelineDateBuilders";

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
    sourceRefs: [
      {
        sourceId: "historyCrusades",
        note: "HISTORY marks the beginning of the Crusades at Pope Urban II's call at Clermont in November 1095; the app uses that decision point rather than the 1096 departures.",
      },
    ],
  },
];
