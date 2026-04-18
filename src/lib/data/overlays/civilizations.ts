import type { TimelineOverlayBand } from "../timelineTypes";
import { bce, ce } from "../timelineDateBuilders";

const POST_CLASSICAL_MIN_ZOOM = 15;

const MESOPOTAMIA_SUB_BANDS: TimelineOverlayBand[] = [
  {
    id: "sumerian-city-states",
    label: "Sumerian city-states",
    shortLabel: "Sumer",
    description:
      "Early civilization of southern Mesopotamia organized around independent city-states such as Uruk, Ur, and Lagash.",
    startYear: bce(3_500),
    endYear: bce(2_334),
    regionalScopeLabel: "Southern Mesopotamia",
    approximateStart: true,
    color: "rgb(202, 156, 105)",
    subGroup: "near-east",
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
    startYear: bce(2_334),
    endYear: bce(2_154),
    regionalScopeLabel: "Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(190, 120, 92)",
    subGroup: "near-east",
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
    startYear: bce(2_112),
    endYear: bce(2_004),
    regionalScopeLabel: "Southern Mesopotamia",
    color: "rgb(182, 144, 101)",
    subGroup: "near-east",
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
    startYear: bce(1_894),
    endYear: bce(1_595),
    regionalScopeLabel: "Babylonia",
    approximateStart: true,
    color: "rgb(168, 132, 88)",
    subGroup: "near-east",
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
    startYear: bce(1_595),
    endYear: bce(1_155),
    regionalScopeLabel: "Babylonia",
    approximateEnd: true,
    color: "rgb(154, 126, 96)",
    subGroup: "near-east",
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
    startYear: bce(1_365),
    endYear: bce(1_050),
    regionalScopeLabel: "Northern Mesopotamia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(141, 118, 138)",
    subGroup: "near-east",
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
    startYear: bce(912),
    endYear: bce(612),
    regionalScopeLabel: "Northern Mesopotamia",
    color: "rgb(129, 106, 154)",
    subGroup: "near-east",
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
    startYear: bce(626),
    endYear: bce(539),
    regionalScopeLabel: "Babylonia",
    color: "rgb(153, 114, 172)",
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "britannicaBabylonia",
        note: "Britannica describes the last and greatest period of Babylonian supremacy under Nabopolassar and Nebuchadnezzar II, ending when Cyrus captured Babylonia in 539 BCE; the app uses the conventional Neo-Babylonian span of 626–539 BCE.",
      },
    ],
  },
];

