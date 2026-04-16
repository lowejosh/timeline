import type { EraDefinition } from "../timelineTypes";
import { getPresentTimelineYear } from "../../time/present";

const CURRENT_YEAR = getPresentTimelineYear();

export const HUMAN_HISTORY_ERA_DEFINITION: EraDefinition = {
  id: "human-history",
  name: "Human History",
  startYear: -300_000,
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
      startYear: -300_000,
      endYear: -20_000,
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
      startYear: -20_000,
      endYear: -10_000,
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
      startYear: -10_000,
      endYear: -4_500,
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
          startYear: -10_000,
          endYear: -8_800,
          description:
            "Early village phase of cultivation experiments, communal buildings, and life before pottery.",
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "periodo" }],
        },
        {
          id: "pre-pottery-neolithic-b",
          name: "Pre-Pottery Neolithic B",
          startYear: -8_800,
          endYear: -6_500,
          description:
            "Larger farming communities with domesticated animals, plastered skulls, and expanding village architecture.",
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "khanNeolithicRevolution" }],
        },
        {
          id: "pottery-neolithic",
          name: "Pottery Neolithic",
          startYear: -6_500,
          endYear: -4_500,
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
      startYear: -4_500,
      endYear: -3_300,
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
      startYear: -3_300,
      endYear: -1_200,
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
          startYear: -3_300,
          endYear: -2_000,
          description:
            "First cities and fortified towns rise as urban life expands across the region.",
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
        },
        {
          id: "middle-bronze-age",
          name: "Middle Bronze Age",
          startYear: -2_000,
          endYear: -1_550,
          description:
            "Palace kingdoms, chariot warfare, and walled cities define a world of rival courts.",
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
        },
        {
          id: "late-bronze-age",
          name: "Late Bronze Age",
          startYear: -1_550,
          endYear: -1_200,
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
      startYear: -1_200,
      endYear: -539,
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
          startYear: -1_200,
          endYear: -900,
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
          startYear: -900,
          endYear: -609,
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
          startYear: -609,
          endYear: -539,
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
      startYear: -539,
      endYear: 500,
      description:
        "Greco-Roman age that shaped Mediterranean law, architecture, philosophy, and urban life.",
      scheme: "world-history",
      sourceRefs: [{ sourceId: "britannicaClassicalAntiquity" }],
    },
    {
      id: "post-classical-history",
      name: "Post-classical History",
      startYear: 500,
      endYear: 1500,
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
      startYear: 1500,
      endYear: 1800,
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
      startYear: 1800,
      endYear: 1945,
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
      startYear: 1945,
      endYear: CURRENT_YEAR,
      color: "rgb(0, 120, 100)",
      description:
        "Post-1945 world of decolonization, the Cold War, and accelerating globalization.",
      scheme: "world-history",
      sourceRefs: [
        { sourceId: "unDecolonization" },
        { sourceId: "historyColdWar" },
        { sourceId: "natGeoGlobalization" },
      ],
    },
  ],
};
