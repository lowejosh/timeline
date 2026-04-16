import type { TimelineMarker } from "../timelineTypes";

export const NEOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "mehrgarh-early-farming-community",
    label: "Mehrgarh early farming community",
    shortLabel: "Mehrgarh",
    year: -8_000,
    regionalScopeLabel: "South Asia",
    approximate: true,
    minZoom: 19,
    priority: 74,
    sourceRefs: [
      {
        sourceId: "britannicaMehrgarh",
        note: "Britannica describes Mehrgarh as a Neolithic settlement from roughly 8000–5000 BCE with domesticated animals, wheat and barley cultivation, and permanent mud-brick homes; the app uses c. 8000 BCE as its earliest-farming-community anchor in South Asia.",
      },
    ],
  },
  {
    id: "jiahu-bone-flutes-and-village-life",
    label: "Jiahu bone flutes and village life",
    shortLabel: "Jiahu",
    year: -7_000,
    regionalScopeLabel: "North China",
    approximate: true,
    minZoom: 19,
    priority: 73,
    sourceRefs: [
      {
        sourceId: "metJiahu",
        note: "The Met dates Jiahu to ca. 7000–5700 B.C. and describes houses, kilns, pottery, tools, and bone flutes there as evidence of a flourishing complex Neolithic society; the app uses c. 7000 BCE as the marker anchor.",
      },
    ],
  },
];
