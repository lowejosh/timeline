import type { EraDefinition } from "../../core/timelineTypes";
import { TIMELINE_MAX_YEAR } from "../../core/timelineYears";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../../core/exactTimestamp";
import { bce, ce, yearsAgo } from "../timelineDateBuilders";

const CURRENT_YEAR = TIMELINE_MAX_YEAR;
const COLD_WAR_DIGITAL_AGE_HANDOFF_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1991,
  month: 12,
  day: 31,
  precision: "day",
});
const COLD_WAR_DIGITAL_AGE_HANDOFF_YEAR = getTimelineYearFromExactTimestamp(
  COLD_WAR_DIGITAL_AGE_HANDOFF_AT,
);
const IPHONE_INTRODUCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2007,
  month: 1,
  day: 9,
  precision: "day",
});
const IPHONE_INTRODUCED_YEAR =
  getTimelineYearFromExactTimestamp(IPHONE_INTRODUCED_AT);
const CHATGPT_INTRODUCED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2022,
  month: 11,
  day: 30,
  precision: "day",
});
const CHATGPT_INTRODUCED_YEAR = getTimelineYearFromExactTimestamp(
  CHATGPT_INTRODUCED_AT,
);

const HUMAN_HISTORY_COLORS = {
  paleolithic: "rgb(64, 167, 226)",
  epipaleolithic: "rgb(232, 134, 69)",
  neolithic: "rgb(88, 217, 69)",
  prePotteryNeolithicA: "rgb(191, 82, 224)",
  prePotteryNeolithicB: "rgb(229, 208, 67)",
  potteryNeolithic: "rgb(63, 213, 188)",
  chalcolithic: "rgb(227, 84, 93)",
  bronzeAge: "rgb(81, 114, 225)",
  earlyBronzeAge: "rgb(65, 216, 120)",
  middleBronzeAge: "rgb(225, 110, 61)",
  lateBronzeAge: "rgb(223, 88, 214)",
  ironAge: "rgb(151, 214, 56)",
  earlyIronAge: "rgb(64, 185, 221)",
  middleIronAge: "rgb(224, 82, 129)",
  lateIronAge: "rgb(230, 168, 61)",
  classicalAntiquity: "rgb(130, 84, 222)",
  postClassicalHistory: "rgb(69, 217, 98)",
  earlyModernPeriod: "rgb(227, 95, 69)",
  ageOfDiscovery: "rgb(239, 132, 72)",
  generalCrisis: "rgb(218, 88, 102)",
  ageOfEnlightenment: "rgb(235, 191, 80)",
  ageOfIndustryAndEmpire: "rgb(65, 132, 220)",
  earlyIndustrialGrowth: "rgb(83, 176, 232)",
  nationalismAndExpansion: "rgb(103, 216, 118)",
  highIndustrializationAndEmpire: "rgb(230, 170, 77)",
  warAndCrisis: "rgb(221, 93, 121)",
  contemporaryHistory: "rgb(58, 217, 159)",
  postwarOrder: "rgb(232, 199, 69)",
  coldWarAndDecolonization: "rgb(223, 83, 181)",
  digitalAge: "rgb(58, 206, 223)",
  openWebEra: "rgb(85, 170, 238)",
  mobileComputingEra: "rgb(96, 214, 122)",
  algorithmicEra: "rgb(240, 176, 66)",
  aiAndAutomationEra: "rgb(197, 96, 232)",
} as const;

