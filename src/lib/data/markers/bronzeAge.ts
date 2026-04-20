import type { TimelineMarker } from "../timelineTypes";
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
    sourceRefs: [
      {
        sourceId: "britannicaMesopotamia",
        note: "Britannica places Mesopotamia's writing threshold in the late 4th millennium BCE; the app uses c. 3200 BCE as a clean public-facing anchor for the emergence of cuneiform.",
      },
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica credits the Sumerians with the first system of writing, cuneiform, supporting this marker's broad Sumerian-Mesopotamian framing.",
      },
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
    priority: 78,
    sourceRefs: [
      {
        sourceId: "worldHistoryGreatPyramidGiza",
        note: "World History Encyclopedia uses the familiar c. 2560 BCE completion date for Khufu's pyramid, which the app uses here as a single marker year.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaAkkad",
        note: "Britannica says Sargon founded Agade about 2300 BCE, united the region's city-states, and extended rule across much of Mesopotamia; the app uses c. 2300 BCE as a clean imperial threshold.",
      },
    ],
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
    sourceRefs: [
      {
        sourceId: "britannicaHammurabi",
        note: "Britannica dates Hammurabi's reign to c. 1792–1750 BCE and identifies his surviving laws as his best-known legacy; the app uses c. 1750 BCE as a concise end-of-reign marker for that legal monument.",
      },
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica says Hammurabi forged Babylon into a great empire and promulgated his famous code of law, supporting this marker's Babylonian framing.",
      },
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
    sourceRefs: [
      {
        sourceId: "unescoYinXu",
        note: "UNESCO dates Yin Xu to around 1300 BCE and identifies its oracle bones as the earliest known mature Chinese writing, which the app uses as this marker's anchor.",
      },
    ],
  },
];
