import type { TimelineOverlayBand } from "../timelineTypes";
import { yearsAgo } from "../timelineDateBuilders";

export const DEEP_TIME_LIFE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "cambrian-explosion",
    label: "Cambrian explosion",
    shortLabel: "Cambrian Explosion",
    description:
      "A rapid burst of marine evolution in which most major animal lineages first appear in the fossil record, many with striking new body plans.",
    startYear: yearsAgo(570_000_000),
    endYear: yearsAgo(530_000_000),
    color: "rgb(82, 136, 138)",
    minZoom: 0,
    priority: 86,
    sourceRefs: [
      {
        sourceId: "berkeleyCambrianExplosion",
        note: "Understanding Evolution describes the Cambrian explosion as an evolutionary burst from about 570 to 530 million years ago in which many major animal lineages got their starts.",
      },
    ],
  },
  {
    id: "age-of-dinosaurs",
    label: "Age of Dinosaurs",
    shortLabel: "Dinosaurs",
    description:
      "Dinosaurs and other archosaurs dominated life on land through most of the Mesozoic, while early birds and mammals emerged in their shadow.",
    startYear: yearsAgo(201_400_000),
    endYear: yearsAgo(66_000_000),
    color: "rgb(136, 104, 76)",
    minZoom: 0,
    priority: 88,
    sourceRefs: [
      {
        sourceId: "ucmpMesozoicLife",
        note: "UCMP summarizes Mesozoic terrestrial life by noting that dinosaurs and other archosaurs dominated the land biota; the app uses a broad post-end-Triassic to end-Cretaceous band for that familiar public-facing phase.",
      },
      {
        sourceId: "smithsonianExtinctionOverTime",
        note: "The band ends at the 66 million-year-old end-Cretaceous mass extinction, when all non-avian dinosaurs disappeared.",
      },
      {
        sourceId: "icsChart2024",
        note: "Band start is aligned to the app's Jurassic threshold for a clean system-level transition after the end-Triassic extinction interval.",
      },
    ],
  },
];
