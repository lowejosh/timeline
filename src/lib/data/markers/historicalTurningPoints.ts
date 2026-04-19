import type { TimelineMarker } from "../timelineTypes";
import {
  createExactCalendarTimestamp,
  getTimelineYearFromExactTimestamp,
} from "../../time/exactTimestamp";
import { bce, ce } from "../timelineDateBuilders";

const TITANIC_SINKS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1912,
  month: 4,
  day: 15,
  hour: 2,
  minute: 20,
  precision: "minute",
});

const UN_DECOLONIZATION_DECLARATION_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1960,
  month: 12,
  day: 14,
  precision: "day",
});

const BERLIN_WALL_FALLS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1989,
  month: 11,
  day: 9,
  precision: "day",
});

const SOVIET_UNION_DISSOLVES_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1991,
  month: 12,
  day: 31,
  precision: "day",
});

const WORLD_WIDE_WEB_OPENED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1993,
  month: 4,
  day: 30,
  precision: "day",
});

const COVID_19_PANDEMIC_DECLARED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2020,
  month: 3,
  day: 11,
  precision: "day",
});

const UNITED_NATIONS_FOUNDED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1945,
  month: 10,
  day: 24,
  precision: "day",
});

const UDHR_PROCLAIMED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1948,
  month: 12,
  day: 10,
  precision: "day",
});

const NATO_FOUNDED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1949,
  month: 4,
  day: 4,
  precision: "day",
});

const FIRST_HUMAN_IN_SPACE_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1961,
  month: 4,
  day: 12,
  precision: "day",
});

const CUBAN_MISSILE_CRISIS_RESOLVED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 1962,
  month: 10,
  day: 28,
  precision: "day",
});

const SEPTEMBER_11_ATTACKS_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2001,
  month: 9,
  day: 11,
  precision: "day",
});

const LEHMAN_BROTHERS_BANKRUPTCY_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2008,
  month: 9,
  day: 15,
  precision: "day",
});

const PARIS_AGREEMENT_ADOPTED_AT = createExactCalendarTimestamp({
  era: "ce",
  year: 2015,
  month: 12,
  day: 12,
  precision: "day",
});

