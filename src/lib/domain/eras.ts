import { COSMIC_ERA_DEFINITIONS } from "./eraTrees/cosmic";
import { GEOLOGICAL_ERA_DEFINITIONS } from "./eraTrees/geological";
import { HUMAN_HISTORY_ERA_DEFINITIONS } from "./eraTrees/humanHistory";
import { PHYSICS_HISTORY_ERA_DEFINITIONS } from "./eraTrees/physicsHistory";
import { TIMELINE_DISPLAY } from "../catalog/decorations";
import {
  getEffectiveTimelinePriority,
  getSetIdForEraFamily,
} from "../catalog/timelineSets";
import { TIMELINE_MAX_YEAR, TIMELINE_MIN_YEAR } from "../core/timelineYears";
import type {
  Era,
  EraDefinition,
  EraFamilyId,
  RootTimelineData,
  TimelineEraFamilyConfig,
  TimelineSetId,
} from "../core/timelineTypes";

export type {
  Era,
  EraDefinition,
  EraFamilyId,
  EraScheme,
  RootTimelineData,
  TimelineDisplayConfig,
  TimelineEraFamilyConfig,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetId,
} from "../core/timelineTypes";
export { TIMELINE_DISPLAY } from "../catalog/decorations";

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

export function isEraFamilyRoot(era: Era): boolean {
  return era.isFamilyRoot === true;
}

export function compareEraPriorityAscending(left: Era, right: Era) {
  return (
    getEffectiveTimelinePriority(left) - getEffectiveTimelinePriority(right) ||
    left.startYear - right.startYear ||
    right.endYear - left.endYear ||
    left.id.localeCompare(right.id)
  );
}

export function compareEraPriorityDescending(left: Era, right: Era) {
  return (
    getEffectiveTimelinePriority(right) - getEffectiveTimelinePriority(left) ||
    left.startYear - right.startYear ||
    right.endYear - left.endYear ||
    left.id.localeCompare(right.id)
  );
}

export function getEraFamilyRoots(root: Era): Era[] {
  return (root.children ?? []).filter(isEraFamilyRoot);
}

export function getRootDisplayEras(root: Era): Era[] {
  return (root.children ?? []).flatMap((child) =>
    isEraFamilyRoot(child) ? (child.children ?? []) : [child],
  );
}

/**
 * Same as `getRootDisplayEras` but only emits eras whose owning set is present
 * in `enabledSetIds`. This covers both children of family roots and direct
 * top-level eras that still belong to a family (like flattened human history).
 * Family roots with no registered set are kept as a safe default.
 */
export function getRootDisplayErasBySets(
  root: Era,
  enabledSetIds: ReadonlySet<TimelineSetId>,
): Era[] {
  return (root.children ?? []).flatMap((child) => {
    if (!isEraFamilyRoot(child)) {
      const setId = child.familyId
        ? getSetIdForEraFamily(child.familyId)
        : null;

      if (setId && !enabledSetIds.has(setId)) {
        return [];
      }

      return [child];
    }
    const familyId = child.familyId;
    const setId = familyId ? getSetIdForEraFamily(familyId) : null;
    if (setId && !enabledSetIds.has(setId)) {
      return [];
    }
    return child.children ?? [];
  });
}

export function getEraDisplayChain(root: Era, targetId: string): Era[] {
  return getAncestorChain(root, targetId).filter(
    (era) => era.id === root.id || !isEraFamilyRoot(era),
  );
}

