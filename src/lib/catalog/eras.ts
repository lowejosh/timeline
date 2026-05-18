import {
  getEffectiveTimelinePriority,
  getSetIdForEraFamily,
} from "./timelineSets";
import { STATIC_TIMELINE_CATALOG } from "./timelineCatalog";
import type {
  Era,
  EraFamilyId,
  RootTimelineData,
  TimelineSetId,
} from "../core/timelineTypes";
import type { TimelineCatalogSnapshot } from "./timelineCatalog";

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
export { getSeededEraColor } from "./timelineCatalog";

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
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Era[] {
  return (root.children ?? []).flatMap((child) => {
    if (!isEraFamilyRoot(child)) {
      const setId = child.familyId
        ? getSetIdForEraFamily(child.familyId, catalog)
        : null;

      if (setId && !enabledSetIds.has(setId)) {
        return [];
      }

      return [child];
    }
    const familyId = child.familyId;
    const setId = familyId ? getSetIdForEraFamily(familyId, catalog) : null;
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

export const TIMELINE_ERA_FAMILIES = STATIC_TIMELINE_CATALOG.eraFamilies;
export const ROOT_ERA: Era = STATIC_TIMELINE_CATALOG.rootEra;

export const ROOT_TIMELINE: RootTimelineData = {
  rootEra: ROOT_ERA,
  display: STATIC_TIMELINE_CATALOG.display,
};
