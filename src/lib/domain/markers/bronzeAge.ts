import type { TimelineMarker } from "../../core/timelineTypes";
import { bce } from "../timelineDateBuilders";

export const BRONZE_AGE_MARKERS: TimelineMarker[] = [
  {
    id: "cuneiform-writing-emerges",
    label: "Cuneiform writing emerges",
    shortLabel: "Cuneiform",
    description:
      "In southern Mesopotamia, scribes began pressing wedge-shaped signs into clay tablets, creating the earliest known cuneiform writing system.",
    year: bce(3_200),
    regionalScopeLabel: "Mesopotamia",
    approximate: true,
    minZoom: 18,
    priority: 79,
    sourceIds: [
      "britannicaMesopotamia",
      "britannicaBabylonia"
    ],
  },
  {
    id: "great-pyramid-of-giza-completed",
    label: "Great Pyramid of Giza completed",
    shortLabel: "Great Pyramid",
    description:
      "Khufu's pyramid at Giza stood as Egypt's grandest royal tomb and remained the tallest human-made structure for more than 3,000 years.",
    year: bce(2_560),
    regionalScopeLabel: "Ancient Egypt",
    approximate: true,
    minZoom: 18,
    priority: 83,
    sourceIds: ["worldHistoryGreatPyramidGiza"],
  },
  {
    id: "sargon-of-akkad-builds-an-empire",
    label: "Sargon of Akkad builds an empire",
    shortLabel: "Sargon's Empire",
    description:
      "Sargon founded Agade, united rival city-states, and extended Akkadian rule across much of Mesopotamia.",
    year: bce(2_300),
    regionalScopeLabel: "Mesopotamia",
    approximate: true,
    minZoom: 18,
    priority: 80,
    sourceIds: ["britannicaAkkad"],
  },
  {
    id: "hammurabi-promulgates-his-laws",
    label: "Hammurabi promulgates his laws",
    shortLabel: "Hammurabi's Laws",
    description:
      "Babylon's best-known ruler is remembered for the famous body of laws associated with his reign and his expansion of Babylonian power.",
    year: bce(1_750),
    regionalScopeLabel: "Babylonia",
    approximate: true,
    minZoom: 18,
    priority: 81,
    sourceIds: [
      "britannicaHammurabi",
      "britannicaBabylonia"
    ],
  },
  {
    id: "earliest-attested-chinese-writing",
    label: "Earliest attested Chinese writing",
    shortLabel: "Chinese Writing",
    description:
      "Oracle bone inscriptions from Yin Xu preserve the earliest known mature Chinese writing and illuminate the late Shang court.",
    year: bce(1_300),
    regionalScopeLabel: "North China",
    approximate: true,
    minZoom: 18,
    priority: 77,
    sourceIds: ["unescoYinXu"],
  },
];
