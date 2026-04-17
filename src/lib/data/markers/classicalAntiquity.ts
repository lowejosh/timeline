import type { TimelineMarker } from "../timelineTypes";
import { bce } from "../timelineDateBuilders";

export const CLASSICAL_ANTIQUITY_MARKERS: TimelineMarker[] = [
  {
    id: "alexander-dies-hellenistic-age-begins",
    label: "Alexander the Great dies",
    shortLabel: "Alexander Dies",
    year: bce(323),
    minZoom: 18,
    priority: 76,
    sourceRefs: [
      {
        sourceId: "historyAlexanderGreat",
        note: "HISTORY notes that the period from Alexander's death to 31 BCE came to be known as the Hellenistic period; the app uses Alexander's death in 323 BCE as the clearer event label for that transition.",
      },
      {
        sourceId: "britannicaHellenisticAge",
        note: "Supports 323 BCE as the conventional opening of the Hellenistic age after Alexander's death.",
      },
    ],
  },
  {
    id: "caesar-crosses-the-rubicon",
    label: "Caesar crosses the Rubicon",
    shortLabel: "Rubicon",
    year: bce(49),
    minZoom: 19,
    priority: 74,
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates Caesar's crossing of the Rubicon to 49 BCE, when his invasion of Italy ignited the civil war that ended the Roman Republic.",
      },
    ],
  },
];
