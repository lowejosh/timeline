import type { TimelineOverlayBand } from "../timelineTypes";

const MESOPOTAMIA_SUB_BANDS: TimelineOverlayBand[] = [
  {
    id: "sumerian-city-states",
    label: "Sumerian city-states",
    shortLabel: "Sumer",
    description:
      "Broad early-urban Sumerian phase spanning the first city-states of southern Mesopotamia before Akkadian imperial unification.",
    startYear: -3_500,
    endYear: -2_334,
    color: "rgb(202, 156, 105)",
    sourceRefs: [
      {
        sourceId: "britannicaMesopotamia",
        note: "Britannica treats the late 4th millennium BCE as Mesopotamia's early urban and writing threshold; the app uses that broader framing for a public-facing Sumerian city-state band.",
      },
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica describes Sumer as the southeastern half of pre-Babylonian southern Mesopotamia before Babylon's rise to political prominence.",
      },
    ],
  },
  {
    id: "akkadian-empire",
    label: "Akkadian Empire",
    shortLabel: "Akkad",
    description:
      "The first large Mesopotamian empire built by Sargon of Akkad and his successors.",
    startYear: -2_334,
    endYear: -2_154,
    color: "rgb(190, 120, 92)",
    sourceRefs: [
      {
        sourceId: "britannicaAkkad",
        note: "Britannica says Sargon founded Agade about 2300 BCE, united the city-states, and that his dynasty fell about 2150 BCE; the app uses the standard conventional span of c. 2334–2154 BCE for the Akkadian Empire.",
      },
    ],
  },
  {
    id: "old-babylonian-empire",
    label: "Old Babylonian Empire",
    shortLabel: "Babylon",
    description:
      "The Amorite-era Babylonian kingdom best known for Hammurabi's reign and laws.",
    startYear: -1_894,
    endYear: -1_595,
    color: "rgb(168, 132, 88)",
    sourceRefs: [
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica says Babylon rose to political prominence around 1850 BCE under Amorite rule and that this phase lasted until 1600 BCE; the app uses the conventional Old Babylonian span of 1894–1595 BCE.",
      },
      {
        sourceId: "britannicaHammurabi",
        note: "Supports the public-facing association of this Babylonian phase with Hammurabi's reign and legal legacy.",
      },
    ],
  },
  {
    id: "neo-assyrian-empire",
    label: "Neo-Assyrian Empire",
    shortLabel: "Assyria",
    description:
      "The late expansionist Assyrian superpower centered on cities such as Nineveh and Ashur.",
    startYear: -912,
    endYear: -612,
    color: "rgb(129, 106, 154)",
    sourceRefs: [
      {
        sourceId: "worldHistoryAssyria",
        note: "World History Encyclopedia identifies the Neo-Assyrian Empire as the late imperial phase from 912 to 612 BCE, the period most familiar in broad ancient-history surveys.",
      },
    ],
  },
  {
    id: "neo-babylonian-empire",
    label: "Neo-Babylonian Empire",
    shortLabel: "Neo-Babylon",
    description:
      "The final great independent Babylonian phase before the Persian conquest.",
    startYear: -626,
    endYear: -539,
    color: "rgb(153, 114, 172)",
    sourceRefs: [
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica describes the last and greatest period of Babylonian supremacy under Nabopolassar and Nebuchadnezzar II, ending when Cyrus captured Babylonia in 539 BCE; the app uses the conventional Neo-Babylonian span of 626–539 BCE.",
      },
    ],
  },
];

