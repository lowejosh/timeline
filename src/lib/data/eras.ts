import { COSMIC_ERA_DEFINITIONS } from "./eraTrees/cosmic";
import { GEOLOGICAL_ERA_DEFINITIONS } from "./eraTrees/geological";
import { HUMAN_HISTORY_ERA_DEFINITION } from "./eraTrees/humanHistory";
import { CLASSICAL_ANTIQUITY_MARKERS } from "./markers/classicalAntiquity";
import { CORE_TIMELINE_MARKERS } from "./markers/core";
import { HISTORICAL_TURNING_POINT_MARKERS } from "./markers/historicalTurningPoints";
import { POST_CLASSICAL_MARKERS } from "./markers/postClassical";
import { ANCIENT_CIVILIZATION_OVERLAYS } from "./overlays/ancientCivilizations";
import { POST_CLASSICAL_EARLY_MODERN_OVERLAYS } from "./overlays/postClassicalEarlyModern";
import type {
  Era,
  EraDefinition,
  RootTimelineData,
  TimelineDisplayConfig,
  TimelineSourceRef,
} from "./timelineTypes";

export type {
  Era,
  EraDefinition,
  EraScheme,
  RootTimelineData,
  TimelineDisplayConfig,
  TimelineMarker,
  TimelineOverlayBand,
} from "./timelineTypes";

export type EraSourceRef = TimelineSourceRef;

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
    ...COSMIC_ERA_DEFINITIONS,
    ...GEOLOGICAL_ERA_DEFINITIONS,
    HUMAN_HISTORY_ERA_DEFINITION,
  ],
});

const TIMELINE_MARKERS = [
  ...CORE_TIMELINE_MARKERS,
  ...HISTORICAL_TURNING_POINT_MARKERS,
  ...CLASSICAL_ANTIQUITY_MARKERS,
  ...POST_CLASSICAL_MARKERS,
].sort(
  (left, right) =>
    left.year - right.year ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id),
);

const TIMELINE_OVERLAYS = [
  ...ANCIENT_CIVILIZATION_OVERLAYS,
  ...POST_CLASSICAL_EARLY_MODERN_OVERLAYS,
].sort(
  (left, right) =>
    left.startYear - right.startYear ||
    left.endYear - right.endYear ||
    (right.priority ?? 0) - (left.priority ?? 0) ||
    left.id.localeCompare(right.id),
);

export const TIMELINE_DISPLAY: TimelineDisplayConfig = {
  markers: TIMELINE_MARKERS,
  overlays: TIMELINE_OVERLAYS,
};

export const ROOT_TIMELINE: RootTimelineData = {
  rootEra: ROOT_ERA,
  display: TIMELINE_DISPLAY,
};
