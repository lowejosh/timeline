import type { EraDefinition } from "../timelineTypes";
import { TIMELINE_MAX_YEAR } from "../../time/timelineYears";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../../time/exactTimestamp";
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

export const HUMAN_HISTORY_ERA_DEFINITION: EraDefinition = {
  id: "human-history",
  name: "Human History",
  startYear: yearsAgo(300_000),
  endYear: CURRENT_YEAR,
  description:
    "From stone tools to global networks, this track follows the broad story of human societies.",
  scheme: "world-history",
  sourceRefs: [
    { sourceId: "smithsonianHumanOrigins" },
    { sourceId: "periodo" },
    { sourceId: "stearnsPeriodization" },
    { sourceId: "bentleyEarlyModern" },
    { sourceId: "brivatiContemporary" },
  ],
  children: [
    {
      id: "paleolithic",
      name: "Paleolithic",
      startYear: yearsAgo(300_000),
      endYear: bce(20_000),
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
      description:
        "Print culture, oceanic empires, gunpowder states, and global exchange redraw the world.",
      scheme: "world-history",
      sourceRefs: [
        { sourceId: "historyPrintingPress" },
        { sourceId: "historyChristopherColumbus" },
        { sourceId: "historyOttomanEmpire" },
      ],
    },
    {
      id: "age-of-industry-and-empire",
      name: "Age of Industry & Empire",
      startYear: ce(1800),
      endYear: ce(1945),
      description:
        "Factories, coal, steam transport, and industrial war transform work, cities, and state power.",
      scheme: "world-history",
      sourceRefs: [
        { sourceId: "historyIndustrialRevolution" },
        { sourceId: "historyMeijiRestoration" },
        { sourceId: "historyWorldWarOne" },
      ],
    },
    {
      id: "contemporary-history",
      name: "Contemporary History",
      startYear: ce(1945),
      endYear: CURRENT_YEAR,
      color: "rgb(0, 120, 100)",
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
          description:
            "The web, personal computing, and mobile networks tighten global connections across culture, finance, and politics.",
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
          ],
        },
      ],
    },
  ],
};
