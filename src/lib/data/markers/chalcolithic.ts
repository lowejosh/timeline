import type { TimelineMarker } from "../timelineTypes";

export const CHALCOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "irrigation-reshapes-southern-mesopotamia",
    label: "Irrigation reshapes southern Mesopotamia",
    shortLabel: "Irrigation",
    year: -4_000,
    regionalScopeLabel: "Southern Mesopotamia",
    approximate: true,
    color: "rgba(104, 132, 108, 0.94)",
    minZoom: 19,
    priority: 70,
    sourceRefs: [
      {
        sourceId: "britannicaMesopotamia",
        note: "Britannica says agriculture in Mesopotamia itself developed only after artificial irrigation was invented and that the south overtook the north by about 4000 BCE; the app uses c. 4000 BCE as a concise threshold for canal-based transformation in southern Mesopotamia.",
      },
    ],
  },
  {
    id: "wheeled-transport-appears-in-sumer",
    label: "Wheeled transport appears in Sumer",
    shortLabel: "Wheel",
    year: -3_500,
    regionalScopeLabel: "Sumer",
    approximate: true,
    color: "rgba(126, 107, 79, 0.94)",
    minZoom: 19,
    priority: 76,
    sourceRefs: [
      {
        sourceId: "britannicaWheel",
        note: "Britannica says a Sumerian Erech pictograph dated about 3500 BC shows a sledge equipped with wheels; the app uses c. 3500 BCE as a clean marker for wheeled transport in Sumer.",
      },
    ],
  },
  {
    id: "uruk-becomes-the-first-city",
    label: "Uruk becomes the first city",
    shortLabel: "Uruk",
    year: -3_200,
    regionalScopeLabel: "Southern Mesopotamia",
    approximate: true,
    color: "rgba(136, 101, 90, 0.94)",
    minZoom: 19,
    priority: 82,
    sourceRefs: [
      {
        sourceId: "metUrukFirstCity",
        note: "The Met's Uruk essay says that by around 3200 B.C. Uruk was the largest settlement in southern Mesopotamia, if not the world, and a true city; the app uses c. 3200 BCE as its urban threshold marker.",
      },
      {
        sourceId: "britannicaErech",
        note: "Britannica says urban life in the Erech–Jamdat Nasr period (c. 3500–2900 BCE) is more fully illustrated at Uruk than at any other Mesopotamian city, supporting this marker's Uruk-centered urbanization framing.",
      },
    ],
  },
];