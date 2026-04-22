import { getVisibleRange, type TimelineViewport } from "../core/viewport";
import { isTimelineDecorationVisibleAtZoom } from "../rendering/queries/visibility";
import { TIMELINE_DECORATION_GROUPS_BY_ID } from "../catalog/decorations";
import {
  TIMELINE_SETS,
  getDefaultTimelineSetOrder,
  normalizeTimelineSetOrder,
} from "../catalog/timelineSets";
import type {
  TimelineDecorationContentType,
  TimelineDisplayConfig,
  TimelineSetId,
} from "../core/timelineTypes";

export type TimelineSidebarChildState = {
  id: string;
  label: string;
  description?: string;
  groupIds: string[];
  contentType: TimelineDecorationContentType;
  enabled: boolean;
  mixed: boolean;
  suppressed: boolean;
  relevantItemCount: number;
  markerCount: number;
  overlayCount: number;
};

export type TimelineSidebarSetState = {
  id: TimelineSetId;
  label: string;
  description?: string;
  enabled: boolean;
  relevantItemCount: number;
  markerCount: number;
  overlayCount: number;
  children: TimelineSidebarChildState[];
};

type TimelineSidebarCounts = {
  markerCount: number;
  overlayCount: number;
};

function createEmptyCounts(): TimelineSidebarCounts {
  return {
    markerCount: 0,
    overlayCount: 0,
  };
}

function getRelevantItemCount(counts: TimelineSidebarCounts) {
  return counts.markerCount + counts.overlayCount;
}

export function resolveTimelineSidebarTree(
  display: TimelineDisplayConfig,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledSetIds: ReadonlySet<TimelineSetId>,
  enabledGroupIds: ReadonlySet<string>,
  suppressedGroupIds: ReadonlySet<string> = new Set(),
  setOrder: readonly TimelineSetId[] = getDefaultTimelineSetOrder(),
): TimelineSidebarSetState[] {
  if (width <= pad * 2) {
    return [];
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const countsByGroupId = new Map<string, TimelineSidebarCounts>();

  for (const marker of display.markers) {
    if (
      !marker.groupId ||
      suppressedGroupIds.has(marker.groupId) ||
      !isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) ||
      marker.year < visibleStart ||
      marker.year > visibleEnd
    ) {
      continue;
    }

    const existing = countsByGroupId.get(marker.groupId) ?? createEmptyCounts();
    existing.markerCount += 1;
    countsByGroupId.set(marker.groupId, existing);
  }

  for (const overlay of display.overlays) {
    if (
      !overlay.groupId ||
      suppressedGroupIds.has(overlay.groupId) ||
      !isTimelineDecorationVisibleAtZoom(overlay, viewport.zoom) ||
      overlay.endYear < visibleStart ||
      overlay.startYear > visibleEnd
    ) {
      continue;
    }

    const existing = countsByGroupId.get(overlay.groupId) ?? createEmptyCounts();
    existing.overlayCount += 1;
    countsByGroupId.set(overlay.groupId, existing);
  }

  const orderIndexBySetId = new Map(
    normalizeTimelineSetOrder(setOrder).map((setId, index) => [setId, index]),
  );

  return [...TIMELINE_SETS]
    .sort(
      (left, right) =>
        (orderIndexBySetId.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (orderIndexBySetId.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
        left.order - right.order ||
        left.label.localeCompare(right.label),
    )
    .map((set) => {
      const children = set.groupIds
        .map<TimelineSidebarChildState | null>((groupId) => {
          const group = TIMELINE_DECORATION_GROUPS_BY_ID[groupId];

          if (!group) {
            return null;
          }

          const counts = countsByGroupId.get(group.id) ?? createEmptyCounts();
          const enabledCount = enabledGroupIds.has(group.id) ? 1 : 0;

          return {
            id: group.id,
            label: group.label,
            description: group.description,
            groupIds: [group.id],
            contentType: group.contentType,
            enabled: enabledCount === 1,
            mixed: false,
            suppressed: suppressedGroupIds.has(group.id),
            markerCount: counts.markerCount,
            overlayCount: counts.overlayCount,
            relevantItemCount: getRelevantItemCount(counts),
          };
        })
        .filter((child): child is TimelineSidebarChildState => child !== null);

      const totals = children.reduce(
        (aggregate, child) => {
          aggregate.markerCount += child.markerCount;
          aggregate.overlayCount += child.overlayCount;
          return aggregate;
        },
        createEmptyCounts(),
      );

      return {
        id: set.id,
        label: set.label,
        description: set.description,
        enabled: enabledSetIds.has(set.id),
        markerCount: totals.markerCount,
        overlayCount: totals.overlayCount,
        relevantItemCount: getRelevantItemCount(totals),
        children,
      } satisfies TimelineSidebarSetState;
    });
}
