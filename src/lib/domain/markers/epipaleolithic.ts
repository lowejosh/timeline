import type { TimelineMarker } from "../../core/timelineTypes";
import { bce } from "../timelineDateBuilders";

export const EPIPALEOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "natufian-settled-hunter-gatherers-at-eynan",
    label: "Natufian settled hunter-gatherers at Eynan",
    shortLabel: "Eynan",
    description:
      "At Eynan, Natufian people lived as settled hunters and gatherers, showing village life before full farming economies took hold.",
    year: bce(9000),
    regionalScopeLabel: "Levant",
    approximate: true,
    minZoom: 19,
    priority: 72,
    sourceRefs: [
      {
        sourceId: "metPrehistoricArt",
        note: "The Met's prehistoric-art introduction says Eynan/Ain Mallaha in the Levant was occupied around 10,000–8000 B.C. by the Natufian culture of settled hunters and gatherers; the app uses c. 10,000 BCE as a clear Epipaleolithic anchor.",
      },
    ],
  },
];
