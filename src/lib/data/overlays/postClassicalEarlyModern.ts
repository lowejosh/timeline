import type { TimelineOverlayBand } from "../timelineTypes";

const POST_CLASSICAL_GROUP_ID = "post-classical-early-modern";
const POST_CLASSICAL_MIN_ZOOM = 18;

export const POST_CLASSICAL_EARLY_MODERN_OVERLAYS: TimelineOverlayBand[] = [
  {
    id: "byzantine-empire",
    label: "Byzantine Empire",
    shortLabel: "Byzantium",
    startYear: 330,
    endYear: 1453,
    color: "rgb(96, 109, 170)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 76,
    groupId: POST_CLASSICAL_GROUP_ID,
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
    startYear: 750,
    endYear: 1258,
    color: "rgb(78, 133, 99)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 75,
    groupId: POST_CLASSICAL_GROUP_ID,
    sourceRefs: [
      {
        sourceId: "khanGoldenAgeOfIslam",
        note: "Uses Khan Academy's Abbasid-era framing and 750–1258 political span for a clean post-classical caliphal band.",
      },
    ],
  },
  {
    id: "song-china",
    label: "Song China",
    shortLabel: "Song",
    startYear: 960,
    endYear: 1279,
    color: "rgb(82, 130, 156)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 74,
    groupId: POST_CLASSICAL_GROUP_ID,
    sourceRefs: [
      {
        sourceId: "khanSongChina",
        note: "Uses the standard Song dynasty span of 960–1279 highlighted by Khan Academy's 'Prosperity in Song China' lesson.",
      },
    ],
  },
  {
    id: "mongol-empire",
    label: "Mongol Empire",
    shortLabel: "Mongols",
    startYear: 1206,
    endYear: 1368,
    color: "rgb(134, 108, 84)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 78,
    groupId: POST_CLASSICAL_GROUP_ID,
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
    id: "ottoman-empire",
    label: "Ottoman Empire",
    shortLabel: "Ottomans",
    startYear: 1299,
    endYear: 1800,
    color: "rgb(111, 137, 92)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 77,
    groupId: POST_CLASSICAL_GROUP_ID,
    sourceRefs: [
      {
        sourceId: "historyOttomanEmpire",
        note: "Uses the Ottoman state's conventional 1299 origin, but clips the display band at 1800 so this overlay family stays bounded to the app's early-modern window; the polity continued until 1922.",
      },
    ],
  },
  {
    id: "ming-dynasty",
    label: "Ming Dynasty",
    shortLabel: "Ming",
    startYear: 1368,
    endYear: 1644,
    color: "rgb(163, 95, 86)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 73,
    groupId: POST_CLASSICAL_GROUP_ID,
    sourceRefs: [
      {
        sourceId: "historyMingDynasty",
        note: "Uses the standard Ming dynasty span from the dynasty's founding in 1368 to the Qing takeover in 1644.",
      },
    ],
  },
  {
    id: "aztec-empire",
    label: "Aztec Empire",
    shortLabel: "Aztecs",
    startYear: 1428,
    endYear: 1521,
    color: "rgb(160, 121, 68)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 71,
    groupId: POST_CLASSICAL_GROUP_ID,
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
    startYear: 1438,
    endYear: 1572,
    color: "rgb(182, 135, 78)",
    minZoom: POST_CLASSICAL_MIN_ZOOM,
    priority: 70,
    groupId: POST_CLASSICAL_GROUP_ID,
    sourceRefs: [
      {
        sourceId: "historyInca",
        note: "Uses Pachacuti's mid-15th-century imperial expansion as the clean starting point and the fall of Vilcabamba in 1572 as the endpoint.",
      },
    ],
  },
];