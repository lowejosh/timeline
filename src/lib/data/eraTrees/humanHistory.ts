import type { EraDefinition } from "../timelineTypes";

const CURRENT_YEAR = new Date().getFullYear();

export const HUMAN_HISTORY_ERA_DEFINITION: EraDefinition = {
  id: "human-history",
  name: "Human History",
  startYear: -300_000,
  endYear: CURRENT_YEAR,
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
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "periodo" }],
        },
        {
          id: "pre-pottery-neolithic-b",
          name: "Pre-Pottery Neolithic B",
          startYear: -8_800,
          endYear: -6_500,
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "khanNeolithicRevolution" }],
        },
        {
          id: "pottery-neolithic",
          name: "Pottery Neolithic",
          startYear: -6_500,
          endYear: -4_500,
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
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
        },
        {
          id: "middle-bronze-age",
          name: "Middle Bronze Age",
          startYear: -2_000,
          endYear: -1_550,
          scheme: "archaeological",
          sourceRefs: [{ sourceId: "britannicaBronzeAge" }],
        },
        {
          id: "late-bronze-age",
          name: "Late Bronze Age",
          startYear: -1_550,
          endYear: -1_200,
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
      scheme: "archaeological",
      sourceRefs: [
        {
          sourceId: "britannicaMiddleEast",
          note: "Used in the broad ancient Near East sense up to the end of the Neo-Babylonian period and the Achaemenid takeover.",
        },
      ],
    },
    {
      id: "classical-antiquity",
      name: "Classical Antiquity",
      startYear: -539,
      endYear: 500,
      scheme: "world-history",
      sourceRefs: [{ sourceId: "stearnsPeriodization" }],
    },
    {
      id: "post-classical-history",
      name: "Post-classical History",
      startYear: 500,
      endYear: 1500,
      scheme: "world-history",
      sourceRefs: [{ sourceId: "stearnsPeriodization" }],
    },
    {
      id: "early-modern-period",
      name: "Early Modern Period",
      startYear: 1500,
      endYear: 1800,
      scheme: "world-history",
      sourceRefs: [{ sourceId: "bentleyEarlyModern" }],
    },
    {
      id: "age-of-industry-and-empire",
      name: "Age of Industry & Empire",
      startYear: 1800,
      endYear: 1945,
      scheme: "world-history",
      sourceRefs: [
        {
          sourceId: "stearnsPeriodization",
          note: "The app ends this world-history band at 1945 to keep contemporary history distinct and non-overlapping.",
        },
      ],
    },
    {
      id: "contemporary-history",
      name: "Contemporary History",
      startYear: 1945,
      endYear: CURRENT_YEAR,
      color: "rgba(0, 120, 100, 0.3)",
      scheme: "world-history",
      sourceRefs: [{ sourceId: "brivatiContemporary" }],
    },
  ],
};