const CHINESE_CIVILIZATION_SUB_BANDS: TimelineOverlayBand[] = [
  {
    id: "shang-china",
    label: "Shang China",
    shortLabel: "Shang",
    description:
      "Bronze Age dynasty remembered for royal centers, ritual bronzes, and the earliest surviving Chinese writing on oracle bones.",
    startYear: bce(1_600),
    endYear: bce(1_046),
    regionalScopeLabel: "China",
    approximateStart: true,
    color: "rgb(146, 118, 88)",
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "shangDynastyWikipedia",
        note: "Uses the conventional c. 1600–1046 BCE Shang span for a broad early-dynastic band rather than the narrower late-Shang-only Yin Xu site chronology.",
      },
    ],
  },
  {
    id: "zhou-china",
    label: "Zhou China",
    shortLabel: "Zhou",
    description:
      "Dynasty that framed rule through the Mandate of Heaven and saw the intellectual ferment associated with Confucianism, Daoism, and Legalism.",
    startYear: bce(1_046),
    endYear: bce(256),
    regionalScopeLabel: "China",
    approximateStart: true,
    color: "rgb(124, 136, 91)",
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "zhouDynastyWikipedia",
        note: "Uses the conventional c. 1046–256 BCE Zhou span and the page's broad framing of the Mandate of Heaven and classical Chinese philosophical traditions.",
      },
    ],
  },
  {
    id: "qin-dynasty",
    label: "Qin Dynasty",
    shortLabel: "Qin",
    description:
      "Short-lived but transformative dynasty that first unified China and imposed shared systems of script, weights, measures, and law.",
    startYear: bce(221),
    endYear: bce(206),
    regionalScopeLabel: "China",
    color: "rgb(93, 126, 112)",
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "qinDynastyWikipedia",
        note: "Uses the Qin dynasty's 221–206 BCE span and the page's public-facing emphasis on imperial unification and standardization.",
      },
    ],
  },
  {
    id: "han-china",
    label: "Han China",
    shortLabel: "Han",
    description:
      "Imperial dynasty that consolidated the bureaucratic state, expanded long-distance exchange, and helped define lasting Han cultural identity.",
    startYear: bce(206),
    endYear: ce(220),
    regionalScopeLabel: "China",
    color: "rgb(72, 132, 108)",
    priority: 80,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "britannicaHanDynasty",
        note: "Uses the standard Han dynasty span of 206 BCE to 220 CE as a concise band for Han-era China.",
      },
    ],
  },
  {
    id: "tang-dynasty",
    label: "Tang Dynasty",
    shortLabel: "Tang",
    description:
      "Cosmopolitan dynasty famous for poetry, Buddhist art, and a confident imperial state tied closely to Inner Asian exchange.",
    startYear: ce(618),
    endYear: ce(907),
    regionalScopeLabel: "China",
    color: "rgb(97, 121, 170)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 76,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "tangDynastyWikipedia",
        note: "Uses the Tang dynasty's 618–907 span and the page's broad public-facing framing of Tang China as a cultural and administrative high point.",
      },
    ],
  },
  {
    id: "song-china",
    label: "Song China",
    shortLabel: "Song",
    description:
      "Dynasty of booming cities, paper money, printing, and technical ingenuity that made Song China one of the world's most dynamic economies.",
    startYear: ce(960),
    endYear: ce(1279),
    regionalScopeLabel: "China",
    color: "rgb(82, 130, 156)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 74,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "khanSongChina",
        note: "Uses the standard Song dynasty span of 960–1279 highlighted by Khan Academy's 'Prosperity in Song China' lesson.",
      },
    ],
  },
  {
    id: "yuan-dynasty",
    label: "Yuan Dynasty",
    shortLabel: "Yuan",
    description:
      "Mongol-ruled dynasty that governed all China proper and linked the court more directly to wider Eurasian networks.",
    startYear: ce(1271),
    endYear: ce(1368),
    regionalScopeLabel: "China",
    color: "rgb(138, 113, 92)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 73,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "yuanDynastyWikipedia",
        note: "Uses the Yuan dynasty's 1271–1368 span and the page's broad public-facing framing of Mongol rule over China.",
      },
    ],
  },
  {
    id: "ming-dynasty",
    label: "Ming Dynasty",
    shortLabel: "Ming",
    description:
      "Han-ruled restoration associated with ocean voyages, porcelain, and renewed monumental state building.",
    startYear: ce(1368),
    endYear: ce(1644),
    regionalScopeLabel: "China",
    color: "rgb(163, 95, 86)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 72,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "historyMingDynasty",
        note: "Uses the standard Ming dynasty span from the dynasty's founding in 1368 to the Qing takeover in 1644.",
      },
    ],
  },
  {
    id: "qing-dynasty",
    label: "Qing Dynasty",
    shortLabel: "Qing",
    description:
      "Last imperial dynasty, ruled by the Manchus during China's greatest territorial extent and brought to an end in 1912.",
    startYear: ce(1644),
    endYear: ce(1912),
    regionalScopeLabel: "China",
    color: "rgb(151, 131, 86)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 71,
    subGroup: "east-asia",
    sourceRefs: [
      {
        sourceId: "qingDynastyWikipedia",
        note: "Uses the Qing dynasty's 1644–1912 span and the page's broad public-facing framing of Qing rule as the last imperial dynasty of China.",
      },
    ],
  },
];

