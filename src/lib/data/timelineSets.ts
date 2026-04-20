import {
  COSMIC_SET_CORE_MARKER_IDS,
  COSMIC_SET_FAMILY_IDS,
  COSMIC_SET_GROUP_IDS,
  COSMIC_SET_ID,
} from "./sets/cosmic";
import {
  EARTH_SET_CORE_MARKER_IDS,
  EARTH_SET_FAMILY_IDS,
  EARTH_SET_GROUP_IDS,
  EARTH_SET_ID,
} from "./sets/earth";
import {
  HUMAN_SET_CORE_MARKER_IDS,
  HUMAN_SET_FAMILY_IDS,
  HUMAN_SET_GROUP_IDS,
  HUMAN_SET_ID,
} from "./sets/human";
import type {
  Era,
  EraFamilyId,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetConfig,
  TimelineSetId,
} from "./timelineTypes";

const TIMELINE_SET_PRIORITY_STRIDE = 10_000;

type TimelinePriorityBearing = {
  priority?: number;
  setPriorityBoost?: number;
};

export type TimelineSetAssignmentConfig = TimelineSetConfig & {
  /** Decoration `groupId`s owned entirely by this set. */
  groupIds: readonly string[];
  /** Explicit core-marker IDs owned by this set (for the ungrouped core file). */
  coreMarkerIds: ReadonlySet<string>;
};

export const TIMELINE_SETS: readonly TimelineSetAssignmentConfig[] = [
  {
    id: COSMIC_SET_ID,
    label: "Cosmic",
    description:
      "Universe-scale history from the Big Bang through the formation of the Solar System.",
    order: 0,
    defaultEnabled: true,
    familyIds: [...COSMIC_SET_FAMILY_IDS],
    groupIds: COSMIC_SET_GROUP_IDS,
    coreMarkerIds: COSMIC_SET_CORE_MARKER_IDS,
  },
  {
    id: EARTH_SET_ID,
    label: "Earth",
    description:
      "Earth-system and deep-time-life history from planetary formation through prehistory.",
    order: 1,
    defaultEnabled: true,
    familyIds: [...EARTH_SET_FAMILY_IDS],
    groupIds: EARTH_SET_GROUP_IDS,
    coreMarkerIds: EARTH_SET_CORE_MARKER_IDS,
  },
  {
    id: HUMAN_SET_ID,
    label: "Human",
    description:
      "Hominin evolution, archaeological cultures, civilizations, and recorded history.",
    order: 2,
    defaultEnabled: true,
    familyIds: [...HUMAN_SET_FAMILY_IDS],
    groupIds: HUMAN_SET_GROUP_IDS,
    coreMarkerIds: HUMAN_SET_CORE_MARKER_IDS,
  },
];

export const TIMELINE_SETS_BY_ID: Readonly<
  Record<TimelineSetId, TimelineSetAssignmentConfig>
> = Object.fromEntries(TIMELINE_SETS.map((set) => [set.id, set])) as Readonly<
  Record<TimelineSetId, TimelineSetAssignmentConfig>
>;

function compareTimelineSetOrder(
  left: TimelineSetAssignmentConfig,
  right: TimelineSetAssignmentConfig,
) {
  return left.order - right.order || left.label.localeCompare(right.label);
}

export function getDefaultTimelineSetOrder(): TimelineSetId[] {
  return [...TIMELINE_SETS].sort(compareTimelineSetOrder).map((set) => set.id);
}

export function normalizeTimelineSetOrder(
  candidateOrder: readonly string[] | null | undefined,
): TimelineSetId[] {
  const normalized: TimelineSetId[] = [];
  const seen = new Set<TimelineSetId>();

  for (const candidateId of candidateOrder ?? []) {
    if (!(candidateId in TIMELINE_SETS_BY_ID)) {
      continue;
    }

    const setId = candidateId as TimelineSetId;

    if (seen.has(setId)) {
      continue;
    }

    seen.add(setId);
    normalized.push(setId);
  }

  for (const setId of getDefaultTimelineSetOrder()) {
    if (seen.has(setId)) {
      continue;
    }

    normalized.push(setId);
  }

  return normalized;
}

function getTimelineSetPriorityBoosts(setOrder: readonly TimelineSetId[]) {
  const normalizedOrder = normalizeTimelineSetOrder(setOrder);
  const boostBySetId = new Map<TimelineSetId, number>();

  normalizedOrder.forEach((setId, index) => {
    boostBySetId.set(
      setId,
      (normalizedOrder.length - index) * TIMELINE_SET_PRIORITY_STRIDE,
    );
  });

  return boostBySetId;
}

export function getEffectiveTimelinePriority(item: TimelinePriorityBearing) {
  return (item.priority ?? 0) + (item.setPriorityBoost ?? 0);
}

export function applyTimelineSetOrderToMarkers(
  markers: readonly TimelineMarker[],
  setOrder: readonly TimelineSetId[],
): TimelineMarker[] {
  const boostBySetId = getTimelineSetPriorityBoosts(setOrder);

  return markers.map((marker) => {
    const setId = marker.setId ?? resolveDecorationSetId(marker);
    const setPriorityBoost = setId ? boostBySetId.get(setId) : undefined;

    if ((marker.setPriorityBoost ?? 0) === (setPriorityBoost ?? 0)) {
      return marker;
    }

    return {
      ...marker,
      setPriorityBoost,
    };
  });
}

