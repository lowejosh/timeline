import { TIMELINE_DISPLAY } from "./decorations";
import {
  getEffectiveTimelinePriority,
  getSetIdForEraFamily,
  TIMELINE_SETS,
} from "./timelineSets";
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
export { TIMELINE_DISPLAY } from "./decorations";

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

function toEraFamilyConfig(
  family: { root: EraDefinition } & TimelineEraFamilyConfig,
): TimelineEraFamilyConfig {
  return {
    id: family.id,
    label: family.label,
    description: family.description,
    order: family.order,
    priority: family.priority,
    defaultEnabled: family.defaultEnabled,
  };
}

export const TIMELINE_ERA_FAMILIES: TimelineEraFamilyConfig[] =
  TIMELINE_SETS.flatMap((set) => set.families.map(toEraFamilyConfig)).sort(
    (left, right) =>
      left.order - right.order || left.label.localeCompare(right.label),
  );

const ERA_FAMILY_CONFIG_BY_ID = new Map(
  TIMELINE_ERA_FAMILIES.map((family) => [family.id, family]),
);

const FAMILY_ROOT_DEFINITIONS: EraDefinition[] = TIMELINE_SETS.flatMap((set) =>
  set.families.map((family) => family.root),
).sort((left, right) => {
  const leftConfig = left.familyId
    ? ERA_FAMILY_CONFIG_BY_ID.get(left.familyId)
    : undefined;
  const rightConfig = right.familyId
    ? ERA_FAMILY_CONFIG_BY_ID.get(right.familyId)
    : undefined;

  return (
    (leftConfig?.order ?? Number.MAX_SAFE_INTEGER) -
      (rightConfig?.order ?? Number.MAX_SAFE_INTEGER) ||
    left.name.localeCompare(right.name)
  );
});

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

export const ROOT_ERA: Era = materializeEra({
  id: "universe",
  name: "Universe",
  startYear: TIMELINE_MIN_YEAR,
  endYear: CURRENT_YEAR,
  color: "rgba(0, 0, 0, 0)",
  scheme: "app-canonical",
  sourceIds: ["nasaUniverseOverview"],
  children: FAMILY_ROOT_DEFINITIONS,
});

export const ROOT_TIMELINE: RootTimelineData = {
  rootEra: ROOT_ERA,
  display: TIMELINE_DISPLAY,
};
