import type { EraSourceId } from "./eraSources";

export type EraSourceRef = {
  sourceId: EraSourceId;
  note?: string;
};

export type EraScheme =
  | "app-canonical"
  | "cosmic"
  | "chronostratigraphic"
  | "world-history"
  | "archaeological";

export type Era = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
  scheme?: EraScheme;
  sourceRefs?: EraSourceRef[];
  children?: Era[];
};

type EraDefinition = Omit<Era, "color" | "children"> & {
  color?: string;
  children?: EraDefinition[];
};

/** Find an era by id anywhere in the tree */
export function findEraById(era: Era, id: string): Era | undefined {
  if (era.id === id) return era;
  for (const child of era.children ?? []) {
    const found = findEraById(child, id);
    if (found) return found;
  }
  return undefined;
}

/** Get the ancestor chain from root to the target id (inclusive) */
export function getAncestorChain(root: Era, targetId: string): Era[] {
  if (root.id === targetId) return [root];
  for (const child of root.children ?? []) {
    const chain = getAncestorChain(child, targetId);
    if (chain.length > 0) return [root, ...chain];
  }
  return [];
}

const CURRENT_YEAR = new Date().getFullYear();

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function hslToRgba(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number,
): string {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = hue / 60;
  const x = c * (1 - Math.abs((h % 2) - 1));

  let red = 0;
  let green = 0;
  let blue = 0;

  if (h >= 0 && h < 1) {
    red = c;
    green = x;
  } else if (h < 2) {
    red = x;
    green = c;
  } else if (h < 3) {
    green = c;
    blue = x;
  } else if (h < 4) {
    green = x;
    blue = c;
  } else if (h < 5) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  const m = l - c / 2;
  const toChannel = (channel: number) => Math.round((channel + m) * 255);

  return `rgba(${toChannel(red)}, ${toChannel(green)}, ${toChannel(blue)}, ${alpha.toFixed(2)})`;
}

export function getSeededEraColor(seed: string, alpha = 0.42): string {
  const hash = hashString(seed);
  const hue = hash % 360;
  const saturation = 68 + ((hash >>> 8) % 18);
  const lightness = 52 + ((hash >>> 16) % 10);

  return hslToRgba(hue, saturation, lightness, alpha);
}

function materializeEra(definition: EraDefinition): Era {
  return {
    ...definition,
    color: definition.color ?? getSeededEraColor(definition.id),
    children: definition.children?.map(materializeEra),
  };
}

export const ROOT_ERA: Era = materializeEra({
  id: "universe",
  name: "Universe",
  startYear: -13_800_000_000,
  endYear: CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "app-canonical",
  sourceRefs: [
    {
      sourceId: "nasaUniverseOverview",
      note: "Universe age rounded to 13.8 billion years ago.",
    },
  ],
  children: [
    {
      id: "primordial-universe",
      name: "Primordial Universe",
      startYear: -13_800_000_000,
      endYear: -13_600_000_000,
      scheme: "cosmic",
      sourceRefs: [
        {
          sourceId: "nasaUniverseOverview",
          note: "Broad app band covering inflation, the big bang, nucleosynthesis, recombination, and the cosmic dark ages up to roughly 200 million years after the Big Bang.",
        },
      ],
    },
    {
      id: "cosmic-dawn",
      name: "Cosmic Dawn",
      startYear: -13_600_000_000,
      endYear: -12_800_000_000,
      scheme: "cosmic",
      sourceRefs: [
        {
          sourceId: "nasaUniverseOverview",
          note: "NASA places the first stars after about 200 million years and says reionization is largely complete by the time the universe is about 1 billion years old.",
        },
        {
          sourceId: "nasaStarBasics",
          note: "Adds general context for star formation from collapsing clouds of gas and dust.",
        },
      ],
    },
    {
      id: "galaxies-take-shape",
      name: "Galaxies Take Shape",
      startYear: -12_800_000_000,
      endYear: -4_567_000_000,
      scheme: "cosmic",
      sourceRefs: [
        {
          sourceId: "nasaUniverseOverview",
          note: "This band begins after reionization, when the universe has become transparent to light in the way we observe today.",
        },
        {
          sourceId: "nasaGalaxyBasics",
          note: "NASA notes that most galaxies are roughly 10 to 13.6 billion years old; this broad app band covers the long era of galaxy growth and evolution before our solar system forms.",
        },
        {
          sourceId: "nasaSolarSystemFacts",
          note: "Ends when the solar system forms about 4.6 billion years ago.",
        },
      ],
    },
    {
      id: "hadean",
      name: "Hadean",
      startYear: -4_567_000_000,
      endYear: -4_000_000_000,
      scheme: "chronostratigraphic",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    },
    {
      id: "archean",
      name: "Archean",
      startYear: -4_000_000_000,
      endYear: -2_500_000_000,
      scheme: "chronostratigraphic",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    },
    {
      id: "proterozoic",
      name: "Proterozoic",
      startYear: -2_500_000_000,
      endYear: -538_800_000,
      scheme: "chronostratigraphic",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    },
    {
      id: "paleozoic",
      name: "Paleozoic",
      startYear: -538_800_000,
      endYear: -251_902_000,
      scheme: "chronostratigraphic",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    },
    {
      id: "mesozoic",
      name: "Mesozoic",
      startYear: -251_902_000,
      endYear: -66_000_000,
      scheme: "chronostratigraphic",
      sourceRefs: [{ sourceId: "icsChart2024" }],
    },
    {
      id: "cenozoic",
      name: "Cenozoic",
      startYear: -66_000_000,
      endYear: -300_000,
      scheme: "chronostratigraphic",
      sourceRefs: [
        {
          sourceId: "icsChart2024",
          note: "The formal Cenozoic continues to the present; this app-level segment stops at the human-history handoff.",
        },
      ],
    },
    {
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
          scheme: "world-history",
          sourceRefs: [{ sourceId: "brivatiContemporary" }],
        },
      ],
    },
  ],
});
