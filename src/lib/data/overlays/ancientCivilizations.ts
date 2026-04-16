import type { TimelineOverlayBand } from "../timelineTypes";

const MESOPOTAMIA_SUB_BANDS: TimelineOverlayBand[] = [
  {
    id: "sumerian-city-states",
    label: "Sumerian city-states",
    shortLabel: "Sumer",
    description:
      "Early civilization of southern Mesopotamia organized around independent city-states such as Uruk, Ur, and Lagash.",
    startYear: -3_500,
    endYear: -2_334,
    regionalScopeLabel: "Southern Mesopotamia",
    approximateStart: true,
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
    regionalScopeLabel: "Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(190, 120, 92)",
    sourceRefs: [
      {
        sourceId: "britannicaAkkad",
        note: "Britannica says Sargon founded Agade about 2300 BCE, united the city-states, and that his dynasty fell about 2150 BCE; the app uses the standard conventional span of c. 2334–2154 BCE for the Akkadian Empire.",
      },
    ],
  },
  {
    id: "ur-iii-empire",
    label: "Ur III Empire",
    shortLabel: "Ur III",
    description:
      "Neo-Sumerian kingdom centered on Ur, known for restoring centralized rule in southern Mesopotamia after the Akkadian collapse.",
    startYear: -2_112,
    endYear: -2_004,
    regionalScopeLabel: "Southern Mesopotamia",
    color: "rgb(182, 144, 101)",
    sourceRefs: [
      {
        sourceId: "britannicaMesopotamia",
        note: "Britannica highlights the 3rd dynasty of Ur as a major Mesopotamian phase whose administrative system and influence carried into the first quarter of the 2nd millennium BCE.",
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
    regionalScopeLabel: "Babylonia",
    approximateStart: true,
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
    id: "kassite-babylonia",
    label: "Kassite Babylonia",
    shortLabel: "Kassites",
    description:
      "The long-lasting Kassite dynasty that ruled Babylonia after the Old Babylonian collapse and anchored much of southern Mesopotamia in the later Bronze Age.",
    startYear: -1_595,
    endYear: -1_155,
    regionalScopeLabel: "Babylonia",
    approximateEnd: true,
    color: "rgb(154, 126, 96)",
    sourceRefs: [
      {
        sourceId: "metBabylon",
        note: "The Met says the Old Babylonian period ended in 1595 BCE and that a new Kassite dynasty then emerged in Babylonia; the app uses the conventional Kassite span through 1155 BCE.",
      },
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica's broad Babylonia overview supports treating the Kassite centuries as a major intermediate Babylonian phase between Old and late Babylonian prominence.",
      },
    ],
  },
  {
    id: "middle-assyrian-empire",
    label: "Middle Assyrian Empire",
    shortLabel: "Mid Assyria",
    description:
      "Assyrian kingdom and expanding empire of the late second millennium BCE, centered in northern Mesopotamia.",
    startYear: -1_365,
    endYear: -1_050,
    regionalScopeLabel: "Northern Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(141, 118, 138)",
    sourceRefs: [
      {
        sourceId: "metAssyria",
        note: "The Met frames Assyria's revival from Ashur-uballit I in 1365 BCE, its expansion under Adad-nirari I and Tukulti-Ninurta I, and its territorial contraction by the end of the 2nd millennium BCE; the app uses a conventional c. 1365–1050 BCE span for this middle imperial phase.",
      },
      {
        sourceId: "worldHistoryAssyria",
        note: "World History Encyclopedia divides Assyria into older, middle, and neo-imperial phases and helps support a broad public-facing Middle Assyrian band before the Neo-Assyrian revival.",
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
    regionalScopeLabel: "Northern Mesopotamia",
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
    regionalScopeLabel: "Babylonia",
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
      "Ancient civilization of the Tigris-Euphrates river valley, home to some of the world's earliest cities, states, and writing systems.",
    startYear: -3_500,
    endYear: -539,
    regionalScopeLabel: "Mesopotamia",
    approximateStart: true,
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
    description:
      "Bronze Age civilization of South Asia with carefully planned cities, sophisticated drainage, and far-reaching trade.",
    startYear: -3_300,
    endYear: -1_300,
    regionalScopeLabel: "South Asia",
    approximateStart: true,
    approximateEnd: true,
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
    description:
      "Civilization of the Nile valley shaped by pharaohs, monumental building, and religious traditions that endured for millennia.",
    startYear: -3_100,
    endYear: -30,
    regionalScopeLabel: "Nile Valley",
    approximateStart: true,
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
    regionalScopeLabel: "Anatolia and northern Syria",
    approximateStart: true,
    approximateEnd: true,
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
      "Late Bronze Age civilization of mainland Greece centered on fortified palace kingdoms such as Mycenae and Tiryns.",
    startYear: -1_600,
    endYear: -1_100,
    regionalScopeLabel: "Mainland Greece",
    approximateStart: true,
    approximateEnd: true,
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
    description:
      "Greek civilization of city-states, philosophy, drama, and new ways of thinking about politics and citizenship.",
    startYear: -1_200,
    endYear: -323,
    regionalScopeLabel: "Aegean and eastern Mediterranean",
    approximateStart: true,
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
    description:
      "Vast empire founded by Cyrus the Great, bringing many peoples of the ancient Near East under Persian rule.",
    startYear: -550,
    endYear: -330,
    regionalScopeLabel: "Iranian Plateau and ancient Near East",
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
    description:
      "Roman state before the emperors, marked by the Senate, elected magistrates, and steady expansion across the Mediterranean.",
    startYear: -509,
    endYear: -27,
    regionalScopeLabel: "Mediterranean",
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
    description:
      "Age after Alexander when Greek culture mingled with Egyptian, Persian, and Asian traditions across a network of kingdoms.",
    startYear: -323,
    endYear: -30,
    regionalScopeLabel: "Eastern Mediterranean and Southwest Asia",
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
    description:
      "Chinese dynasty of strong imperial rule, expanding trade routes, and a flourishing Silk Road.",
    startYear: -206,
    endYear: 220,
    regionalScopeLabel: "China",
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
    description:
      "Mediterranean superpower built on law, roads, cities, and imperial rule, shaping surrounding regions for centuries.",
    startYear: -27,
    endYear: 476,
    regionalScopeLabel: "Mediterranean",
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