export function getNavigableAncestor(root: Era, targetId: string): Era | null {
  const chain = getAncestorChain(root, targetId);

  for (let index = chain.length - 2; index >= 0; index -= 1) {
    const candidate = chain[index];

    if (candidate.id === root.id || !isEraFamilyRoot(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function getEraFamilyId(
  root: Era,
  targetId: string,
): EraFamilyId | null {
  const targetEra = findEraById(root, targetId);

  return (
    getAncestorChain(root, targetId).find(
      (era) => era.id !== root.id && isEraFamilyRoot(era),
    )?.familyId ??
    (targetEra?.id !== root.id ? (targetEra?.familyId ?? null) : null)
  );
}

const CURRENT_YEAR = TIMELINE_MAX_YEAR;

export const TIMELINE_ERA_FAMILIES: TimelineEraFamilyConfig[] = [
  {
    id: "cosmic",
    label: "Cosmic History",
    description: "Universe-scale eras before Earth forms.",
    order: 0,
    priority: 100,
    defaultEnabled: true,
  },
  {
    id: "geological",
    label: "Geological History",
    description: "Earth-system and chronostratigraphic eras.",
    order: 1,
    priority: 200,
    defaultEnabled: true,
  },
  {
    id: "human-history",
    label: "Human History",
    description: "Archaeological and world-history eras.",
    order: 2,
    priority: 300,
    defaultEnabled: true,
  },
  {
    id: "physics-history",
    label: "History of Physics",
    description:
      "Historical ages for major shifts in physical thought and discovery.",
    order: 3,
    priority: 350,
    defaultEnabled: false,
  },
];

const ERA_FAMILY_CONFIG_BY_ID = new Map(
  TIMELINE_ERA_FAMILIES.map((family) => [family.id, family]),
);

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function hslToRgb(hue: number, saturation: number, lightness: number): string {
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

  return `rgb(${toChannel(red)}, ${toChannel(green)}, ${toChannel(blue)})`;
}

export function getSeededEraColor(seed: string): string {
  const hash = hashString(seed);
  const hue = hash % 360;
  const saturation = 68 + ((hash >>> 8) % 18);
  const lightness = 52 + ((hash >>> 16) % 10);

  return hslToRgb(hue, saturation, lightness);
}

function materializeEra(
  definition: EraDefinition,
  inheritedFamilyId?: EraFamilyId,
  inheritedPriority?: number,
): Era {
  const familyId = definition.familyId ?? inheritedFamilyId;
  const familyPriority =
    familyId !== undefined
      ? ERA_FAMILY_CONFIG_BY_ID.get(familyId)?.priority
      : undefined;
  const priority = definition.priority ?? inheritedPriority ?? familyPriority;

  return {
    ...definition,
    familyId,
    priority,
    color: definition.color ?? getSeededEraColor(definition.id),
    children: definition.children?.map((child) =>
      materializeEra(child, familyId, priority),
    ),
  };
}

const COSMIC_FAMILY_ROOT_DEFINITION: EraDefinition = {
  id: "cosmic-history",
  name: "Cosmic History",
  startYear: COSMIC_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    COSMIC_ERA_DEFINITIONS[COSMIC_ERA_DEFINITIONS.length - 1]?.endYear ??
    CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "cosmic",
  familyId: "cosmic",
  priority: ERA_FAMILY_CONFIG_BY_ID.get("cosmic")?.priority,
  isFamilyRoot: true,
  children: COSMIC_ERA_DEFINITIONS,
};

const GEOLOGICAL_FAMILY_ROOT_DEFINITION: EraDefinition = {
  id: "geological-history",
  name: "Geological History",
  startYear: GEOLOGICAL_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    GEOLOGICAL_ERA_DEFINITIONS[GEOLOGICAL_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "chronostratigraphic",
  familyId: "geological",
  priority: ERA_FAMILY_CONFIG_BY_ID.get("geological")?.priority,
  isFamilyRoot: true,
  children: GEOLOGICAL_ERA_DEFINITIONS,
};

const PHYSICS_FAMILY_ROOT_DEFINITION: EraDefinition = {
  id: "physics-history",
  name: "History of Physics",
  startYear: PHYSICS_HISTORY_ERA_DEFINITIONS[0]?.startYear ?? TIMELINE_MIN_YEAR,
  endYear:
    PHYSICS_HISTORY_ERA_DEFINITIONS[PHYSICS_HISTORY_ERA_DEFINITIONS.length - 1]
      ?.endYear ?? CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "history-of-science",
  familyId: "physics-history",
  priority: ERA_FAMILY_CONFIG_BY_ID.get("physics-history")?.priority,
  isFamilyRoot: true,
  children: PHYSICS_HISTORY_ERA_DEFINITIONS,
};

const HUMAN_HISTORY_TOP_LEVEL_DEFINITIONS: EraDefinition[] =
  HUMAN_HISTORY_ERA_DEFINITIONS.map((definition) => ({
    ...definition,
    familyId: "human-history",
    priority: ERA_FAMILY_CONFIG_BY_ID.get("human-history")?.priority,
  }));

export const ROOT_ERA: Era = materializeEra({
  id: "universe",
  name: "Universe",
  startYear: TIMELINE_MIN_YEAR,
  endYear: CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "app-canonical",
  sourceIds: ["nasaUniverseOverview"],
  children: [
    COSMIC_FAMILY_ROOT_DEFINITION,
    GEOLOGICAL_FAMILY_ROOT_DEFINITION,
    PHYSICS_FAMILY_ROOT_DEFINITION,
    ...HUMAN_HISTORY_TOP_LEVEL_DEFINITIONS,
  ],
});

export const ROOT_TIMELINE: RootTimelineData = {
  rootEra: ROOT_ERA,
  display: TIMELINE_DISPLAY,
};
