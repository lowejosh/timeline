import { getRootDisplayErasBySets } from "@/lib/catalog/eras";
import { resolveDecorationSetId } from "@/lib/catalog/timelineSets";
import {
  STATIC_TIMELINE_CATALOG,
  type TimelineCatalogSnapshot,
} from "@/lib/catalog/timelineCatalog";
import { formatTimelineYear } from "@/lib/rendering/bands";
import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";
import type {
  Era,
  TimelineOverlayBand,
  TimelineSetId,
} from "@/lib/core/timelineTypes";

export type TimelineYearRange = {
  startYear: number;
  endYear: number;
};

function expandRange(
  range: TimelineYearRange | null,
  startYear: number,
  endYear: number,
): TimelineYearRange {
  if (!range) {
    return { startYear, endYear };
  }

  return {
    startYear: Math.min(range.startYear, startYear),
    endYear: Math.max(range.endYear, endYear),
  };
}

function getDisplayErasForSet(
  setId: TimelineSetId,
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Era[] {
  return getRootDisplayErasBySets(catalog.rootEra, new Set([setId]), catalog);
}

function getDecorationExtentForSet(
  setId: TimelineSetId,
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
) {
  let range: TimelineYearRange | null = null;

  for (const marker of catalog.markers) {
    const markerSetId = marker.setId ?? resolveDecorationSetId(marker);

    if (markerSetId !== setId) {
      continue;
    }

    range = expandRange(range, marker.year, marker.year);
  }

  const visitOverlays = (overlays: readonly TimelineOverlayBand[]) => {
    for (const overlay of overlays) {
      const overlaySetId = overlay.setId ?? resolveDecorationSetId(overlay);

      if (overlaySetId === setId) {
        range = expandRange(range, overlay.startYear, overlay.endYear);
      }

      if (overlay.children?.length) {
        visitOverlays(overlay.children);
      }
    }
  };

  visitOverlays(catalog.overlays);

  return range;
}

/**
 * For each set in `orderedEnabledSetIds`, counts how many of its root display
 * eras overlap any era from a higher-priority set.
 */
export function computeEraObscuredCounts(
  orderedEnabledSetIds: readonly TimelineSetId[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Map<TimelineSetId, number> {
  const counts = new Map<TimelineSetId, number>();
  const erasBySet = new Map<TimelineSetId, Era[]>();

  for (const setId of orderedEnabledSetIds) {
    erasBySet.set(setId, getDisplayErasForSet(setId, catalog));
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
          higher.startYear < era.endYear && higher.endYear > era.startYear,
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

export function computeSetYearRanges(
  setIds: readonly TimelineSetId[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Map<TimelineSetId, TimelineYearRange> {
  const ranges = new Map<TimelineSetId, TimelineYearRange>();

  for (const setId of setIds) {
    const eras = getDisplayErasForSet(setId, catalog);
    let range: TimelineYearRange | null =
      eras.length > 0
        ? {
            startYear: Math.min(...eras.map((era) => era.startYear)),
            endYear: Math.max(...eras.map((era) => era.endYear)),
          }
        : null;
    const decorationRange = getDecorationExtentForSet(setId, catalog);

    if (decorationRange) {
      range = expandRange(
        range,
        decorationRange.startYear,
        decorationRange.endYear,
      );
    }

    if (range) {
      ranges.set(setId, range);
    }
  }

  return ranges;
}

export function computeGroupYearRanges(
  groupIds: readonly string[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Map<string, TimelineYearRange> {
  const requestedGroupIds = new Set(groupIds);
  const ranges = new Map<string, TimelineYearRange>();

  for (const marker of catalog.markers) {
    if (!marker.groupId || !requestedGroupIds.has(marker.groupId)) {
      continue;
    }

    ranges.set(
      marker.groupId,
      expandRange(ranges.get(marker.groupId) ?? null, marker.year, marker.year),
    );
  }

  const visitOverlays = (overlays: readonly TimelineOverlayBand[]) => {
    for (const overlay of overlays) {
      if (overlay.groupId && requestedGroupIds.has(overlay.groupId)) {
        ranges.set(
          overlay.groupId,
          expandRange(
            ranges.get(overlay.groupId) ?? null,
            overlay.startYear,
            overlay.endYear,
          ),
        );
      }

      if (overlay.children?.length) {
        visitOverlays(overlay.children);
      }
    }
  };

  visitOverlays(catalog.overlays);

  return ranges;
}

/**
 * Computes a human-readable time range string for each set based on its root
 * display eras, falling back to decoration extents when a set has no eras.
 */
export function computeSetTimeRanges(
  setIds: readonly TimelineSetId[],
  catalog: TimelineCatalogSnapshot = STATIC_TIMELINE_CATALOG,
): Map<TimelineSetId, string> {
  const ranges = new Map<TimelineSetId, string>();
  const yearRanges = computeSetYearRanges(setIds, catalog);

  for (const [setId, range] of yearRanges) {
    const span = Math.abs(range.endYear - range.startYear);
    const start = formatSetEndpointYear(range.startYear, span);
    const end = formatSetEndpointYear(range.endYear, span);

    ranges.set(setId, `${start} → ${end}`);
  }

  return ranges;
}
