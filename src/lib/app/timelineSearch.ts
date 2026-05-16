import {
  TIMELINE_DECORATION_GROUPS_BY_ID,
  TIMELINE_MARKERS,
  TIMELINE_OVERLAYS,
  TIMELINE_SET_ID_BY_GROUP_ID,
  TIMELINE_SETS_BY_ID,
} from "@/lib/catalog/timelineRegistry";
import { formatTimelineYear } from "@/lib/rendering/bands";
import type {
  TimelineMarker,
  TimelineOverlayBand,
  TimelineSetId,
} from "@/lib/core/timelineTypes";

export type TimelineSearchResultKind = "marker" | "band";

export type TimelineSearchItem = {
  id: string;
  kind: TimelineSearchResultKind;
  label: string;
  description?: string;
  setId: TimelineSetId | null;
  groupId: string | null;
  groupLabel?: string;
  setLabel?: string;
  startYear: number;
  endYear: number;
  minZoom?: number;
  maxZoom?: number;
  rangeLabel: string;
  searchText: string;
  /** Raw overlay ID to add to expandedOverlayIds when this result is selected.
   * Set on parent overlays (their own ID) and child overlays (their parent's ID). */
  expandableAsOverlayId?: string;
};

export type TimelineSearchResult = TimelineSearchItem & {
  score: number;
};

const MAX_SEARCH_RESULTS = 12;

function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSetIdForGroup(groupId: string | null | undefined) {
  if (!groupId) {
    return null;
  }

  return TIMELINE_SET_ID_BY_GROUP_ID.get(groupId) ?? null;
}

function getSetLabel(setId: TimelineSetId | null) {
  return setId ? TIMELINE_SETS_BY_ID[setId]?.metadata.label : undefined;
}

function getGroupLabel(groupId: string | null | undefined) {
  return groupId ? TIMELINE_DECORATION_GROUPS_BY_ID[groupId]?.label : undefined;
}

function formatSearchRange(startYear: number, endYear: number) {
  const span = Math.abs(endYear - startYear);

  if (Math.abs(startYear - endYear) < 1e-9) {
    return formatTimelineYear(startYear, 1);
  }

  return `${formatTimelineYear(startYear, span)} - ${formatTimelineYear(endYear, span)}`;
}

function createSearchText(item: Omit<TimelineSearchItem, "searchText">) {
  return normalizeSearchText(
    [
      item.label,
      item.description,
      item.setLabel,
      item.groupLabel,
      item.rangeLabel,
      item.kind,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function createMarkerSearchItem(marker: TimelineMarker): TimelineSearchItem {
  const setId = marker.setId ?? getSetIdForGroup(marker.groupId);
  const groupLabel = getGroupLabel(marker.groupId);
  const setLabel = getSetLabel(setId);
  const item = {
    id: `marker:${marker.id}`,
    kind: "marker" as const,
    label: marker.label,
    description: marker.description,
    setId,
    groupId: marker.groupId ?? null,
    groupLabel,
    setLabel,
    startYear: marker.year,
    endYear: marker.year,
    minZoom: marker.minZoom,
    maxZoom: marker.maxZoom,
    rangeLabel: marker.dateLabel ?? formatSearchRange(marker.year, marker.year),
  };

  return {
    ...item,
    searchText: createSearchText(item),
  };
}

function createOverlaySearchItem(
  overlay: TimelineOverlayBand,
  parentId?: string,
): TimelineSearchItem {
  const setId = overlay.setId ?? getSetIdForGroup(overlay.groupId);
  const groupLabel = getGroupLabel(overlay.groupId);
  const setLabel = getSetLabel(setId);
  const item = {
    id: `band:${overlay.id}`,
    kind: "band" as const,
    label: overlay.label,
    description: overlay.description,
    setId,
    groupId: overlay.groupId ?? null,
    groupLabel,
    setLabel,
    startYear: overlay.startYear,
    endYear: overlay.endYear,
    minZoom: overlay.minZoom,
    maxZoom: overlay.maxZoom,
    rangeLabel: formatSearchRange(overlay.startYear, overlay.endYear),
    expandableAsOverlayId:
      parentId ?? (overlay.children?.length ? overlay.id : undefined),
  };

  return {
    ...item,
    searchText: createSearchText(item),
  };
}

function appendOverlaySearchItems(
  items: TimelineSearchItem[],
  overlays: readonly TimelineOverlayBand[],
  parentId?: string,
) {
  for (const overlay of overlays) {
    items.push(createOverlaySearchItem(overlay, parentId));

    if (overlay.children?.length) {
      appendOverlaySearchItems(items, overlay.children, overlay.id);
    }
  }
}

export function buildTimelineSearchIndex(): TimelineSearchItem[] {
  const items = TIMELINE_MARKERS.map(createMarkerSearchItem);

  appendOverlaySearchItems(items, TIMELINE_OVERLAYS);

  return items.sort(
    (left, right) =>
      left.startYear - right.startYear || left.label.localeCompare(right.label),
  );
}

function scoreSearchItem(item: TimelineSearchItem, tokens: readonly string[]) {
  let score = 0;

  for (const token of tokens) {
    if (!item.searchText.includes(token)) {
      return 0;
    }

    if (normalizeSearchText(item.label).startsWith(token)) {
      score += 80;
    } else if (normalizeSearchText(item.label).includes(token)) {
      score += 45;
    } else {
      score += 16;
    }

    if (
      item.groupLabel &&
      normalizeSearchText(item.groupLabel).includes(token)
    ) {
      score += 8;
    }

    if (item.setLabel && normalizeSearchText(item.setLabel).includes(token)) {
      score += 6;
    }
  }

  if (item.kind === "marker") {
    score += 4;
  }

  return score;
}

export function searchTimelineIndex(
  index: readonly TimelineSearchItem[],
  rawQuery: string,
  limit = MAX_SEARCH_RESULTS,
): TimelineSearchResult[] {
  const query = normalizeSearchText(rawQuery);

  if (!query) {
    return [];
  }

  const tokens = query.split(/\s+/).filter(Boolean);
  const results: TimelineSearchResult[] = [];

  for (const item of index) {
    const score = scoreSearchItem(item, tokens);

    if (score > 0) {
      results.push({ ...item, score });
    }
  }

  return results
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.kind.localeCompare(right.kind) ||
        left.label.localeCompare(right.label),
    )
    .slice(0, limit);
}
