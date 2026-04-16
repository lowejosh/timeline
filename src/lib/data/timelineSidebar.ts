import { getVisibleRange, type TimelineViewport } from "../time/viewport";
import {
  TIMELINE_DECORATION_CATEGORY_IDS,
  TIMELINE_DECORATION_GROUPS,
} from "./timelineDecorations";
import type {
  TimelineDisplayConfig,
  TimelineZoomVisibility,
} from "./timelineTypes";

export type TimelineSidebarEntryState = {
  id: string;
  label: string;
  groupIds: string[];
  enabled: boolean;
  mixed: boolean;
  relevantItemCount: number;
  markerCount: number;
  overlayCount: number;
};

export type TimelineSidebarSectionState = {
  id: string;
  label: string;
  entries: TimelineSidebarEntryState[];
};

type TimelineSidebarResolvedEntry = TimelineSidebarEntryState & {
  sectionId: (typeof SIDEBAR_SECTIONS)[number]["id"];
};

const SIDEBAR_ENTRY_DEFINITIONS = [
  {
    id: "civilizations",
    label: "Civilizations",
    sectionId: "overlays",
    groupIds: TIMELINE_DECORATION_GROUPS.filter(
      (group) =>
        group.categoryId === TIMELINE_DECORATION_CATEGORY_IDS.civilizations &&
        group.contentType === "overlays",
    ).map((group) => group.id),
  },
  {
    id: "human-history",
    label: "Human History",
    sectionId: "markers",
    groupIds: TIMELINE_DECORATION_GROUPS.filter(
      (group) =>
        group.categoryId === TIMELINE_DECORATION_CATEGORY_IDS.humanHistory &&
        group.contentType === "markers",
    ).map((group) => group.id),
  },
] as const;

const SIDEBAR_SECTIONS = [
  { id: "overlays", label: "Overlays" },
  { id: "markers", label: "Markers" },
] as const;

function isVisibleAtZoom(item: TimelineZoomVisibility, zoom: number) {
  if (item.minZoom !== undefined && zoom < item.minZoom) {
    return false;
  }

  if (item.maxZoom !== undefined && zoom > item.maxZoom) {
    return false;
  }

  return true;
}

export function resolveTimelineSidebarSections(
  display: TimelineDisplayConfig,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledGroupIds: ReadonlySet<string>,
): TimelineSidebarSectionState[] {
  if (width <= pad * 2) {
    return [];
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const countsByGroupId = new Map<
    string,
    {
      markerCount: number;
      overlayCount: number;
    }
  >();

  for (const marker of display.markers) {
    if (
      !marker.groupId ||
      !isVisibleAtZoom(marker, viewport.zoom) ||
      marker.year < visibleStart ||
      marker.year > visibleEnd
    ) {
      continue;
    }

    const existing = countsByGroupId.get(marker.groupId) ?? {
      markerCount: 0,
      overlayCount: 0,
    };
    existing.markerCount += 1;
    countsByGroupId.set(marker.groupId, existing);
  }

  for (const overlay of display.overlays) {
    if (
      !overlay.groupId ||
      !isVisibleAtZoom(overlay, viewport.zoom) ||
      overlay.endYear < visibleStart ||
      overlay.startYear > visibleEnd
    ) {
      continue;
    }

    const existing = countsByGroupId.get(overlay.groupId) ?? {
      markerCount: 0,
      overlayCount: 0,
    };
    existing.overlayCount += 1;
    countsByGroupId.set(overlay.groupId, existing);
  }

  const entries = SIDEBAR_ENTRY_DEFINITIONS.reduce<
    TimelineSidebarResolvedEntry[]
  >((accumulator, definition) => {
    const counts = definition.groupIds.reduce(
      (totals, groupId) => {
        const groupCounts = countsByGroupId.get(groupId);

        if (!groupCounts) {
          return totals;
        }

        totals.markerCount += groupCounts.markerCount;
        totals.overlayCount += groupCounts.overlayCount;
        return totals;
      },
      {
        markerCount: 0,
        overlayCount: 0,
      },
    );

    const relevantItemCount = counts.markerCount + counts.overlayCount;

    if (relevantItemCount === 0) {
      return accumulator;
    }

    const enabledCount = definition.groupIds.filter((groupId) =>
      enabledGroupIds.has(groupId),
    ).length;

    accumulator.push({
      id: definition.id,
      label: definition.label,
      groupIds: [...definition.groupIds],
      enabled: enabledCount === definition.groupIds.length,
      mixed: enabledCount > 0 && enabledCount < definition.groupIds.length,
      markerCount: counts.markerCount,
      overlayCount: counts.overlayCount,
      relevantItemCount,
      sectionId: definition.sectionId,
    });

    return accumulator;
  }, []);

  return SIDEBAR_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    entries: entries.filter((entry) => entry.sectionId === section.id),
  })).filter((section) => section.entries.length > 0);
}
