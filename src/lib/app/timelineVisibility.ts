import { isTimelineDecorationVisibleAtZoom } from "@/lib/rendering/queries/visibility";
import { getVisibleRange, type TimelineViewport } from "@/lib/core/viewport";
import type {
  TimelineMarker,
  TimelineOverlayBand,
} from "@/lib/core/timelineTypes";

function addVisibleOverlayGroupIds(
  overlays: TimelineOverlayBand[],
  visibleStart: number,
  visibleEnd: number,
  zoom: number,
  enabledGroupIds: ReadonlySet<string>,
  visibleGroupIds: Set<string>,
) {
  for (const overlay of overlays) {
    if (
      overlay.groupId &&
      enabledGroupIds.has(overlay.groupId) &&
      isTimelineDecorationVisibleAtZoom(overlay, zoom) &&
      overlay.startYear <= visibleEnd &&
      overlay.endYear >= visibleStart
    ) {
      visibleGroupIds.add(overlay.groupId);
    }

    if (overlay.children && overlay.children.length > 0) {
      addVisibleOverlayGroupIds(
        overlay.children,
        visibleStart,
        visibleEnd,
        zoom,
        enabledGroupIds,
        visibleGroupIds,
      );
    }
  }
}

export function getVisibleTimelineGroupIds(
  markers: TimelineMarker[],
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  enabledGroupIds: ReadonlySet<string>,
) {
  if (width <= pad * 2) {
    return new Set<string>();
  }

  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);
  const visibleGroupIds = new Set<string>();

  for (const marker of markers) {
    if (
      marker.groupId &&
      enabledGroupIds.has(marker.groupId) &&
      isTimelineDecorationVisibleAtZoom(marker, viewport.zoom) &&
      marker.year >= visibleStart &&
      marker.year <= visibleEnd
    ) {
      visibleGroupIds.add(marker.groupId);
    }
  }

  addVisibleOverlayGroupIds(
    overlays,
    visibleStart,
    visibleEnd,
    viewport.zoom,
    enabledGroupIds,
    visibleGroupIds,
  );

  return visibleGroupIds;
}

export function filterHiddenOverlayBands(
  overlays: TimelineOverlayBand[],
  hiddenOverlayIds: ReadonlySet<string>,
): TimelineOverlayBand[] {
  return overlays.flatMap((overlay) => {
    if (hiddenOverlayIds.has(overlay.id)) {
      return [];
    }

    return [
      {
        ...overlay,
        children: overlay.children
          ? filterHiddenOverlayBands(overlay.children, hiddenOverlayIds)
          : undefined,
      },
    ];
  });
}