export const HISTORICAL_TURNING_POINT_MARKERS: TimelineMarker[] = [
  {
    id: "gobekli-tepe-monuments",
    label: "Göbekli Tepe monuments",
    shortLabel: "Göbekli Tepe",
    year: bce(9_600),
    regionalScopeLabel: "Southeastern Anatolia",
    approximate: true,
    minZoom: 19,
    priority: 69,
    sourceRefs: [
      {
        sourceId: "unescoGobekliTepe",
        note: "UNESCO dates Göbekli Tepe's monumental Pre-Pottery Neolithic structures to 9600–8200 BCE; the app uses c. 9600 BCE as a clean anchor for very early monumental ritual architecture.",
      },
    ],
  },
  {
    id: "agriculture-emerges-in-southwest-asia",
    label: "Agriculture emerges in Southwest Asia",
    shortLabel: "Early Agriculture",
    description:
      "Southwest Asian communities had entered a long agricultural transition, with cultivation preceding the appearance of fully domesticated crops.",
    year: bce(10_000),
    regionalScopeLabel: "Southwest Asia",
    approximate: true,
    minZoom: 19,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "originsOfAgricultureInWestAsiaWikipedia",
        note: "The page explicitly says agriculture in West Asia can be traced back to between 10,000 and 8,000 BC; the marker now uses the opening date named by the source instead of an inferred midpoint.",
      },
      {
        sourceId: "prePotteryNeolithicAWikipedia",
        note: "PPNA is dated to c. 10,000–8,800 BCE in the Levant and Upper Mesopotamia and is explicitly characterized by crop cultivation and granaries, reinforcing 10,000 BCE as an early public-facing anchor for this marker.",
      },
    ],
  },
  {
    id: "catalhoyuk-settled-farming-community",
    label: "Çatalhöyük settled farming community",
    shortLabel: "Çatalhöyük",
    year: bce(7_400),
    regionalScopeLabel: "Anatolia",
    approximate: true,
    minZoom: 19,
    priority: 68,
    sourceRefs: [
      {
        sourceId: "unescoCatalhoyuk",
        note: "UNESCO dates the eastern mound's Neolithic occupation to 7400–6200 BCE and treats the site as a key witness to early settled agricultural life; the app uses its initial occupation as the marker year.",
      },
    ],
  },
  {
    id: "jericho-ritual-community",
    label: "Jericho ritual community",
    shortLabel: "Jericho",
    year: bce(7_200),
    regionalScopeLabel: "Levant",
    approximate: true,
    minZoom: 19,
    priority: 67,
    sourceRefs: [
      {
        sourceId: "khanNeolithicRevolution",
        note: "Khan Academy highlights Jericho plastered skulls around 7200 BCE in Pre-Pottery Neolithic B, making it a useful marker for ritual and settled community life in the Neolithic Levant.",
      },
    ],
  },
  {
    id: "stonehenge-begins",
    label: "Stonehenge construction begins",
    shortLabel: "Stonehenge",
    year: bce(3_000),
    regionalScopeLabel: "Southern Britain",
    approximate: true,
    minZoom: 19,
    priority: 66,
    sourceRefs: [
      {
        sourceId: "unescoStonehenge",
        note: "UNESCO dates the broader Stonehenge and Avebury ceremonial landscape to roughly 3700–1600 BCE; the app uses c. 3000 BCE as a familiar late-Neolithic anchor for the beginning of Stonehenge's monument-building phases.",
      },
      {
        sourceId: "khanNeolithicRevolution",
        note: "Khan Academy describes Stonehenge as dating to approximately 3000 BCE, supporting its use here as an iconic marker for the start of Stonehenge's construction history.",
      },
    ],
  },
  {
    id: "bronze-age-collapse",
    label: "Bronze Age collapse",
    shortLabel: "Bronze Age Collapse",
    year: bce(1_200),
    regionalScopeLabel: "Eastern Mediterranean",
    approximate: true,
    minZoom: 18,
    priority: 78,
    sourceRefs: [
      {
        sourceId: "britannicaBronzeAge",
        note: "Britannica treats the Bronze Age's end as regionally variable; the app uses c. 1200 BCE as a conventional eastern Mediterranean collapse marker rather than a single-day event.",
      },
      {
        sourceId: "britannicaAncientGreece",
        note: "Britannica dates ancient Greek civilization from the end of Mycenaean civilization around 1200 BCE, which anchors this marker to the standard late-Bronze / early-Iron Age transition used here.",
      },
    ],
  },
  {
    id: "augustus-becomes-emperor",
    label: "Augustus becomes first emperor",
    shortLabel: "Augustus becomes emperor",
    year: bce(27),
    minZoom: 18,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates Octavian's assumption of the title Augustus to 27 BCE, the conventional beginning of the Roman Empire.",
      },
      {
        sourceId: "khanRomanEmpire",
        note: "Supports the conventional 27 BCE imperial starting point under Augustus used by the app.",
      },
    ],
  },
  {
    id: "fall-of-western-rome",
    label: "Fall of Western Rome",
    shortLabel: "Western Rome Falls",
    year: ce(476),
    minZoom: 18,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "historyAncientRome",
        note: "HISTORY dates the deposition of Romulus Augustulus by Odovacar to 476 CE, the standard public-history endpoint for the western Roman Empire.",
      },
    ],
  },
  {
    id: "hijra",
    label: "Muhammad's migration to Medina",
    shortLabel: "Migration to Medina",
    year: ce(622),
    minZoom: 18,
    priority: 82,
    sourceRefs: [
      {
        sourceId: "historyIslam",
        note: "HISTORY dates Muhammad's migration from Mecca to Medina to 622 CE and identifies that journey, the Hijra, as the beginning of the Islamic calendar.",
      },
    ],
  },
  {
    id: "charlemagne-crowned-emperor",
    label: "Charlemagne crowned Holy Roman Emperor",
    shortLabel: "Holy Roman Emperor",
    year: ce(800),
    minZoom: 18,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "historyCharlemagne",
        note: "HISTORY dates Charlemagne's coronation by Pope Leo III to December 25, 800 and frames it as the start of his rule as Holy Roman Emperor.",
      },
    ],
  },
  {
    id: "genghis-khan-proclaimed",
    label: "Genghis Khan proclaimed ruler",
    shortLabel: "Mongol Empire Begins",
    year: ce(1206),
    minZoom: 18,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "historyGenghisKhan",
        note: "HISTORY says Temujin was proclaimed Chinggis Khan in 1206 after unifying the Mongol steppe tribes, a clean threshold into the Mongol imperial era.",
      },
    ],
  },
  {
    id: "black-death",
    label: "Black Death reaches Europe",
    shortLabel: "Black Death",
    year: ce(1347),
    minZoom: 18,
    priority: 80,
    sourceRefs: [
      {
        sourceId: "historyBlackDeath",
        note: "HISTORY anchors the Black Death's arrival in Europe to 1347, when plague ships reached Messina.",
      },
    ],
  },
  {
    id: "fall-of-constantinople",
    label: "Fall of Constantinople",
    shortLabel: "Constantinople",
    year: ce(1453),
    minZoom: 18,
    priority: 82,
    sourceRefs: [
      {
        sourceId: "historyByzantineEmpire",
        note: "HISTORY dates the Ottoman capture of Constantinople to May 29, 1453; the app uses 1453 as the year marker.",
      },
    ],
  },
  {
    id: "gutenberg-press",
    label: "Gutenberg press",
    shortLabel: "Printing Press",
    year: ce(1450),
    minZoom: 20,
    priority: 72,
    sourceRefs: [
      {
        sourceId: "historyPrintingPress",
        note: "HISTORY says Gutenberg had a printing machine perfected and commercially ready by 1450; the app uses that year as the marker anchor.",
      },
    ],
  },
  {
    id: "columbian-exchange-begins",
    label: "Columbian Exchange begins",
    shortLabel: "Columbian Exchange",
    year: ce(1492),
    minZoom: 18,
    priority: 84,
    sourceRefs: [
      {
        sourceId: "historyChristopherColumbus",
        note: "HISTORY dates Columbus's first Atlantic voyage and Caribbean landfall to 1492; the app uses that canonical year as a shorthand marker for the beginning of sustained transatlantic exchange.",
      },
    ],
  },
  {
    id: "protestant-reformation",
    label: "Protestant Reformation",
    shortLabel: "Reformation",
    year: ce(1517),
    minZoom: 18,
    priority: 85,
    sourceRefs: [
      {
        sourceId: "historyReformation",
        note: "HISTORY says historians usually date the start of the Protestant Reformation to Luther's 1517 publication of the 95 Theses.",
      },
    ],
  },
  {
    id: "american-independence-declared",
    label: "American independence declared",
    shortLabel: "American Independence",
    year: ce(1776),
    minZoom: 20,
    priority: 75,
    sourceRefs: [
      {
        sourceId: "historyAmericanRevolution",
        note: "HISTORY places the Declaration of Independence on July 4, 1776; the app uses that year as a concise American Revolution marker.",
      },
    ],
  },
  {
    id: "french-revolution",
    label: "French Revolution begins",
    shortLabel: "French Revolution",
    year: ce(1789),
    minZoom: 18,
    priority: 86,
    sourceRefs: [
      {
        sourceId: "historyFrenchRevolution",
        note: "HISTORY identifies 1789 as the beginning of the French Revolution and treats the storming of the Bastille that year as its symbolic start.",
      },
    ],
  },
  {
    id: "berlin-conference-opens",
    label: "Berlin Conference opens",
    shortLabel: "Scramble for Africa",
    description:
      "European powers met in Berlin to reconcile rival claims in Africa and set rules that accelerated colonial partition across most of the continent.",
    year: ce(1884),
    regionalScopeLabel: "Africa",
    minZoom: 18,
    priority: 84,
    sourceRefs: [
      {
        sourceId: "britannicaScrambleForAfrica",
        note: "Britannica's Scramble for Africa article says Bismarck's proposal led to the Berlin Conference held from November 15, 1884, to February 26, 1885, and that the conference formalized claims and accelerated the pace of colonization; the app uses the conference opening in 1884 as a clean marker anchor.",
      },
    ],
  },
  {
    id: "titanic-sinks",
    label: "Titanic sinks in North Atlantic",
    shortLabel: "Titanic Sinks",
    year: getTimelineYearFromExactTimestamp(TITANIC_SINKS_AT),
    exactTime: TITANIC_SINKS_AT,
    dateLabel: "Apr 15, 1912",
    minZoom: 20,
    priority: 77,
    sourceRefs: [
      {
        sourceId: "britannicaTitanic",
        note: "Britannica dates Titanic's sinking to April 15, 1912 in the North Atlantic and standard ship histories place the final sinking at about 2:20 a.m.; the app uses that UTC instant as the marker anchor.",
      },
    ],
  },
  {
    id: "world-war-i",
    label: "World War I begins",
    shortLabel: "World War I",
    year: ce(1914),
    minZoom: 18,
    priority: 88,
    sourceRefs: [
      {
        sourceId: "historyWorldWarOne",
        note: "HISTORY dates the beginning of World War I to 1914, after the assassination of Archduke Franz Ferdinand escalated into general war.",
      },
    ],
  },
  {
    id: "russian-revolution",
    label: "Russian Revolution",
    shortLabel: "Russian Revolution",
    year: ce(1917),
    minZoom: 18,
    priority: 87,
    sourceRefs: [
      {
        sourceId: "historyRussianRevolution",
        note: "HISTORY identifies 1917 as the key date of the Russian Revolution, encompassing both the February and October revolutions.",
      },
    ],
  },
  {
    id: "world-war-ii",
    label: "World War II begins",
    shortLabel: "World War II",
    year: ce(1939),
    minZoom: 18,
    priority: 90,
    sourceRefs: [
      {
        sourceId: "historyWorldWarTwo",
        note: "HISTORY dates the start of World War II to 1939, when Nazi Germany invaded Poland.",
      },
    ],
  },
  {
    id: "united-nations-founded",
    label: "United Nations founded",
    shortLabel: "United Nations Founded",
    description:
      "The United Nations officially began after the UN Charter had been ratified by China, France, the Soviet Union, the United Kingdom, the United States, and a majority of other signatories.",
    year: getTimelineYearFromExactTimestamp(UNITED_NATIONS_FOUNDED_AT),
    exactTime: UNITED_NATIONS_FOUNDED_AT,
    dateLabel: "Oct 24, 1945",
    minZoom: 20,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "unHistoryUnitedNations",
        note: "The UN says it officially began on 24 October 1945, after the Charter had been ratified by the major powers and a majority of other signatories.",
      },
    ],
  },
  {
    id: "udhr-proclaimed",
    label: "Universal Declaration of Human Rights proclaimed",
    shortLabel: "UDHR Proclaimed",
    description:
      "The UN General Assembly proclaimed the Universal Declaration of Human Rights as a common standard of achievement for all peoples and all nations.",
    year: getTimelineYearFromExactTimestamp(UDHR_PROCLAIMED_AT),
    exactTime: UDHR_PROCLAIMED_AT,
    dateLabel: "Dec 10, 1948",
    minZoom: 20,
    priority: 78,
    sourceRefs: [
      {
        sourceId: "unUniversalDeclarationHumanRights",
        note: "The UN says the General Assembly proclaimed the UDHR in Paris on 10 December 1948 as a common standard of achievement for all peoples and all nations.",
      },
    ],
  },
  {
    id: "nato-founded",
    label: "NATO founded",
    shortLabel: "NATO",
    description:
      "Twelve countries signed the North Atlantic Treaty in Washington, D.C., establishing the alliance with collective defence at its heart.",
    year: getTimelineYearFromExactTimestamp(NATO_FOUNDED_AT),
    exactTime: NATO_FOUNDED_AT,
    dateLabel: "Apr 4, 1949",
    minZoom: 20,
    priority: 80,
    sourceRefs: [
      {
        sourceId: "natoFoundingTreaty",
        note: "NATO says 12 countries signed the North Atlantic Treaty in Washington, D.C., on 4 April 1949 and that collective defence is at the heart of the Treaty.",
      },
    ],
  },
  {
    id: "un-decolonization-declaration",
    label: "UN decolonization declaration adopted",
    shortLabel: "UN Decolonization Declaration",
    description:
      "The General Assembly adopted its landmark declaration affirming self-determination and calling for colonialism to be brought to a speedy and unconditional end.",
    year: getTimelineYearFromExactTimestamp(UN_DECOLONIZATION_DECLARATION_AT),
    exactTime: UN_DECOLONIZATION_DECLARATION_AT,
    dateLabel: "Dec 14, 1960",
    minZoom: 20,
    priority: 79,
    sourceRefs: [
      {
        sourceId: "unAntiColonialismDay",
        note: "The UN's anti-colonialism observance page identifies 14 December as the anniversary of Resolution 1514 (XV), the Declaration on the Granting of Independence to Colonial Countries and Peoples.",
      },
      {
        sourceId: "unDecolonization",
        note: "The UN calls the 1960 declaration a landmark in the decolonization process and links it to the acceleration of independence movements.",
      },
    ],
  },
  {
    id: "first-human-in-space",
    label: "First human orbits Earth",
    shortLabel: "First Human in Space",
    description:
      "Yuri Gagarin became the first human to travel into space and orbit Earth aboard Vostok 1.",
    year: getTimelineYearFromExactTimestamp(FIRST_HUMAN_IN_SPACE_AT),
    exactTime: FIRST_HUMAN_IN_SPACE_AT,
    dateLabel: "Apr 12, 1961",
    minZoom: 20,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "britannicaYuriGagarin",
        note: "Britannica says Gagarin's Vostok 1 spacecraft was launched on April 12, 1961, when he became the first man to travel into space and orbit Earth.",
      },
    ],
  },
  {
    id: "cuban-missile-crisis-resolved",
    label: "Cuban Missile Crisis de-escalates",
    shortLabel: "Cuban Missile Crisis",
    description:
      "Khrushchev publicly stated that Soviet missiles would be dismantled and removed from Cuba, ending the most dangerous U.S.-Soviet confrontation of the Cold War.",
    year: getTimelineYearFromExactTimestamp(CUBAN_MISSILE_CRISIS_RESOLVED_AT),
    exactTime: CUBAN_MISSILE_CRISIS_RESOLVED_AT,
    dateLabel: "Oct 28, 1962",
    minZoom: 20,
    priority: 82,
    sourceRefs: [
      {
        sourceId: "historyStateCubanMissileCrisis",
        note: "The State Department says Khrushchev issued a public statement on October 28, 1962, that Soviet missiles would be dismantled and removed from Cuba.",
      },
    ],
  },
  {
    id: "apollo-11-moon-landing",
    label: "Apollo 11 Moon landing",
    shortLabel: "Moon Landing",
    year: ce(1969),
    minZoom: 20,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "historyMoonLanding",
        note: "HISTORY dates the Apollo 11 moon landing to July 20, 1969, when Armstrong and Aldrin became the first humans to land on the Moon.",
      },
    ],
  },
  {
    id: "berlin-wall-falls",
    label: "Berlin Wall falls",
    shortLabel: "Berlin Wall Falls",
    description:
      "The East German government announced the opening of all East German borders, and the Wall's fall came to represent the end of the Cold War.",
    year: getTimelineYearFromExactTimestamp(BERLIN_WALL_FALLS_AT),
    exactTime: BERLIN_WALL_FALLS_AT,
    dateLabel: "Nov 9, 1989",
    minZoom: 20,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "historyStateFallCommunism",
        note: "The State Department dates the fall of the Berlin Wall to November 9, 1989 and frames it as the most visible symbol of the Cold War's collapse.",
      },
    ],
  },
  {
    id: "soviet-union-dissolves",
    label: "Soviet Union dissolves",
    shortLabel: "Soviet Union Dissolves",
    description:
      "The Soviet Union dissolved and was replaced by 15 independent countries.",
    year: getTimelineYearFromExactTimestamp(SOVIET_UNION_DISSOLVES_AT),
    exactTime: SOVIET_UNION_DISSOLVES_AT,
    dateLabel: "Dec 31, 1991",
    minZoom: 20,
    priority: 85,
    sourceRefs: [
      {
        sourceId: "britannicaSovietCollapse",
        note: "Britannica states that the Soviet Union dissolved on December 31, 1991, making it a clean endpoint for the Cold War world order.",
      },
    ],
  },
  {
    id: "world-wide-web-opened",
    label: "World Wide Web opened to the public",
    shortLabel: "Web Opens",
    description:
      "CERN put the World Wide Web software in the public domain, a move that allowed the web to flourish.",
    year: getTimelineYearFromExactTimestamp(WORLD_WIDE_WEB_OPENED_AT),
    exactTime: WORLD_WIDE_WEB_OPENED_AT,
    dateLabel: "Apr 30, 1993",
    minZoom: 20,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "cernBirthWeb",
        note: "CERN says that on April 30, 1993 it placed the World Wide Web software in the public domain, allowing the web to spread globally.",
      },
    ],
  },
  {
    id: "september-11-attacks",
    label: "September 11 attacks",
    shortLabel: "9/11 Attacks",
    description:
      "Al Qaeda terrorists hijacked four commercial passenger airplanes and carried out attacks on the World Trade Center, the Pentagon, and rural Pennsylvania.",
    year: getTimelineYearFromExactTimestamp(SEPTEMBER_11_ATTACKS_AT),
    exactTime: SEPTEMBER_11_ATTACKS_AT,
    dateLabel: "Sep 11, 2001",
    minZoom: 20,
    priority: 86,
    sourceRefs: [
      {
        sourceId: "historySeptember11Attacks",
        note: "HISTORY says the September 11 attacks occurred on September 11, 2001, when al Qaeda-linked hijackers seized four airliners and attacked targets in the United States.",
      },
    ],
  },
  {
    id: "lehman-brothers-bankruptcy",
    label: "2008 financial crisis",
    shortLabel: "2008 Financial Crisis",
    description:
      "Lehman Brothers filed for bankruptcy after heavy exposure to subprime mortgages and mortgage-backed securities, sending shock waves through global markets.",
    year: getTimelineYearFromExactTimestamp(LEHMAN_BROTHERS_BANKRUPTCY_AT),
    exactTime: LEHMAN_BROTHERS_BANKRUPTCY_AT,
    dateLabel: "Sep 15, 2008",
    minZoom: 20,
    priority: 83,
    sourceRefs: [
      {
        sourceId: "investopediaLehmanCollapse",
        note: "Investopedia dates Lehman's bankruptcy filing to September 15, 2008 and describes it as a pivotal moment in the financial crisis driven by heavy exposure to subprime mortgages and complex securities.",
      },
    ],
  },
  {
    id: "paris-agreement-adopted",
    label: "Paris Agreement adopted",
    shortLabel: "Paris Agreement",
    description:
      "World leaders reached the Paris Agreement, a breakthrough climate accord aimed at keeping warming well below 2°C while pursuing 1.5°C.",
    year: getTimelineYearFromExactTimestamp(PARIS_AGREEMENT_ADOPTED_AT),
    exactTime: PARIS_AGREEMENT_ADOPTED_AT,
    dateLabel: "Dec 12, 2015",
    minZoom: 20,
    priority: 80,
    sourceRefs: [
      {
        sourceId: "unParisAgreement",
        note: "The UN says world leaders reached the Paris Agreement on 12 December 2015 at COP21 in Paris.",
      },
    ],
  },
  {
    id: "covid-19-pandemic-declared",
    label: "WHO declares COVID-19 pandemic",
    shortLabel: "COVID-19 Pandemic",
    description:
      "WHO characterized the COVID-19 outbreak as a pandemic after cases spread rapidly to countries across the world.",
    year: getTimelineYearFromExactTimestamp(COVID_19_PANDEMIC_DECLARED_AT),
    exactTime: COVID_19_PANDEMIC_DECLARED_AT,
    dateLabel: "Mar 11, 2020",
    minZoom: 20,
    priority: 84,
    sourceRefs: [
      {
        sourceId: "whoCovid19Pandemic",
        note: "WHO says it characterized the COVID-19 outbreak as a pandemic on March 11, 2020.",
      },
    ],
  },
];