export const HUMAN_HISTORY_ERA_DEFINITIONS: EraDefinition[] = [
  {
    id: "paleolithic",
    name: "Paleolithic",
    startYear: yearsAgo(300_000),
    endYear: bce(20_000),
    color: HUMAN_HISTORY_COLORS.paleolithic,
    description:
      "Long era of mobile hunter-gatherers, stone tools, and the first known art.",
    scheme: "archaeological",
    sourceIds: [
      "khanPaleolithicCulture",
      "smithsonianHumanOrigins"
    ],
  },
  {
    id: "epipaleolithic",
    name: "Epipaleolithic",
    startYear: bce(20_000),
    endYear: bce(10_000),
    color: HUMAN_HISTORY_COLORS.epipaleolithic,
    regionalScopeLabel: "Ancient Near East",
    approximateStart: true,
    approximateEnd: true,
    description:
      "Warming-climate transition when some hunter-gatherer communities grew more settled and locally rooted.",
    scheme: "archaeological",
    sourceIds: ["periodo"],
  },
  {
    id: "neolithic",
    name: "Neolithic",
    startYear: bce(10_000),
    endYear: bce(4_500),
    color: HUMAN_HISTORY_COLORS.neolithic,
    regionalScopeLabel: "Ancient Near East",
    approximateStart: true,
    approximateEnd: true,
    description:
      "Farming villages, domesticated plants and animals, and more permanent settlement reshape daily life.",
    scheme: "archaeological",
    sourceIds: [
      "periodo",
      "khanNeolithicRevolution"
    ],
    children: [
      {
        id: "pre-pottery-neolithic-a",
        name: "Pre-Pottery Neolithic A",
        startYear: bce(10_000),
        endYear: bce(8_800),
        color: HUMAN_HISTORY_COLORS.prePotteryNeolithicA,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Early village phase of cultivation experiments, communal buildings, and life before pottery.",
        scheme: "archaeological",
        sourceIds: ["periodo"],
      },
      {
        id: "pre-pottery-neolithic-b",
        name: "Pre-Pottery Neolithic B",
        startYear: bce(8_800),
        endYear: bce(6_500),
        color: HUMAN_HISTORY_COLORS.prePotteryNeolithicB,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Larger farming communities with domesticated animals, plastered skulls, and expanding village architecture.",
        scheme: "archaeological",
        sourceIds: ["khanNeolithicRevolution"],
      },
      {
        id: "pottery-neolithic",
        name: "Pottery Neolithic",
        startYear: bce(6_500),
        endYear: bce(4_500),
        color: HUMAN_HISTORY_COLORS.potteryNeolithic,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Established farming world of everyday pottery, food storage, and widening local exchange.",
        scheme: "archaeological",
        sourceIds: ["periodo"],
      },
    ],
  },
  {
    id: "chalcolithic",
    name: "Chalcolithic",
    startYear: bce(4_500),
    endYear: bce(3_300),
    color: HUMAN_HISTORY_COLORS.chalcolithic,
    regionalScopeLabel: "Ancient Near East",
    approximateStart: true,
    approximateEnd: true,
    description:
      "Copper joins stone tools as villages grow more specialized, unequal, and connected.",
    scheme: "archaeological",
    sourceIds: ["britannicaBronzeAge"],
  },
  {
    id: "bronze-age",
    name: "Bronze Age",
    startYear: bce(3_300),
    endYear: bce(1_200),
    color: HUMAN_HISTORY_COLORS.bronzeAge,
    regionalScopeLabel: "Ancient Near East",
    approximateStart: true,
    approximateEnd: true,
    description:
      "Cities, kingdoms, bronze metallurgy, and long-distance trade tie the ancient Near East into a shared world.",
    scheme: "archaeological",
    sourceIds: [
      "britannicaBronzeAge",
      "britannicaMiddleEast"
    ],
    children: [
      {
        id: "early-bronze-age",
        name: "Early Bronze Age",
        startYear: bce(3_300),
        endYear: bce(2_000),
        color: HUMAN_HISTORY_COLORS.earlyBronzeAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "First cities and fortified towns rise as urban life expands across the region.",
        scheme: "archaeological",
        sourceIds: ["britannicaBronzeAge"],
      },
      {
        id: "middle-bronze-age",
        name: "Middle Bronze Age",
        startYear: bce(2_000),
        endYear: bce(1_550),
        color: HUMAN_HISTORY_COLORS.middleBronzeAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Palace kingdoms, chariot warfare, and walled cities define a world of rival courts.",
        scheme: "archaeological",
        sourceIds: ["britannicaBronzeAge"],
      },
      {
        id: "late-bronze-age",
        name: "Late Bronze Age",
        startYear: bce(1_550),
        endYear: bce(1_200),
        color: HUMAN_HISTORY_COLORS.lateBronzeAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Great-power diplomacy and palace trade link Egypt, Anatolia, Mesopotamia, and the Levant.",
        scheme: "archaeological",
        sourceIds: ["britannicaBronzeAge"],
      },
    ],
  },
  {
    id: "iron-age",
    name: "Iron Age",
    startYear: bce(1_200),
    endYear: bce(539),
    color: HUMAN_HISTORY_COLORS.ironAge,
    regionalScopeLabel: "Ancient Near East",
    approximateStart: true,
    description:
      "Era when iron smelting and forging spread widely enough for iron tools and weapons to overtake bronze.",
    scheme: "archaeological",
    sourceIds: [
      "britannicaIronAge",
      "britannicaMetallurgy",
      "historyPersianEmpire"
    ],
    children: [
      {
        id: "early-iron-age",
        name: "Early Iron Age",
        startYear: bce(1_200),
        endYear: bce(900),
        color: HUMAN_HISTORY_COLORS.earlyIronAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Transition phase when ironworking spreads quickly but smiths still labor to turn bloom iron into reliable tools and blades.",
        scheme: "archaeological",
        sourceIds: [
          "britannicaIronAge",
          "britannicaMetallurgy"
        ],
      },
      {
        id: "middle-iron-age",
        name: "Middle Iron Age",
        startYear: bce(900),
        endYear: bce(609),
        color: HUMAN_HISTORY_COLORS.middleIronAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        approximateEnd: true,
        description:
          "Ironworking becomes more dependable and widespread, supplying tougher farm tools, fittings, and more common weapons.",
        scheme: "archaeological",
        sourceIds: [
          "britannicaMetallurgy",
          "britannicaIronAge"
        ],
      },
      {
        id: "late-iron-age",
        name: "Late Iron Age",
        startYear: bce(609),
        endYear: bce(539),
        color: HUMAN_HISTORY_COLORS.lateIronAge,
        regionalScopeLabel: "Ancient Near East",
        approximateStart: true,
        description:
          "By this final phase, iron tools and weapons are established parts of everyday production rather than a newer experiment.",
        scheme: "archaeological",
        sourceIds: [
          "britannicaMetallurgy",
          "historyPersianEmpire"
        ],
      },
    ],
  },
  {
    id: "classical-antiquity",
    name: "Classical Antiquity",
    startYear: bce(539),
    endYear: ce(500),
    color: HUMAN_HISTORY_COLORS.classicalAntiquity,
    description:
      "Greco-Roman age that shaped Mediterranean law, architecture, philosophy, and urban life.",
    scheme: "world-history",
    sourceIds: ["britannicaClassicalAntiquity"],
  },
  {
    id: "post-classical-history",
    name: "Post-classical History",
    startYear: ce(500),
    endYear: ce(1500),
    color: HUMAN_HISTORY_COLORS.postClassicalHistory,
    description:
      "Major religions, caravan routes, and maritime trade bind Afro-Eurasia more tightly.",
    scheme: "world-history",
    sourceIds: [
      "historyIslam",
      "khanSongChina",
      "britannicaMongolEmpire"
    ],
  },
  {
    id: "early-modern-period",
    name: "Early Modern Period",
    startYear: ce(1500),
    endYear: ce(1800),
    color: HUMAN_HISTORY_COLORS.earlyModernPeriod,
    description:
      "Print culture, oceanic empires, gunpowder states, and global exchange redraw the world.",
    scheme: "world-history",
    sourceIds: [
      "historyPrintingPress",
      "historyChristopherColumbus",
      "historyOttomanEmpire"
    ],
    children: [
      {
        id: "age-of-discovery",
        name: "Age of Discovery",
        startYear: ce(1500),
        endYear: ce(1618),
        color: HUMAN_HISTORY_COLORS.ageOfDiscovery,
        approximateEnd: true,
        description:
          "Oceanic voyages, imperial rivalry, and transatlantic exchange pull distant regions into one connected world.",
        scheme: "world-history",
        sourceIds: [
          "historyChristopherColumbus",
          "historyFerdinandMagellan"
        ],
      },
      {
        id: "general-crisis",
        name: "General Crisis",
        startYear: ce(1618),
        endYear: ce(1685),
        color: HUMAN_HISTORY_COLORS.generalCrisis,
        approximateStart: true,
        approximateEnd: true,
        description:
          "Dynastic war, rebellion, and fiscal strain shake kingdoms across Europe and beyond.",
        scheme: "world-history",
        sourceIds: ["historyThirtyYearsWar"],
      },
      {
        id: "age-of-enlightenment",
        name: "Age of Enlightenment",
        startYear: ce(1685),
        endYear: ce(1800),
        color: HUMAN_HISTORY_COLORS.ageOfEnlightenment,
        approximateStart: true,
        description:
          "Reason, experiment, and print debate challenge inherited authority in science, politics, and religion.",
        scheme: "world-history",
        sourceIds: [
          "historyEnlightenment",
          "britannicaEncyclopedie"
        ],
      },
    ],
  },
  {
    id: "age-of-industry-and-empire",
    name: "Age of Industry & Empire",
    startYear: ce(1800),
    endYear: ce(1945),
    color: HUMAN_HISTORY_COLORS.ageOfIndustryAndEmpire,
    description:
      "Factories, coal, steam transport, and industrial war transform work, cities, and state power.",
    scheme: "world-history",
    sourceIds: [
      "historyIndustrialRevolution",
      "historyMeijiRestoration",
      "historyWorldWarOne"
    ],
    children: [
      {
        id: "early-industrial-growth",
        name: "Early Industrial Growth",
        startYear: ce(1800),
        endYear: ce(1848),
        color: HUMAN_HISTORY_COLORS.earlyIndustrialGrowth,
        approximateEnd: true,
        description:
          "Factories, coal power, and growing industrial cities begin to reorganize work, class, and everyday life.",
        scheme: "world-history",
        sourceIds: ["historyIndustrialRevolution"],
      },
      {
        id: "nationalism-and-expansion",
        name: "Nationalism & Expansion",
        startYear: ce(1848),
        endYear: ce(1870),
        color: HUMAN_HISTORY_COLORS.nationalismAndExpansion,
        approximateStart: true,
        approximateEnd: true,
        description:
          "Revolutions, reforms, and more assertive states push industrial societies toward national politics and wider expansion.",
        scheme: "world-history",
        sourceIds: [
          "historyIndustrialRevolution",
          "historyMeijiRestoration"
        ],
      },
      {
        id: "high-industrialization-and-empire",
        name: "High Industrialization & Empire",
        startYear: ce(1870),
        endYear: ce(1914),
        color: HUMAN_HISTORY_COLORS.highIndustrializationAndEmpire,
        approximateStart: true,
        description:
          "Heavy industry, new technologies, and imperial expansion bind distant regions more tightly while sharpening great-power rivalry.",
        scheme: "world-history",
        sourceIds: [
          "historyIndustrialRevolution",
          "britannicaScrambleForAfrica"
        ],
      },
      {
        id: "war-and-crisis",
        name: "War & Crisis",
        startYear: ce(1914),
        endYear: ce(1945),
        color: HUMAN_HISTORY_COLORS.warAndCrisis,
        description:
          "Global war, economic breakdown, and collapsing empires overturn the old industrial world order.",
        scheme: "world-history",
        sourceIds: [
          "historyWorldWarOne",
          "historyGreatDepression",
          "historyWorldWarTwo"
        ],
      },
    ],
  },
  {
    id: "contemporary-history",
    name: "Contemporary History",
    startYear: ce(1945),
    endYear: CURRENT_YEAR,
    color: HUMAN_HISTORY_COLORS.contemporaryHistory,
    description:
      "Post-1945 world of decolonization, superpower rivalry, and rapidly networked global life.",
    scheme: "world-history",
    sourceIds: [
      "unDecolonization",
      "britannicaColdWar",
      "natGeoGlobalization"
    ],
    children: [
      {
        id: "postwar-order",
        name: "Postwar Order",
        startYear: ce(1945),
        endYear: ce(1960),
        color: HUMAN_HISTORY_COLORS.postwarOrder,
        description:
          "Reconstruction, new international institutions, and nuclear superpowers define the early postwar world.",
        scheme: "world-history",
        sourceIds: [
          "unHistoryUnitedNations",
          "historyMarshallPlan",
          "britannicaColdWar"
        ],
      },
      {
        id: "cold-war-and-decolonization",
        name: "Cold War & Decolonization",
        startYear: ce(1960),
        endYear: COLD_WAR_DIGITAL_AGE_HANDOFF_YEAR,
        color: HUMAN_HISTORY_COLORS.coldWarAndDecolonization,
        description:
          "Independence movements redraw the map while proxy wars, ideology, and nuclear rivalry shape a divided world.",
        scheme: "world-history",
        sourceIds: [
          "unDecolonization",
          "britannicaColdWar"
        ],
      },
      {
        id: "digital-age",
        name: "Digital Age",
        startYear: COLD_WAR_DIGITAL_AGE_HANDOFF_YEAR,
        endYear: CURRENT_YEAR,
        color: HUMAN_HISTORY_COLORS.digitalAge,
        description:
          "The web, smartphones, data systems, and AI remake communication, work, and everyday life.",
        scheme: "world-history",
        sourceIds: [
          "natGeoGlobalization",
          "cernBirthWeb",
          "openAiIntroducingChatGpt"
        ],
        children: [
          {
            id: "open-web-era",
            name: "Open Web Era",
            startYear: COLD_WAR_DIGITAL_AGE_HANDOFF_YEAR,
            endYear: IPHONE_INTRODUCED_YEAR,
            exactEndTime: IPHONE_INTRODUCED_AT,
            color: HUMAN_HISTORY_COLORS.openWebEra,
            description:
              "The web escapes the lab and becomes a public medium for pages, portals, search, and early online communities.",
            scheme: "world-history",
            sourceIds: [
              "cernShortHistoryWeb",
              "cernBirthWeb"
            ],
          },
          {
            id: "mobile-computing-era",
            name: "Mobile Computing Era",
            startYear: IPHONE_INTRODUCED_YEAR,
            exactStartTime: IPHONE_INTRODUCED_AT,
            endYear: ce(2012),
            color: HUMAN_HISTORY_COLORS.mobileComputingEra,
            description:
              "Smartphones put full internet access, apps, maps, cameras, and constant connectivity in a pocket.",
            scheme: "world-history",
            sourceIds: ["appleIPhoneIntroduction"],
          },
          {
            id: "algorithmic-era",
            name: "Algorithmic Era",
            startYear: ce(2012),
            endYear: CHATGPT_INTRODUCED_YEAR,
            exactEndTime: CHATGPT_INTRODUCED_AT,
            color: HUMAN_HISTORY_COLORS.algorithmicEra,
            description:
              "Big data, ranking systems, recommendation feeds, and automated targeting increasingly shape what people see, buy, and do online.",
            scheme: "world-history",
            sourceIds: ["trustMeBro"],
          },
          {
            id: "ai-and-automation-era",
            name: "AI and Automation Era",
            startYear: CHATGPT_INTRODUCED_YEAR,
            exactStartTime: CHATGPT_INTRODUCED_AT,
            endYear: CURRENT_YEAR,
            color: HUMAN_HISTORY_COLORS.aiAndAutomationEra,
            description:
              "Generative AI and increasingly autonomous software move into mainstream writing, coding, search, and office work.",
            scheme: "world-history",
            sourceIds: [
              "openAiIntroducingChatGpt",
              "oecdAiWipsProgram"
            ],
          },
        ],
      },
    ],
  },
];