export const ANCIENT_CIVILIZATION_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "mesopotamia",
    label: "Mesopotamia",
    description:
      "Umbrella band for the long arc of Mesopotamian civilization, from early Sumerian cities to the Persian conquest of Babylon.",
    startYear: -3_500,
    endYear: -539,
    color: "rgb(180, 120, 70)",
    minZoom: 0,
    priority: 95,
    groupId: "ancient-civilizations",
    children: MESOPOTAMIA_SUB_BANDS,
    sourceRefs: [
      {
        sourceId: "britannicaMesopotamia",
        note: "Broad app overlay spanning the rise of urban Mesopotamian civilization through the Achaemenid conquest of Babylon.",
      },
    ],
  },
  {
    id: "indus-valley-civilization",
    label: "Indus Valley Civilization",
    shortLabel: "Indus Valley",
    startYear: -3_300,
    endYear: -1_300,
    color: "rgb(107, 136, 166)",
    minZoom: 0,
    priority: 90,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaIndusCivilization",
        note: "Uses the broad Harappan-era span commonly summarized in world-history overviews.",
      },
    ],
  },
  {
    id: "ancient-egypt",
    label: "Ancient Egypt",
    startYear: -3_100,
    endYear: -30,
    color: "rgb(166, 149, 94)",
    minZoom: 0,
    priority: 92,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaAncientEgypt",
        note: "Uses the conventional span from early dynastic unification to the Roman annexation of Egypt.",
      },
    ],
  },
  {
    id: "hittite-empire",
    label: "Hittite Empire",
    shortLabel: "Hittites",
    description:
      "An Anatolian Bronze Age great power centered on Hattusa and active across northern Syria.",
    startYear: -1_650,
    endYear: -1_180,
    color: "rgb(157, 106, 126)",
    minZoom: 0,
    priority: 89,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaHittiteEmpire",
        note: "Britannica summarizes the Hittite Empire as c. 1650–1180 BCE, which the app uses directly for this Bronze Age overlay.",
      },
    ],
  },
  {
    id: "mycenaean-greece",
    label: "Mycenaean Greece",
    shortLabel: "Mycenae",
    description:
      "Late Bronze Age palatial Greece before the post-Mycenaean transition usually used to open ancient Greece surveys.",
    startYear: -1_600,
    endYear: -1_100,
    color: "rgb(118, 132, 186)",
    minZoom: 0,
    priority: 88,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "unescoMycenaeTiryns",
        note: "UNESCO says Mycenaean civilization spread around the Mediterranean between 1600 and 1100 BCE; the app uses that broad span for a clean Late Bronze Age Greek band.",
      },
    ],
  },
  {
    id: "ancient-greece",
    label: "Ancient Greece",
    startYear: -1_200,
    endYear: -323,
    color: "rgb(93, 119, 183)",
    minZoom: 0,
    priority: 88,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaAncientGreece",
        note: "Uses Britannica's broad framing from the end of Mycenaean civilization around 1200 BCE to the death of Alexander the Great in 323 BCE.",
      },
    ],
  },
  {
    id: "achaemenid-persia",
    label: "Achaemenid Persia",
    shortLabel: "Achaemenids",
    startYear: -550,
    endYear: -330,
    color: "rgb(135, 92, 142)",
    minZoom: 0,
    priority: 86,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "historyPersianEmpire",
        note: "Uses the rise of Cyrus the Great in 550 BCE through Alexander's conquest in 330 BCE for a clean Achaemenid-era band.",
      },
    ],
  },
  {
    id: "roman-republic",
    label: "Roman Republic",
    startYear: -509,
    endYear: -27,
    color: "rgb(159, 91, 70)",
    minZoom: 0,
    priority: 84,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "Uses the standard Roman Republic span from the overthrow of the monarchy in 509 BCE to Augustus' settlement in 27 BCE.",
      },
      {
        sourceId: "khanRomanRepublic",
        note: "Supports the conventional 509 BCE republican starting point used in world-history surveys.",
      },
    ],
  },
  {
    id: "hellenistic-world",
    label: "Hellenistic World",
    shortLabel: "Hellenistic",
    startYear: -323,
    endYear: -30,
    color: "rgb(87, 142, 166)",
    minZoom: 0,
    priority: 82,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaHellenisticAge",
        note: "Uses Britannica's 323 BCE to 30 BCE span from Alexander's death to Rome's conquest of Egypt.",
      },
    ],
  },
  {
    id: "han-china",
    label: "Han China",
    shortLabel: "Han",
    startYear: -206,
    endYear: 220,
    color: "rgb(72, 132, 108)",
    minZoom: 0,
    priority: 80,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "britannicaHanDynasty",
        note: "Uses the standard Han dynasty span of 206 BCE to 220 CE as a concise band for Han-era China.",
      },
    ],
  },
  {
    id: "roman-empire",
    label: "Roman Empire",
    startYear: -27,
    endYear: 476,
    color: "rgb(136, 78, 64)",
    minZoom: 0,
    priority: 78,
    groupId: "ancient-civilizations",
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "Uses Augustus' accession in 27 BCE and the fall of the western empire in 476 CE for a compact public-timeline band; eastern Roman continuity continues beyond this endpoint.",
      },
      {
        sourceId: "khanRomanEmpire",
        note: "Supports the conventional imperial start in 27 BCE under Augustus.",
      },
    ],
  },
];
