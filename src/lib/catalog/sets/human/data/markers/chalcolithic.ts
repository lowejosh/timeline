import type { TimelineMarker } from "../../../../../core/timelineTypes";
import { bce } from "../../../../../core/timelineDateBuilders";

export const CHALCOLITHIC_MARKERS: TimelineMarker[] = [
  {
    id: "canal-irrigation-appears-at-choga-mami",
    label: "Canal irrigation appears at Choga Mami",
    shortLabel: "Irrigation",
    description:
      "Choga Mami shows canal irrigation already in operation, with man-made channels watering fields in lowland Mesopotamia.",
    year: bce(6_000),
    regionalScopeLabel: "Mesopotamia",
    approximate: true,
    minZoom: 19,
    priority: 70,
    sourceIds: ["chogaMamiWikipedia", "originsOfAgricultureInWestAsiaWikipedia"],
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
    sourceIds: ["britannicaWheel"],
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
  //   sourceIds: ["metUrukFirstCity", "britannicaErech"],
  // },
];
