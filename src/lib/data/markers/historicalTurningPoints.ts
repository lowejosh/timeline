import type { TimelineMarker } from "../timelineTypes";
import { getTimelineYearFromUtcParts } from "../../time/bands";

export const HISTORICAL_TURNING_POINT_MARKERS: TimelineMarker[] = [
  {
    id: "gobekli-tepe-monuments",
    label: "Göbekli Tepe monuments",
    shortLabel: "Göbekli Tepe",
    year: -9_600,
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
    year: -9_500,
    regionalScopeLabel: "Southwest Asia",
    approximate: true,
    minZoom: 19,
    priority: 81,
    sourceRefs: [
      {
        sourceId: "britannicaOriginAgriculture",
        note: "Britannica places the beginnings of agriculture broadly between 15,000 and 10,000 years before present and emphasizes regional independence; the app uses c. 9500 BCE as a cautious Southwest Asia anchor rather than a universal global start date.",
      },
      {
        sourceId: "khanNeolithicRevolution",
        note: "Khan Academy frames the Neolithic Revolution at roughly 11,500–5,000 years ago, supporting a mid-10th-millennium BCE marker for early Southwest Asian farming.",
      },
    ],
  },
  {
    id: "catalhoyuk-settled-farming-community",
    label: "Çatalhöyük settled farming community",
    shortLabel: "Çatalhöyük",
    year: -7_400,
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
    year: -7_200,
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
    year: -3_000,
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
    year: -1_200,
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
    year: -27,
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
    year: 476,
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
    year: 622,
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
    year: 800,
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
    year: 1206,
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
    year: 1347,
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
    year: 1453,
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
    year: 1450,
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
    year: 1492,
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
    year: 1517,
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
    year: 1776,
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
    year: 1789,
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
    id: "titanic-sinks",
    label: "Titanic sinks in North Atlantic",
    shortLabel: "Titanic Sinks",
    year: getTimelineYearFromUtcParts(1912, 3, 15, 2, 20),
    dateLabel: "Apr 15, 1912",
    timeLabel: "Apr 15, 1912, 2:20 AM UTC",
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
    year: 1914,
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
    year: 1917,
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
    year: 1939,
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
    id: "apollo-11-moon-landing",
    label: "Apollo 11 Moon landing",
    shortLabel: "Moon Landing",
    year: 1969,
    minZoom: 20,
    priority: 79,
    sourceRefs: [
      {
        sourceId: "historyMoonLanding",
        note: "HISTORY dates the Apollo 11 moon landing to July 20, 1969, when Armstrong and Aldrin became the first humans to land on the Moon.",
      },
    ],
  },
];
