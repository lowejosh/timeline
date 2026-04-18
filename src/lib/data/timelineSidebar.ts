import { getVisibleRange, type TimelineViewport } from "../time/viewport";
import { isTimelineDecorationVisibleAtZoom } from "../time/overlayTracks";
import {
  TIMELINE_DECORATION_CATEGORY_IDS,
  TIMELINE_DECORATION_GROUPS,
} from "./timelineDecorations";
import type { TimelineDisplayConfig } from "./timelineTypes";

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
    id: "deep-time-life",
    label: "Deep Time Life",
    sectionId: "overlays",
    groupIds: TIMELINE_DECORATION_GROUPS.filter(
      (group) =>
        group.categoryId === TIMELINE_DECORATION_CATEGORY_IDS.deepTimeLife,
    ).map((group) => group.id),
  },
  {
    id: "human-evolution",
    label: "Human Evolution",
    sectionId: "overlays",
    groupIds: TIMELINE_DECORATION_GROUPS.filter(
      (group) =>
        group.categoryId === TIMELINE_DECORATION_CATEGORY_IDS.humanEvolution,
    ).map((group) => group.id),
  },
  {
    id: "cultures",
    label: "Pre-Civilization Cultures",
    sectionId: "overlays",
    groupIds: TIMELINE_DECORATION_GROUPS.filter(
      (group) =>
        group.categoryId === TIMELINE_DECORATION_CATEGORY_IDS.cultures &&
        group.contentType === "overlays",
    ).map((group) => group.id),
  },
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

const HUMAN_HISTORY_GROUP_IDS = new Set(
  SIDEBAR_ENTRY_DEFINITIONS.find(
    (definition) => definition.id === "human-history",
  )?.groupIds ?? [],
);

const OVERLAY_ENTRY_IDS_HIDDEN_WITHOUT_ZOOM_VISIBLE_HISTORY = new Set([
  "civilizations",
  "cultures",
]);

export function resolveTimelineSidebarSections(
  display: TimelineDisplayConfig,
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledGroupIds: ReadonlySet<string>,
  suppressedGroupIds: ReadonlySet<string> = new Set(),
): TimelineSidebarSectionState[] {
  if (width <= pad * 2) {
    return [];
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const hasHumanHistoryContent = display.markers.some(
    (marker) => marker.groupId && HUMAN_HISTORY_GROUP_IDS.has(marker.groupId),
  );
  const hasZoomVisibleHumanHistoryMarkers = display.markers.some(
    (marker) =>
      marker.groupId &&
      HUMAN_HISTORY_GROUP_IDS.has(marker.groupId) &&
      isTimelineDecorationVisibleAtZoom(marker, viewport.zoom),
  );
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
      suppressedGroupIds.has(marker.groupId) ||
      !isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) ||
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
      suppressedGroupIds.has(overlay.groupId) ||
      !isTimelineDecorationVisibleAtZoom(overlay, viewport.zoom) ||
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

    if (
      OVERLAY_ENTRY_IDS_HIDDEN_WITHOUT_ZOOM_VISIBLE_HISTORY.has(
        definition.id,
      ) &&
      hasHumanHistoryContent &&
      !hasZoomVisibleHumanHistoryMarkers
    ) {
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
