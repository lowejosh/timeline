import type { TimelineMarker } from "../timelineTypes";
import { bce } from "../timelineDateBuilders";

export const CHALCOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "canal-irrigation-appears-at-choga-mami",
    label: "Canal irrigation appears at Choga Mami",
    shortLabel: "Irrigation",
    description:
      "Around 6000 BCE, Choga Mami shows canal irrigation already in operation, with man-made channels watering fields in lowland Mesopotamia.",
    year: bce(6_000),
    regionalScopeLabel: "Mesopotamia",
    approximate: true,
    minZoom: 19,
    priority: 70,
    sourceRefs: [
      {
        sourceId: "chogaMamiWikipedia",
        note: "The page explicitly says Choga Mami shows the first canal irrigation in operation around 6000 BCE; the marker now uses that source-stated date and site rather than a later inferred threshold.",
      },
      {
        sourceId: "originsOfAgricultureInWestAsiaWikipedia",
        note: "The page says irrigation is only attested with certainty at the end of the Neolithic in central Mesopotamia at Choga Mami, c. 5900 BC, and that it spread in the 6th millennium BC on a modest scale.",
      },
    ],
  },
  {
    id: "wheeled-transport-appears-in-sumer",
    label: "Wheeled transport appears in Sumer",
    shortLabel: "Wheel",
    year: bce(3_500),
    regionalScopeLabel: "Sumer",
    approximate: true,
    minZoom: 19,
    priority: 76,
    sourceRefs: [
      {
        sourceId: "britannicaWheel",
        note: "Britannica says a Sumerian Erech pictograph dated about 3500 BC shows a sledge equipped with wheels; the app uses c. 3500 BCE as a clean marker for wheeled transport in Sumer.",
      },
    ],
  },
  // {
  //   id: "uruk-becomes-the-first-city",
  //   label: "Uruk becomes the first city",
  //   shortLabel: "Uruk",
  //   year: bce(3_200),
  //   regionalScopeLabel: "Southern Mesopotamia",
  //   approximate: true,
  //   minZoom: 19,
  //   priority: 82,
  //   sourceRefs: [
  //     {
  //       sourceId: "metUrukFirstCity",
  //       note: "The Met's Uruk essay says that by around 3200 B.C. Uruk was the largest settlement in southern Mesopotamia, if not the world, and a true city; the app uses c. 3200 BCE as its urban threshold marker.",
  //     },
  //     {
  //       sourceId: "britannicaErech",
  //       note: "Britannica says urban life in the Erech–Jamdat Nasr period (c. 3500–2900 BCE) is more fully illustrated at Uruk than at any other Mesopotamian city, supporting this marker's Uruk-centered urbanization framing.",
  //     },
  //   ],
  // },
];