function applyTimelineSetOrderToOverlay(
  overlay: TimelineOverlayBand,
  boostBySetId: ReadonlyMap<TimelineSetId, number>,
): TimelineOverlayBand {
  const setId = overlay.setId ?? resolveDecorationSetId(overlay);
  const setPriorityBoost = setId ? boostBySetId.get(setId) : undefined;

  return {
    ...overlay,
    setPriorityBoost,
    children: overlay.children?.map((child) =>
      applyTimelineSetOrderToOverlay(child, boostBySetId),
    ),
  };
}

export function applyTimelineSetOrderToOverlays(
  overlays: readonly TimelineOverlayBand[],
  setOrder: readonly TimelineSetId[],
): TimelineOverlayBand[] {
  const boostBySetId = getTimelineSetPriorityBoosts(setOrder);

  return overlays.map((overlay) =>
    applyTimelineSetOrderToOverlay(overlay, boostBySetId),
  );
}

function applyTimelineSetOrderToEra(
  era: Era,
  boostBySetId: ReadonlyMap<TimelineSetId, number>,
): Era {
  const setId = era.familyId ? getSetIdForEraFamily(era.familyId) : null;
  const setPriorityBoost = setId ? boostBySetId.get(setId) : undefined;

  return {
    ...era,
    setPriorityBoost,
    children: era.children?.map((child) =>
      applyTimelineSetOrderToEra(child, boostBySetId),
    ),
  };
}

export function applyTimelineSetOrderToEraTree(
  root: Era,
  setOrder: readonly TimelineSetId[],
): Era {
  return applyTimelineSetOrderToEra(root, getTimelineSetPriorityBoosts(setOrder));
}

export function getDefaultEnabledTimelineSetIds(): Set<TimelineSetId> {
  return new Set(
    TIMELINE_SETS.filter((set) => set.defaultEnabled !== false).map(
      (set) => set.id,
    ),
  );
}

/**
 * Resolve which set a decoration belongs to using the central registry.
 * Returns `null` when the decoration doesn't match any set (for example
 * untagged core markers that don't appear in any `coreMarkerIds` list).
 */
export function resolveDecorationSetId(
  item: Pick<TimelineMarker | TimelineOverlayBand, "id" | "groupId">,
): TimelineSetId | null {
  if (item.groupId) {
    for (const set of TIMELINE_SETS) {
      if (set.groupIds.includes(item.groupId)) {
        return set.id;
      }
    }
  }

  for (const set of TIMELINE_SETS) {
    if (set.coreMarkerIds.has(item.id)) {
      return set.id;
    }
  }

  return null;
}

/**
 * Resolve which set owns a given era family. Used to filter family roots when
 * sets are enabled or disabled.
 */
export function getSetIdForEraFamily(
  familyId: EraFamilyId,
): TimelineSetId | null {
  for (const set of TIMELINE_SETS) {
    if (set.familyIds.includes(familyId)) {
      return set.id;
    }
  }
  return null;
}

/**
 * A decoration is visible if:
 *   - it has no assigned set (treat as always-on for safety), or
 *   - its set is present in `enabledSetIds`.
 */
export function isDecorationSetEnabled(
  setId: TimelineSetId | null | undefined,
  enabledSetIds: ReadonlySet<TimelineSetId>,
): boolean {
  if (!setId) {
    return true;
  }
  return enabledSetIds.has(setId);
}

function isMarkerEnabledBySets(
  marker: TimelineMarker,
  enabledSetIds: ReadonlySet<TimelineSetId>,
): boolean {
  const setId = marker.setId ?? resolveDecorationSetId(marker);
  return isDecorationSetEnabled(setId, enabledSetIds);
}

function isOverlayEnabledBySets(
  overlay: TimelineOverlayBand,
  enabledSetIds: ReadonlySet<TimelineSetId>,
): boolean {
  const setId = overlay.setId ?? resolveDecorationSetId(overlay);
  return isDecorationSetEnabled(setId, enabledSetIds);
}

/**
 * Returns a new markers array containing only markers whose set is enabled.
 * Markers without a resolvable set are always kept (safe default).
 */
export function filterMarkersBySets(
  markers: readonly TimelineMarker[],
  enabledSetIds: ReadonlySet<TimelineSetId>,
): TimelineMarker[] {
  return markers.filter((marker) =>
    isMarkerEnabledBySets(marker, enabledSetIds),
  );
}

/**
 * Returns a new overlays array containing only overlays whose set is enabled.
 * Child overlays inherit filtering from their parent (a disabled parent drops
 * the whole subtree) because children share the parent's `groupId`/`setId`.
 */
export function filterOverlaysBySets(
  overlays: readonly TimelineOverlayBand[],
  enabledSetIds: ReadonlySet<TimelineSetId>,
): TimelineOverlayBand[] {
  return overlays.filter((overlay) =>
    isOverlayEnabledBySets(overlay, enabledSetIds),
  );
}
