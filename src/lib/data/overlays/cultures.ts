import type { TimelineOverlayBand } from "../timelineTypes";
import { bce } from "../timelineDateBuilders";

export const CULTURE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "natufian-culture",
    label: "Natufian",
    description:
      "Semi-sedentary Levantine foragers with stone-built hamlets, food storage, wild-cereal harvesting, and some of the clearest steps toward farming.",
    startYear: bce(12_500),
    endYear: bce(9_500),
    regionalScopeLabel: "Levant",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(154, 120, 88)",
    priority: 76,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "natufianCultureWikipedia",
        note: "Uses the page's conventional 12,500–9,500 BCE range for a broad public-facing Natufian band.",
      },
      {
        sourceId: "metPrehistoricArt",
        note: "Supports a museum-grade framing of Natufian communities at ʿAin Mallaha / Eynan as settled hunter-gatherers near the transition to agriculture.",
      },
    ],
  },
  {
    id: "pre-pottery-neolithic-a",
    label: "PPNA",
    description:
      "Early Near Eastern village horizon of round houses, granaries, cultivation experiments, and communal building before pottery.",
    startYear: bce(10_000),
    endYear: bce(8_800),
    regionalScopeLabel: "Levant and Upper Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(162, 130, 92)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "prePotteryNeolithicAWikipedia",
        note: "Uses the conventional c. 10,000–8,800 BCE span for PPNA and its association with early granaries, small mud-brick settlements, and pre-domestication cultivation.",
      },
    ],
  },
  {
    id: "pre-pottery-neolithic-b",
    label: "PPNB",
    description:
      "Larger farming communities of the Fertile Crescent with rectilinear houses, plastered floors, herding, and ancestor-focused ritual practices.",
    startYear: bce(8_800),
    endYear: bce(6_500),
    regionalScopeLabel: "Levant and Upper Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(149, 123, 96)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "prePotteryNeolithicBWikipedia",
        note: "Uses the conventional c. 8,800–6,500 BCE span for PPNB and its stronger evidence for herding, rectilinear architecture, plastered floors, and settled farming life.",
      },
    ],
  },
  {
    id: "halaf-culture",
    label: "Halaf",
    description:
      "Northern Mesopotamian village culture known for fine painted pottery, tholoi, and the regional traditions that blend into the Ubaid horizon.",
    startYear: bce(6_100),
    endYear: bce(5_100),
    regionalScopeLabel: "Upper Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(139, 114, 92)",
    priority: 74,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "halafCultureWikipedia",
        note: "Uses the conventional c. 6,100–5,100 BCE Halaf range and its role as a northern village tradition that transitions into Ubaid-linked material culture.",
      },
    ],
  },
  {
    id: "ubaid-period",
    label: "Ubaid",
    description:
      "Southern Mesopotamian village-and-temple world of irrigation, larger settlements, and the long pre-urban buildup before Uruk and Sumerian cities.",
    startYear: bce(5_500),
    endYear: bce(3_800),
    regionalScopeLabel: "Southern Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(134, 126, 98)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "ubaidPeriodWikipedia",
        note: "Uses a southern-Mesopotamian c. 5,500–3,800 BCE Ubaid framing for the irrigation-and-temple precursor world before Uruk urbanism.",
      },
    ],
  },
];
