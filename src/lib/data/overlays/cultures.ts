import type { TimelineOverlayBand } from "../timelineTypes";
import { bce, yearsAgo } from "../timelineDateBuilders";

export const CULTURE_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "natufian-culture",
    label: "Natufian",
    description:
      "Semi-sedentary Levantine foragers with stone-built hamlets, food storage, wild-cereal harvesting, and some of the clearest steps toward farming.",
    startYear: yearsAgo(15_000),
    endYear: yearsAgo(11_500),
    regionalScopeLabel: "Levant",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(154, 120, 88)",
    priority: 76,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "natufianCultureWikipedia",
        note: "Uses the page's primary 15,000–11,500 BP framing for a broad public-facing Natufian band, so this overlay is expressed with yearsAgo(...) rather than BCE dates.",
      },
      {
        sourceId: "metPrehistoricArt",
        note: "Supports a museum-grade framing of Natufian communities at ʿAin Mallaha / Eynan as settled hunter-gatherers near the transition to agriculture.",
      },
    ],
  },
  {
    id: "khiamian-culture",
    label: "Khiamian",
    description:
      "Earliest named village culture after the Natufian, marked by El Khiam points, ground-level houses, and some of the first cultivation experiments in Southwest Asia.",
    startYear: bce(9_700),
    endYear: bce(8_650),
    regionalScopeLabel: "Levant and Middle Euphrates",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(162, 130, 92)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "khiamianCultureWikipedia",
        note: "Uses the page's explicit c. 9700–8650 BC Khiamian span and its emphasis on El Khiam points, early ground-level houses, and experimental cultivation before fully established farming villages.",
      },
    ],
  },
  {
    id: "mureybetian-culture",
    label: "Mureybetian",
    description:
      "Middle Euphrates village tradition of round and rectangular buildings, storage rooms, cereal cultivation, and communal architecture pushing the Neolithic deeper toward northern Mesopotamia.",
    startYear: bce(9_300),
    endYear: bce(8_600),
    regionalScopeLabel: "Middle Euphrates",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(149, 123, 96)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "mureybetWikipedia",
        note: "Uses the page's explicit 9300–8600 BC Mureybetian span and its description of rectangular buildings, storage spaces, cereal cultivation, and communal structures in the Middle Euphrates.",
      },
    ],
  },
  {
    id: "cayonu-tepesi",
    label: "Çayönü",
    description:
      "Upper Tigris PPNB settlement with changing house plans, early cereal farming, and some of the clearest evidence for pig domestication in northern Mesopotamia.",
    startYear: bce(8_630),
    endYear: bce(6_800),
    regionalScopeLabel: "Upper Tigris",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(145, 117, 91)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "cayonuWikipedia",
        note: "Uses the page's explicit c. 8630–6800 BC range for Çayönü Tepesi and its public-facing emphasis on Upper Mesopotamian architecture, cereal cultivation, and early pig domestication.",
      },
    ],
  },
  {
    id: "nevali-cori",
    label: "Nevalı Çori",
    description:
      "Middle Euphrates PPNB site of channeled houses, a cult building with monolithic pillars, and some of the earliest large-scale sculpture in the Neolithic world.",
    startYear: bce(8_400),
    endYear: bce(8_100),
    regionalScopeLabel: "Middle Euphrates",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(143, 116, 94)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "nevaliCoriWikipedia",
        note: "Uses the page's explicit 8400–8100 BC Nevalı Çori range and its description of channeled-house architecture, cult buildings with monolithic pillars, and very early monumental sculpture.",
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
    id: "samarra-culture",
    label: "Samarra",
    description:
      "Late Neolithic middle-Tigris culture known for fine painted pottery, irrigation at Tell es-Sawwan, and increasingly organized settled life before full Ubaid dominance.",
    startYear: bce(5_500),
    endYear: bce(4_800),
    regionalScopeLabel: "Northern Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(136, 118, 90)",
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "samarraCultureWikipedia",
        note: "Uses the page's explicit c. 5500–4800 BCE Samarra range and its emphasis on fine painted pottery, irrigation at Tell es-Sawwan, and Samarran culture as a precursor to Ubaid Mesopotamia.",
      },
    ],
  },
  {
    id: "ubaid-period",
    label: "Ubaid",
    description:
      "Southern Mesopotamian period of the earliest known settlements on the alluvial plain before the Uruk period.",
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
        note: "Uses the page's explicit southern-Mesopotamian span of about 5500–3800 BC and its statement that the Ubaid is succeeded there by the Uruk period.",
      },
    ],
  },
];
