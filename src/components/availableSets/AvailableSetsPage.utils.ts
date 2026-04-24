import { TIMELINE_MARKERS, TIMELINE_OVERLAYS } from "../../lib/catalog/content";
import { getRootDisplayErasBySets, ROOT_ERA } from "../../lib/domain/eras";
import { formatTimelineYear } from "../../lib/rendering/bands";
import { TIMELINE_MAX_YEAR } from "../../lib/core/timelineYears";
import type { TimelineSetDefinition } from "../../lib/catalog/setSchema";
import {
  resolveDecorationSetId,
} from "../../lib/catalog/timelineSets";
import type {
  Era,
  TimelineOverlayBand,
  TimelineSetId,
} from "../../lib/core/timelineTypes";
import type {
  ColumnId,
  ColumnLayoutSnapshot,
  DragLayouts,
  DragState,
  DraftColumns,
} from "./AvailableSetsPage.types";

export const REORDER_SETTLE_MS = 220;
export const REORDER_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

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

export function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);

  next.splice(toIndex, 0, moved);

  return next;
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
 * Estimates the CSS grid gap from the space between the first two adjacent
 * items in the snapshot. Returns 0 when there are fewer than two items.
 */
export function estimateGap(layout: ColumnLayoutSnapshot): number {
  for (let i = 0; i + 1 < layout.order.length; i++) {
    const aId = layout.order[i];
    const bId = layout.order[i + 1];
    const aTop = layout.tops.get(aId);
    const aHeight = layout.heights.get(aId);
    const bTop = layout.tops.get(bId);

    if (aTop !== undefined && aHeight !== undefined && bTop !== undefined) {
      return Math.max(0, bTop - aTop - aHeight);
    }
  }

  return 0;
}

/**
 * Computes the preview top for each set in `order`.
 * `extraHeights` injects heights for items not yet measured in this column
 * (e.g. a cross-column dragged card). `gap` is the inter-item CSS gap.
 */
export function getPreviewTopBySetId(
  order: readonly TimelineSetId[],
  layout: ColumnLayoutSnapshot,
  extraHeights: ReadonlyMap<TimelineSetId, number> = new Map(),
  gap = 0,
): Map<TimelineSetId, number> {
  const result = new Map<TimelineSetId, number>();
  let nextTop = layout.baseTop;

  for (const setId of order) {
    result.set(setId, nextTop);
    const height = layout.heights.get(setId) ?? extraHeights.get(setId) ?? 0;

    nextTop += height + gap;
  }

  return result;
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

/** Returns the column that best contains or is closest to `clientX`. */
export function getDropColumn(layouts: DragLayouts, clientX: number): ColumnId {
  const enabledRect = layouts.enabled?.rect;
  const availableRect = layouts.available?.rect;

  if (
    enabledRect &&
    clientX >= enabledRect.left &&
    clientX <= enabledRect.right
  ) {
    return "enabled";
  }

  if (
    availableRect &&
    clientX >= availableRect.left &&
    clientX <= availableRect.right
  ) {
    return "available";
  }

  if (!enabledRect) return "available";
  if (!availableRect) return "enabled";

  const enabledCenter = enabledRect.left + enabledRect.width / 2;
  const availableCenter = availableRect.left + availableRect.width / 2;

  return Math.abs(clientX - enabledCenter) <=
    Math.abs(clientX - availableCenter)
    ? "enabled"
    : "available";
}

function getDisplayErasForSet(setId: TimelineSetId): Era[] {
  return getRootDisplayErasBySets(ROOT_ERA, new Set([setId]));
}

function getDecorationExtentForSet(setId: TimelineSetId) {
  let startYear = Number.POSITIVE_INFINITY;
  let endYear = Number.NEGATIVE_INFINITY;

  for (const marker of TIMELINE_MARKERS) {
    const markerSetId = marker.setId ?? resolveDecorationSetId(marker);

    if (markerSetId !== setId) {
      continue;
    }

    startYear = Math.min(startYear, marker.year);
    endYear = Math.max(endYear, marker.year);
  }

  const visitOverlays = (overlays: readonly TimelineOverlayBand[]) => {
    for (const overlay of overlays) {
      const overlaySetId = overlay.setId ?? resolveDecorationSetId(overlay);

      if (overlaySetId === setId) {
        startYear = Math.min(startYear, overlay.startYear);
        endYear = Math.max(endYear, overlay.endYear);
      }

      if (overlay.children?.length) {
        visitOverlays(overlay.children);
      }
    }
  };

  visitOverlays(TIMELINE_OVERLAYS);

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    return null;
  }

  return { startYear, endYear };
}

/**
 * For each set in `orderedEnabledSetIds`, counts how many of its root display
 * eras are fully time-span-contained within any single era from a
 * higher-priority set (one that appears earlier in the order).
 * The top-ranked set always returns 0 since nothing is ranked above it.
 */
export function computeEraObscuredCounts(
  orderedEnabledSetIds: readonly TimelineSetId[],
): Map<TimelineSetId, number> {
  const counts = new Map<TimelineSetId, number>();
  const erasBySet = new Map<TimelineSetId, Era[]>();

  for (const setId of orderedEnabledSetIds) {
    erasBySet.set(setId, getDisplayErasForSet(setId));
  }

  for (let i = 0; i < orderedEnabledSetIds.length; i++) {
    const setId = orderedEnabledSetIds[i];
    const higherPriorityEras = orderedEnabledSetIds
      .slice(0, i)
      .flatMap((higherSetId) => erasBySet.get(higherSetId) ?? []);

    if (higherPriorityEras.length === 0) {
      counts.set(setId, 0);
      continue;
    }

    const thisSetEras = erasBySet.get(setId) ?? [];
    const obscuredCount = thisSetEras.filter((era) =>
      higherPriorityEras.some(
        (higher) =>
          higher.startYear <= era.startYear && higher.endYear >= era.endYear,
      ),
    ).length;

    counts.set(setId, obscuredCount);
  }

  return counts;
}

function formatSetEndpointYear(year: number, span: number): string {
  if (Math.abs(year - TIMELINE_MAX_YEAR) < 1e-9) {
    return "Present";
  }

  return formatTimelineYear(year, span);
}

/**
 * Computes a human-readable time range string for each set based purely on
 * the min/max years of its root display eras. Does not depend on set order.
 */
export function computeSetTimeRanges(
  setIds: readonly TimelineSetId[],
): Map<TimelineSetId, string> {
  const ranges = new Map<TimelineSetId, string>();

  for (const setId of setIds) {
    const eras = getDisplayErasForSet(setId);

    const range =
      eras.length > 0
        ? {
            startYear: Math.min(...eras.map((era) => era.startYear)),
            endYear: Math.max(...eras.map((era) => era.endYear)),
          }
        : getDecorationExtentForSet(setId);

    if (!range) {
      continue;
    }

    const { startYear, endYear } = range;
    const span = Math.abs(endYear - startYear);
    const startLabel = formatSetEndpointYear(startYear, span);
    const endLabel = formatSetEndpointYear(endYear, span);

    ranges.set(setId, `${startLabel} → ${endLabel}`);
  }

  return ranges;
}
