import type { TimelineSetDefinition } from "@/lib/catalog/setSchema";
import { moveItem } from "@/lib/ui/reorder";
import type { TimelineSetId } from "@/lib/core/timelineTypes";
import type {
  ColumnId,
  ColumnLayoutSnapshot,
  DragLayouts,
  DragState,
  DraftColumns,
} from "./AvailableSetsPage.types";

const CORE_TAG_ORDER = [
  "physics",
  "history",
  "archaeology",
  "geology",
  "planet",
  "life",
  "civilization",
] as const;

const EXCLUDED_TAGS = new Set(["universe"]);

/** Derives unique tags from the given sets, in a stable priority order. */
export function deriveAvailableTags(
  sets: readonly TimelineSetDefinition[],
): string[] {
  const seen = new Set<string>();
  const tagsById = new Map<string, string>();

  for (const set of sets) {
    for (const tag of set.metadata.tags ?? []) {
      const normalized = tag.toLowerCase();

      if (!seen.has(normalized) && !EXCLUDED_TAGS.has(normalized)) {
        seen.add(normalized);
        tagsById.set(normalized, tag);
      }
    }
  }

  return [
    ...CORE_TAG_ORDER.filter((tag) => seen.has(tag)),
    ...Array.from(tagsById.keys()).filter(
      (tag) => !CORE_TAG_ORDER.includes(tag as (typeof CORE_TAG_ORDER)[number]),
    ),
  ].map((tag) => tagsById.get(tag) ?? tag);
}

export function matchesQuery(
  set: TimelineSetDefinition,
  query: string,
): boolean {
  const q = query.toLowerCase().trim();

  if (!q) {
    return true;
  }

  return (
    set.metadata.label.toLowerCase().includes(q) ||
    (set.metadata.description?.toLowerCase().includes(q) ?? false) ||
    (set.metadata.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false)
  );
}

export function insertItem<T>(
  items: readonly T[],
  index: number,
  item: T,
): T[] {
  const next = [...items];

  next.splice(Math.max(0, Math.min(index, next.length)), 0, item);

  return next;
}

export function removeItem<T>(items: readonly T[], item: T): T[] {
  return items.filter((candidate) => candidate !== item);
}

export function moveItemToProjectedIndex<T>(
  items: readonly T[],
  item: T,
  targetIndex: number,
): T[] {
  return insertItem(removeItem(items, item), targetIndex, item);
}

export function createDraftColumns(
  orderedSetIds: readonly TimelineSetId[],
  enabledSetIds: ReadonlySet<TimelineSetId>,
): DraftColumns {
  return {
    enabled: orderedSetIds.filter((setId) => enabledSetIds.has(setId)),
    available: orderedSetIds.filter((setId) => !enabledSetIds.has(setId)),
  };
}

/**
 * Reorders `setId` within the visible subset while keeping the full order's
 * non-visible items in place.
 */
export function reorderVisibleSubset(
  fullOrder: readonly TimelineSetId[],
  visibleOrder: readonly TimelineSetId[],
  setId: TimelineSetId,
  targetIndex: number,
): TimelineSetId[] {
  const visibleIndex = visibleOrder.indexOf(setId);

  if (visibleIndex < 0) {
    return [...fullOrder];
  }

  const nextVisibleOrder = moveItem(visibleOrder, visibleIndex, targetIndex);
  const visibleOrderSet = new Set(visibleOrder);
  const queue = [...nextVisibleOrder];

  return fullOrder.map((candidate) =>
    visibleOrderSet.has(candidate) ? (queue.shift() ?? candidate) : candidate,
  );
}

export function reorderVisibleSubsetToProjectedIndex(
  fullOrder: readonly TimelineSetId[],
  visibleOrder: readonly TimelineSetId[],
  setId: TimelineSetId,
  targetIndex: number,
): TimelineSetId[] {
  if (!visibleOrder.includes(setId)) {
    return [...fullOrder];
  }

  const nextVisibleOrder = moveItemToProjectedIndex(
    visibleOrder,
    setId,
    targetIndex,
  );
  const visibleOrderSet = new Set(visibleOrder);
  const queue = [...nextVisibleOrder];

  return fullOrder.map((candidate) =>
    visibleOrderSet.has(candidate) ? (queue.shift() ?? candidate) : candidate,
  );
}

/**
 * Inserts `setId` at `targetIndex` in `fullOrder`, anchored against the
 * visible subset so filtered items stay in a sensible position.
 */
export function insertIntoFilteredColumn(
  fullOrder: readonly TimelineSetId[],
  visibleOrder: readonly TimelineSetId[],
  setId: TimelineSetId,
  targetIndex: number,
): TimelineSetId[] {
  if (visibleOrder.length === 0) {
    return insertItem(fullOrder, 0, setId);
  }

  if (targetIndex < visibleOrder.length) {
    const anchorId = visibleOrder[targetIndex];
    const anchorIndex = fullOrder.indexOf(anchorId);

    return insertItem(
      fullOrder,
      anchorIndex < 0 ? fullOrder.length : anchorIndex,
      setId,
    );
  }

  const lastVisibleId = visibleOrder[visibleOrder.length - 1];
  const lastVisibleIndex = fullOrder.indexOf(lastVisibleId);

  return insertItem(
    fullOrder,
    lastVisibleIndex < 0 ? fullOrder.length : lastVisibleIndex + 1,
    setId,
  );
}

/** Returns the index the dragged item should occupy when dropped. */
export function getProjectedIndex(
  layout: ColumnLayoutSnapshot | null,
  dragState: DragState,
  columnId: ColumnId,
  nextClientY: number,
): number {
  if (!layout || layout.order.length === 0) {
    return 0;
  }

  const draggedCenterY =
    nextClientY - dragState.pointerOffsetY + dragState.draggedHeight / 2;
  const remainingIds = layout.order.filter(
    (setId) =>
      !(dragState.sourceColumn === columnId && setId === dragState.setId),
  );

  for (let index = 0; index < remainingIds.length; index++) {
    const setId = remainingIds[index];
    const top = layout.rect.top + (layout.tops.get(setId) ?? 0);
    const height = layout.heights.get(setId) ?? dragState.draggedHeight;

    if (draggedCenterY < top + height / 2) {
      return index;
    }
  }

  return remainingIds.length;
}

function getDistanceToRect(rect: DOMRect, clientX: number, clientY: number) {
  const dx =
    clientX < rect.left ? rect.left - clientX : Math.max(0, clientX - rect.right);
  const dy =
    clientY < rect.top ? rect.top - clientY : Math.max(0, clientY - rect.bottom);

  return Math.hypot(dx, dy);
}

/** Returns the column that best contains or is closest to the pointer. */
export function getDropColumn(
  layouts: DragLayouts,
  clientX: number,
  clientY: number,
): ColumnId {
  const enabledRect = layouts.enabled?.rect;
  const availableRect = layouts.available?.rect;

  if (
    enabledRect &&
    clientX >= enabledRect.left &&
    clientX <= enabledRect.right &&
    clientY >= enabledRect.top &&
    clientY <= enabledRect.bottom
  ) {
    return "enabled";
  }

  if (
    availableRect &&
    clientX >= availableRect.left &&
    clientX <= availableRect.right &&
    clientY >= availableRect.top &&
    clientY <= availableRect.bottom
  ) {
    return "available";
  }

  if (!enabledRect) return "available";
  if (!availableRect) return "enabled";

  return getDistanceToRect(enabledRect, clientX, clientY) <=
    getDistanceToRect(availableRect, clientX, clientY)
    ? "enabled"
    : "available";
}
