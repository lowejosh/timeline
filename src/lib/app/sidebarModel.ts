import { getVisibleRange, type TimelineViewport } from "../core/viewport";
import { isTimelineDecorationVisibleAtZoom } from "../rendering/queries/visibility";
import { getDefaultTimelineSetOrder, normalizeTimelineSetOrder } from "../catalog/timelineSets";
import {
  STATIC_TIMELINE_CATALOG,
  type TimelineCatalogSnapshot,
} from "../catalog/timelineCatalog";
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
  collectionSetIds: ReadonlySet<TimelineSetId>,
  visibleSetIds: ReadonlySet<TimelineSetId>,
  enabledGroupIds: ReadonlySet<string>,
  suppressedGroupIds: ReadonlySet<string> = new Set(),
  setOrder?: readonly TimelineSetId[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
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

    const existing =
      countsByGroupId.get(overlay.groupId) ?? createEmptyCounts();
    existing.overlayCount += 1;
    countsByGroupId.set(overlay.groupId, existing);
  }

  const orderIndexBySetId = new Map(
    normalizeTimelineSetOrder(
      setOrder ?? getDefaultTimelineSetOrder(catalog),
      catalog,
    ).map((setId, index) => [setId, index]),
  );

  return [...catalog.sets]
    .filter((set) => collectionSetIds.has(set.metadata.id))
    .sort(
      (left, right) =>
        (orderIndexBySetId.get(left.metadata.id) ?? Number.MAX_SAFE_INTEGER) -
          (orderIndexBySetId.get(right.metadata.id) ?? Number.MAX_SAFE_INTEGER) ||
        left.metadata.order - right.metadata.order ||
        left.metadata.label.localeCompare(right.metadata.label),
    )
    .map((set) => {
      const children = set.groups
        .map<TimelineSidebarChildState>((group) => {
          const counts = countsByGroupId.get(group.id) ?? createEmptyCounts();

          return {
            id: group.id,
            label: group.label,
            description: group.description,
            groupIds: [group.id],
            contentType: group.contentType,
            enabled: enabledGroupIds.has(group.id),
            mixed: false,
            suppressed: suppressedGroupIds.has(group.id),
            markerCount: counts.markerCount,
            overlayCount: counts.overlayCount,
            relevantItemCount: getRelevantItemCount(counts),
          };
        });

      const totals = children.reduce<TimelineSidebarCounts>(
        (aggregate, child) => {
          aggregate.markerCount += child.markerCount;
          aggregate.overlayCount += child.overlayCount;
          return aggregate;
        },
        createEmptyCounts(),
      );

      return {
        id: set.metadata.id,
        label: set.metadata.label,
        description: set.metadata.description,
        enabled: visibleSetIds.has(set.metadata.id),
        markerCount: totals.markerCount,
        overlayCount: totals.overlayCount,
        relevantItemCount: getRelevantItemCount(totals),
        children,
      } satisfies TimelineSidebarSetState;
    });
}
