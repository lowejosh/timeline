import type { TimelineOverlayBand } from "../timelineTypes";

export const ANCIENT_CIVILIZATION_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "mesopotamia",
    label: "Mesopotamia",
    startYear: -3_500,
    endYear: -539,
    color: "rgba(180, 120, 70, 0.6)",
    minZoom: 0,
    priority: 95,
    groupId: "ancient-civilizations",
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
    color: "rgba(107, 136, 166, 0.6)",
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
    color: "rgba(166, 149, 94, 0.6)",
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
    id: "ancient-greece",
    label: "Ancient Greece",
    startYear: -1_200,
    endYear: -323,
    color: "rgba(93, 119, 183, 0.6)",
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
    color: "rgba(135, 92, 142, 0.6)",
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
    color: "rgba(159, 91, 70, 0.84)",
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
    color: "rgba(87, 142, 166, 0.6)",
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
    color: "rgba(72, 132, 108, 0.6)",
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
    color: "rgba(136, 78, 64, 0.84)",
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
