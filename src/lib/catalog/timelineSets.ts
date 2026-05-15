import {
  TIMELINE_SET_ID_BY_FAMILY_ID,
  TIMELINE_SET_ID_BY_GROUP_ID,
  TIMELINE_SET_SPAN_PRIORITY_BY_ID,
  TIMELINE_SETS,
  TIMELINE_SETS_BY_ID,
} from "./timelineRegistry";
import type { TimelineSetDefinition } from "./setSchema";
import type {
  Era,
  EraFamilyId,
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetId,
} from "../core/timelineTypes";

const TIMELINE_SET_PRIORITY_STRIDE = 10_000;

type TimelinePriorityBearing = {
  priority?: number;
  setPriorityBoost?: number;
};

export type TimelineSetAssignmentConfig = TimelineSetDefinition;

function compareTimelineSetOrder(
  left: TimelineSetDefinition,
  right: TimelineSetDefinition,
) {
  return (
    left.metadata.order - right.metadata.order ||
    left.metadata.label.localeCompare(right.metadata.label)
  );
}

export function getDefaultTimelineSetOrder(): TimelineSetId[] {
  return [...TIMELINE_SETS]
    .sort(compareTimelineSetOrder)
    .map((set) => set.metadata.id);
}

export function normalizeTimelineSetOrder(
  candidateOrder: readonly string[] | null | undefined,
): TimelineSetId[] {
  const normalized: TimelineSetId[] = [];
  const seen = new Set<TimelineSetId>();

  for (const candidateId of candidateOrder ?? []) {
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
    const setPriorityBoost = marker.setId
      ? boostBySetId.get(marker.setId)
      : undefined;

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
  const setPriorityBoost = overlay.setId
    ? boostBySetId.get(overlay.setId)
    : undefined;

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
  return applyTimelineSetOrderToEra(
    root,
    getTimelineSetPriorityBoosts(setOrder),
  );
}

export function getDefaultEnabledTimelineSetIds(): Set<TimelineSetId> {
  return new Set(
    TIMELINE_SETS.filter((set) => set.metadata.defaultEnabled !== false).map(
      (set) => set.metadata.id,
    ),
  );
}

export function resolveDecorationSetId(
  item: Pick<TimelineMarker | TimelineOverlayBand, "setId">,
): TimelineSetId | null {
  return item.setId ?? null;
}

export function getSetIdForEraFamily(
  familyId: EraFamilyId,
): TimelineSetId | null {
  return TIMELINE_SET_ID_BY_FAMILY_ID.get(familyId) ?? null;
}

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
  return isDecorationSetEnabled(marker.setId, enabledSetIds);
}

function isOverlayEnabledBySets(
  overlay: TimelineOverlayBand,
  enabledSetIds: ReadonlySet<TimelineSetId>,
): boolean {
  return isDecorationSetEnabled(overlay.setId, enabledSetIds);
}

export function filterMarkersBySets(
  markers: readonly TimelineMarker[],
  enabledSetIds: ReadonlySet<TimelineSetId>,
): TimelineMarker[] {
  return markers.filter((marker) =>
    isMarkerEnabledBySets(marker, enabledSetIds),
  );
}

export function filterOverlaysBySets(
  overlays: readonly TimelineOverlayBand[],
  enabledSetIds: ReadonlySet<TimelineSetId>,
): TimelineOverlayBand[] {
  return overlays.filter((overlay) =>
    isOverlayEnabledBySets(overlay, enabledSetIds),
  );
}

export {
  TIMELINE_SETS,
  TIMELINE_SETS_BY_ID,
  TIMELINE_SET_ID_BY_GROUP_ID,
  TIMELINE_SET_SPAN_PRIORITY_BY_ID,
};
