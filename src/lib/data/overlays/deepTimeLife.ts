import type { TimelineOverlayBand } from "../timelineTypes";

const DEEP_TIME_LIFE_GROUP_ID = "deep-time-life";

export const DEEP_TIME_LIFE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "cambrian-explosion",
    label: "Cambrian explosion",
    shortLabel: "Cambrian Explosion",
    startYear: -570_000_000,
    endYear: -530_000_000,
    color: "rgba(82, 136, 138, 0.56)",
    minZoom: 0,
    priority: 86,
    groupId: DEEP_TIME_LIFE_GROUP_ID,
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
    startYear: -201_400_000,
    endYear: -66_000_000,
    color: "rgba(136, 104, 76, 0.58)",
    minZoom: 0,
    priority: 88,
    groupId: DEEP_TIME_LIFE_GROUP_ID,
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