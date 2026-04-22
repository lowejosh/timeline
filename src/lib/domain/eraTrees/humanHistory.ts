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
    sourceRefs: [
      {
        sourceId: "khanPaleolithicCulture",
        note: "Used here in the broad standard Stone Age sense before the Near Eastern Epipaleolithic transition.",
      },
      { sourceId: "smithsonianHumanOrigins" },
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
    sourceRefs: [
      {
        sourceId: "periodo",
        note: "Near Eastern archaeology often prefers Epipaleolithic where broader world-history surveys might say Mesolithic.",
      },
    ],
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
    sourceRefs: [
      { sourceId: "periodo" },
      {
        sourceId: "khanNeolithicRevolution",
        note: "Near Eastern Neolithic examples include Pre-Pottery Neolithic phases such as those attested at Jericho.",
      },
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
        sourceRefs: [{ sourceId: "periodo" }],
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
        sourceRefs: [{ sourceId: "khanNeolithicRevolution" }],
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
        sourceRefs: [{ sourceId: "periodo" }],
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
    sourceRefs: [
      {
        sourceId: "britannicaBronzeAge",
        note: "The Chalcolithic or Copper Age is commonly treated as the transition into the Bronze Age in the ancient Near East.",
      },
    ],
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
    sourceRefs: [
      { sourceId: "britannicaBronzeAge" },
      { sourceId: "britannicaMiddleEast" },
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
        sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
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
        sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
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
        sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
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
    sourceRefs: [
      { sourceId: "britannicaIronAge" },
      { sourceId: "britannicaMetallurgy" },
      {
        sourceId: "historyPersianEmpire",
        note: "Used only for the app's 539 BCE handoff out of the Near Eastern Iron Age track and into classical antiquity.",
      },
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
        sourceRefs: [
          {
            sourceId: "britannicaIronAge",
            note: "Used for the broad c. 1200 BCE opening of the Iron Age and the rapid spread of iron metallurgy between 1200 and 1000 BCE.",
          },
          {
            sourceId: "britannicaMetallurgy",
            note: "Used for early iron production as bloom smelting followed by reheating and hammering to make workable wrought iron.",
          },
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
        sourceRefs: [
          {
            sourceId: "britannicaMetallurgy",
            note: "Used for repeated forging, annealing, and growing control over carbon content as ironworking techniques improved.",
          },
          {
            sourceId: "britannicaIronAge",
            note: "Used for the broader Iron Age pattern in which large-scale iron implements changed settlement, agriculture, and warfare.",
          },
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
        sourceRefs: [
          {
            sourceId: "britannicaMetallurgy",
            note: "Used for the mature Iron Age pattern of established forging practice and improved ironworking over time.",
          },
          {
            sourceId: "historyPersianEmpire",
            note: "Used only for the app's 539 BCE endpoint before the classical-antiquity band begins.",
          },
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
    sourceRefs: [{ sourceId: "britannicaClassicalAntiquity" }],
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
    sourceRefs: [
      { sourceId: "historyIslam" },
      { sourceId: "khanSongChina" },
      { sourceId: "britannicaMongolEmpire" },
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
    sourceRefs: [
      { sourceId: "historyPrintingPress" },
      { sourceId: "historyChristopherColumbus" },
      { sourceId: "historyOttomanEmpire" },
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
        sourceRefs: [
          {
            sourceId: "historyChristopherColumbus",
            note: "HISTORY uses Columbus's 1492 Atlantic landfall as a clean public-history threshold for sustained transatlantic contact and colonization, which helps ground the opening centuries of this phase.",
          },
          {
            sourceId: "historyFerdinandMagellan",
            note: "HISTORY says Magellan's expedition set out in 1519 and that the Victoria returned to Spain in September 1522 after completing the voyage around the world, making it a strong capstone marker for this oceanic era.",
          },
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
        sourceRefs: [
          {
            sourceId: "historyThirtyYearsWar",
            note: "HISTORY calls the Thirty Years' War a 17th-century conflict fought primarily in central Europe from 1618 to 1648, a useful anchor for the wider century of war and instability often grouped as the General Crisis.",
          },
        ],
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
        sourceRefs: [
          {
            sourceId: "historyEnlightenment",
            note: "HISTORY describes the Enlightenment as the long 18th century from 1685 to 1815 and specifically identifies an early Enlightenment beginning in 1685, which the app uses as the start of this sub-era while clipping the end to the parent era's 1800 boundary.",
          },
          {
            sourceId: "britannicaEncyclopedie",
            note: "Britannica calls the Encyclopédie one of the chief works of the philosophes and says its text volumes were published beginning in 1751, making it a strong signature publication inside this era.",
          },
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
    sourceRefs: [
      { sourceId: "historyIndustrialRevolution" },
      { sourceId: "historyMeijiRestoration" },
      { sourceId: "historyWorldWarOne" },
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
        sourceRefs: [
          {
            sourceId: "historyIndustrialRevolution",
            note: "HISTORY describes the Industrial Revolution as transforming agrarian societies into industrialized and urban ones through factories, steam power, coal, and mechanized production, which fits this early growth phase.",
          },
        ],
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
        sourceRefs: [
          {
            sourceId: "historyIndustrialRevolution",
            note: "HISTORY ties later industrialization to expanding communication, rail transport, factories, and urban society, which helps ground this mid-19th-century transition into more politically charged industrial states.",
          },
          {
            sourceId: "historyMeijiRestoration",
            note: "HISTORY says the Meiji Restoration of 1868 toppled the Tokugawa shogunate and propelled Japan into the modern era, a useful state-reform anchor inside this nation-building phase.",
          },
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
        sourceRefs: [
          {
            sourceId: "historyIndustrialRevolution",
            note: "HISTORY distinguishes a later industrial phase of rapid advances in steel, electric power, and automobiles in the late 19th and early 20th centuries.",
          },
          {
            sourceId: "britannicaScrambleForAfrica",
            note: "Britannica's Scramble for Africa page frames the late-19th-century imperial partition of Africa and the Berlin Conference's role in accelerating that expansion.",
          },
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
        sourceRefs: [
          {
            sourceId: "historyWorldWarOne",
            note: "HISTORY says World War I started in 1914 and brought the fall of major imperial dynasties, making it a clear opening to this crisis era.",
          },
          {
            sourceId: "historyGreatDepression",
            note: "HISTORY describes the Great Depression as the worst economic crisis in modern history, lasting from 1929 to the beginning of World War II in 1939.",
          },
          {
            sourceId: "historyWorldWarTwo",
            note: "HISTORY says World War II began with Germany's 1939 invasion of Poland and ended in 1945 after devastating global destruction and political restructuring.",
          },
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
    sourceRefs: [
      { sourceId: "unDecolonization" },
      { sourceId: "britannicaColdWar" },
      { sourceId: "natGeoGlobalization" },
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
        sourceRefs: [
          {
            sourceId: "unHistoryUnitedNations",
            note: "The UN's history page places the San Francisco Conference and UN Charter in 1945, with the organization officially beginning on 24 October 1945 as a clear postwar institutional threshold.",
          },
          {
            sourceId: "historyMarshallPlan",
            note: "HISTORY describes the Marshall Plan, enacted in 1948, as a program to rebuild Western European cities, industries, and infrastructure after World War II.",
          },
          {
            sourceId: "britannicaColdWar",
            note: "Britannica says the Cold War emerged after World War II and had solidified by 1947-48, fitting this early postwar era of bloc formation and nuclear superpowers.",
          },
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
        sourceRefs: [
          {
            sourceId: "unDecolonization",
            note: "The UN identifies its 1960 Declaration on the Granting of Independence to Colonial Countries and Peoples as a landmark acceleration point in global decolonization.",
          },
          {
            sourceId: "britannicaColdWar",
            note: "Britannica gives the Cold War a 1947-1991 span and describes the later decades of proxy conflict, detente, renewed tension, and final breakdown through 1991.",
          },
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
        sourceRefs: [
          {
            sourceId: "natGeoGlobalization",
            note: "National Geographic says globalization went into overdrive with the Information Age, when computer and communications technology redefined what it meant to be connected.",
          },
          {
            sourceId: "cernBirthWeb",
            note: "CERN dates the Web's invention to 1989 and its public-domain release to 1993, making it a core threshold technology for the modern digital era.",
          },
          {
            sourceId: "openAiIntroducingChatGpt",
            note: "Used here for the later digital-age turn in which conversational generative AI moved into mainstream public use.",
          },
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
            sourceRefs: [
              {
                sourceId: "cernShortHistoryWeb",
                note: "CERN says Berners-Lee released the WWW software in 1991, including the line-mode browser, server software, and developer library, then announced it on Internet newsgroups in August 1991.",
              },
              {
                sourceId: "cernBirthWeb",
                note: "Used for the web's broader early public spread and CERN's 1993 public-domain release that helped it flourish globally.",
              },
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
            sourceRefs: [
              {
                sourceId: "appleIPhoneIntroduction",
                note: "Apple introduced the iPhone on 9 January 2007 as a phone, widescreen iPod, and Internet communications device in one handheld product, making it a clean threshold for this mobile-first turn.",
              },
            ],
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
            sourceRefs: [
              {
                sourceId: "trustMeBro",
                note: "Yes, this one is intentionally a personal call, not a citation. Big data, feeds, targeting, ranking, and precision marketing just feel like their own era.",
              },
            ],
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
            sourceRefs: [
              {
                sourceId: "openAiIntroducingChatGpt",
                note: "OpenAI launched ChatGPT as a public research preview on 30 November 2022, a useful public threshold for conversational generative AI becoming mainstream.",
              },
              {
                sourceId: "oecdAiWipsProgram",
                note: "Used for the OECD's broader framing that AI is changing how work is organised and carried out, complementing or replacing tasks while generating new kinds of work.",
              },
            ],
          },
        ],
      },
    ],
  },
];
