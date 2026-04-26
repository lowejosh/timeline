import { TIMELINE_MARKERS, TIMELINE_OVERLAYS } from "@/lib/catalog/content";
import { getRootDisplayErasBySets, ROOT_ERA } from "@/lib/catalog/eras";
import { resolveDecorationSetId } from "@/lib/catalog/timelineSets";
import { formatTimelineYear } from "@/lib/rendering/bands";
import { TIMELINE_MAX_YEAR } from "@/lib/core/timelineYears";
import type {
  Era,
  TimelineOverlayBand,
  TimelineSetId,
} from "@/lib/core/timelineTypes";

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
 * eras overlap any era from a higher-priority set.
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

/**
 * Computes a human-readable time range string for each set based on its root
 * display eras, falling back to decoration extents when a set has no eras.
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

    const span = Math.abs(range.endYear - range.startYear);
    const start = formatSetEndpointYear(range.startYear, span);
    const end = formatSetEndpointYear(range.endYear, span);

    ranges.set(setId, `${start} → ${end}`);
  }

  return ranges;
}