const MAYA_SUB_BANDS: TimelineOverlayBand[] = [
  {
    id: "preclassic-maya",
    label: "Preclassic Maya",
    shortLabel: "Preclassic",
    description:
      "Era when settled villages grew into the first Maya cities, with early kingship, monumental building, and the emergence of writing.",
    startYear: bce(2_000),
    endYear: ce(250),
    regionalScopeLabel: "Mesoamerica",
    approximateStart: true,
    color: "rgb(172, 136, 100)",
    subGroup: "mesoamerica",
    sourceRefs: [
      {
        sourceId: "preclassicMayaWikipedia",
        note: "Uses the Preclassic Maya span through 250 CE and the page's broad public-facing framing of early cities, monuments, and the rise of Maya rulership and writing.",
      },
    ],
  },
  {
    id: "classic-maya",
    label: "Classic Maya",
    shortLabel: "Classic",
    description:
      "Age of great city-states such as Tikal and Calakmul, remembered for dated monuments, dynastic rivalry, and a high point of Maya art and inscriptions.",
    startYear: ce(250),
    endYear: ce(950),
    regionalScopeLabel: "Mesoamerica",
    color: "rgb(137, 109, 88)",
    subGroup: "mesoamerica",
    sourceRefs: [
      {
        sourceId: "historyOfMayaCivilizationWikipedia",
        note: "Uses the history page's broader Classic framing through the Terminal Classic, keeping one public-facing band from 250 to 950 CE.",
      },
    ],
  },
  {
    id: "postclassic-maya",
    label: "Postclassic Maya",
    shortLabel: "Postclassic",
    description:
      "Later era of northern and highland kingdoms, new trade networks, and resilient Maya polities that remained independent in places until 1697.",
    startYear: ce(950),
    endYear: ce(1697),
    regionalScopeLabel: "Mesoamerica",
    color: "rgb(118, 94, 78)",
    subGroup: "mesoamerica",
    sourceRefs: [
      {
        sourceId: "historyOfMayaCivilizationWikipedia",
        note: "Uses the history page's Postclassic and Contact-era sections for a continuous late Maya band from 950 CE to the fall of Nojpetén in 1697.",
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
    startYear: bce(3_500),
    endYear: bce(539),
    regionalScopeLabel: "Mesopotamia",
    approximateStart: true,
    color: "rgb(180, 120, 70)",
    minZoom: 0,
    priority: 95,
    subGroup: "near-east",
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
    startYear: bce(3_300),
    endYear: bce(1_300),
    regionalScopeLabel: "South Asia",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(107, 136, 166)",
    minZoom: 0,
    priority: 90,
    subGroup: "south-asia",
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
    startYear: bce(3_100),
    endYear: bce(30),
    regionalScopeLabel: "Nile Valley",
    approximateStart: true,
    color: "rgb(166, 149, 94)",
    minZoom: 0,
    priority: 92,
    subGroup: "nile-valley",
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
    startYear: bce(1_650),
    endYear: bce(1_180),
    regionalScopeLabel: "Anatolia and northern Syria",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(157, 106, 126)",
    minZoom: 0,
    priority: 89,
    subGroup: "mediterranean",
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
    startYear: bce(1_600),
    endYear: bce(1_100),
    regionalScopeLabel: "Mainland Greece",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(118, 132, 186)",
    minZoom: 0,
    priority: 88,
    subGroup: "mediterranean",
    sourceRefs: [
      {
        sourceId: "unescoMycenaeTiryns",
        note: "UNESCO says Mycenaean civilization spread around the Mediterranean between 1600 and 1100 BCE; the app uses that broad span for a clean Late Bronze Age Greek band.",
      },
    ],
  },
  {
    id: "maya-civilization",
    label: "Maya",
    shortLabel: "Maya",
    description:
      "Mesoamerican civilization of cities and courts, renowned for hieroglyphic writing, astronomy, and durable regional traditions that outlasted the fall of any one center.",
    startYear: bce(2_000),
    endYear: ce(1697),
    regionalScopeLabel: "Mesoamerica",
    approximateStart: true,
    color: "rgb(148, 118, 94)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 79,
    subGroup: "mesoamerica",
    children: MAYA_SUB_BANDS,
    sourceRefs: [
      {
        sourceId: "mayaCivilizationWikipedia",
        note: "Uses the broad Maya civilization span from pre-classical development to the Spanish conquest of the last independent Maya polity in 1697.",
      },
    ],
  },
  {
    id: "ancient-greece",
    label: "Ancient Greece",
    description:
      "Greek civilization of city-states, philosophy, drama, and new ways of thinking about politics and citizenship.",
    startYear: bce(1_200),
    endYear: bce(323),
    regionalScopeLabel: "Aegean and eastern Mediterranean",
    approximateStart: true,
    color: "rgb(93, 119, 183)",
    minZoom: 0,
    priority: 88,
    subGroup: "mediterranean",
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
    startYear: bce(550),
    endYear: bce(330),
    regionalScopeLabel: "Iranian Plateau and ancient Near East",
    color: "rgb(135, 92, 142)",
    minZoom: 0,
    priority: 86,
    subGroup: "iranian-world",
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
    startYear: bce(509),
    endYear: bce(27),
    regionalScopeLabel: "Mediterranean",
    color: "rgb(159, 91, 70)",
    minZoom: 0,
    priority: 84,
    subGroup: "mediterranean",
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
    startYear: bce(323),
    endYear: bce(30),
    regionalScopeLabel: "Eastern Mediterranean and Southwest Asia",
    color: "rgb(87, 142, 166)",
    minZoom: 0,
    priority: 82,
    subGroup: "mediterranean",
    sourceRefs: [
      {
        sourceId: "britannicaHellenisticAge",
        note: "Uses Britannica's 323 BCE to 30 BCE span from Alexander's death to Rome's conquest of Egypt.",
      },
    ],
  },
  {
    id: "chinese-civilization",
    label: "China",
    shortLabel: "China",
    description:
      "Long dynastic tradition of the Chinese heartland, from Shang bronze-age kingdoms to the last imperial court of the Qing.",
    startYear: bce(1_600),
    endYear: ce(1912),
    regionalScopeLabel: "China",
    approximateStart: true,
    color: "rgb(92, 128, 104)",
    minZoom: 0,
    priority: 87,
    subGroup: "east-asia",
    children: CHINESE_CIVILIZATION_SUB_BANDS,
    sourceRefs: [
      {
        sourceId: "historyOfChinaWikipedia",
        note: "Broad parent overlay spanning the conventional Shang beginning of dynastic China through the Qing dynasty's end in 1912.",
      },
    ],
  },
  {
    id: "roman-empire",
    label: "Roman Empire",
    description:
      "Mediterranean superpower built on law, roads, cities, and imperial rule, shaping surrounding regions for centuries.",
    startYear: bce(27),
    endYear: ce(476),
    regionalScopeLabel: "Mediterranean",
    color: "rgb(136, 78, 64)",
    minZoom: 0,
    priority: 78,
    subGroup: "mediterranean",
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

export const POST_CLASSICAL_EARLY_MODERN_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "sasanian-empire",
    label: "Sasanian Empire",
    shortLabel: "Sasanians",
    description:
      "Persian empire that rivaled Rome and Byzantium, preserving and reshaping imperial traditions across the Iranian world.",
    startYear: ce(224),
    endYear: ce(651),
    regionalScopeLabel: "Iranian world",
    color: "rgb(120, 95, 155)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 79,
    subGroup: "iranian-world",
    sourceRefs: [
      {
        sourceId: "sasanianEmpireWikipedia",
        note: "Uses the standard Sasanian span from Ardashir I's rise in 224 CE to the empire's fall in 651 CE.",
      },
    ],
  },
  {
    id: "byzantine-empire",
    label: "Byzantine Empire",
    shortLabel: "Byzantium",
    startYear: ce(330),
    endYear: ce(1453),
    regionalScopeLabel: "Eastern Mediterranean",
    color: "rgb(96, 109, 170)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 76,
    subGroup: "mediterranean",
    sourceRefs: [
      {
        sourceId: "metByzantium",
        note: "Uses the conventional Byzantine span from Constantine's refounding of Constantinople in 330 CE to the Ottoman conquest in 1453.",
      },
      {
        sourceId: "historyByzantineEmpire",
        note: "Supports the 1453 endpoint used for the overlay's eastern Roman / Byzantine continuity band.",
      },
    ],
  },
  {
    id: "abbasid-caliphate",
    label: "Abbasid Caliphate",
    shortLabel: "Abbasids",
    startYear: ce(750),
    endYear: ce(1258),
    regionalScopeLabel: "Islamic world",
    color: "rgb(78, 133, 99)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 75,
    subGroup: "near-east",
    sourceRefs: [
      {
        sourceId: "khanGoldenAgeOfIslam",
        note: "Uses Khan Academy's Abbasid-era framing and 750–1258 political span for a clean post-classical caliphal band.",
      },
    ],
  },
  {
    id: "holy-roman-empire",
    label: "Holy Roman Empire",
    shortLabel: "Holy Roman",
    description:
      "Loose Central European empire of emperors, princes, bishops, and cities that shaped medieval and early modern German politics for centuries.",
    startYear: ce(962),
    endYear: ce(1806),
    regionalScopeLabel: "Central Europe",
    color: "rgb(116, 112, 150)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 74,
    subGroup: "central-europe",
    sourceRefs: [
      {
        sourceId: "holyRomanEmpireWikipedia",
        note: "Uses the conventional span from Otto I's imperial coronation in 962 to Francis II's dissolution of the empire in 1806.",
      },
    ],
  },
  {
    id: "mongol-empire",
    label: "Mongol Empire",
    shortLabel: "Mongols",
    startYear: ce(1206),
    endYear: ce(1368),
    regionalScopeLabel: "Central Asia and East Asia",
    color: "rgb(134, 108, 84)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 78,
    subGroup: "steppe",
    sourceRefs: [
      {
        sourceId: "britannicaMongolEmpire",
        note: "Uses Britannica's broad 1206–1368 Mongol Empire span, from Temujin's election as Genghis Khan to the end of Mongol Yuan rule in China under the Ming.",
      },
      {
        sourceId: "historyGenghisKhan",
        note: "Supports the 1206 starting point, when Temujin was proclaimed Chinggis Khan after unifying the Mongol steppe tribes.",
      },
    ],
  },
  {
    id: "mali-empire",
    label: "Mali Empire",
    shortLabel: "Mali",
    description:
      "West African empire renowned for trans-Saharan trade, Islamic scholarship, and Mansa Musa's legendary pilgrimage.",
    startYear: ce(1235),
    endYear: ce(1610),
    regionalScopeLabel: "West Africa",
    approximateStart: true,
    approximateEnd: true,
    color: "rgb(129, 96, 76)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 73,
    subGroup: "west-africa",
    sourceRefs: [
      {
        sourceId: "maliEmpireWikipedia",
        note: "Uses the broad Mali Empire span from Sundiata's rise in the 13th century through the empire's long decline into the early 17th century.",
      },
    ],
  },
  {
    id: "ottoman-empire",
    label: "Ottoman Empire",
    shortLabel: "Ottomans",
    startYear: ce(1299),
    endYear: ce(1800),
    regionalScopeLabel: "Eastern Mediterranean and Balkans",
    color: "rgb(111, 137, 92)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 77,
    subGroup: "mediterranean",
    sourceRefs: [
      {
        sourceId: "historyOttomanEmpire",
        note: "Uses the Ottoman state's conventional 1299 origin, but clips the display band at 1800 so this overlay family stays bounded to the app's early-modern window; the polity continued until 1922.",
      },
    ],
  },
  {
    id: "aztec-empire",
    label: "Aztec Empire",
    shortLabel: "Aztecs",
    startYear: ce(1428),
    endYear: ce(1521),
    regionalScopeLabel: "Mesoamerica",
    color: "rgb(160, 121, 68)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 71,
    subGroup: "mesoamerica",
    sourceRefs: [
      {
        sourceId: "historyAztecs",
        note: "Uses the 1428 Triple Alliance as a concise imperial starting point and 1521 as the fall of Tenochtitlan.",
      },
    ],
  },
  {
    id: "inca-empire",
    label: "Inca Empire",
    shortLabel: "Inca",
    startYear: ce(1438),
    endYear: ce(1572),
    regionalScopeLabel: "Andes",
    color: "rgb(182, 135, 78)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 70,
    subGroup: "andes",
    sourceRefs: [
      {
        sourceId: "historyInca",
        note: "Uses Pachacuti's mid-15th-century imperial expansion as the clean starting point and the fall of Vilcabamba in 1572 as the endpoint.",
      },
    ],
  },
];

export const CIVILIZATION_OVERLAYS: TimelineOverlayBand[] = [
  ...ANCIENT_CIVILIZATION_OVERLAYS,
  ...POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
];
