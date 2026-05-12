import { isTimelineDecorationVisibleAtZoom } from "@/lib/rendering/queries/visibility";
import {
  getVisibleRange,
  worldToScreen,
  type TimelineViewport,
} from "@/lib/core/viewport";
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

function addVisibleOverlayGroupIdsWithViewportEdges(
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  innerWidth: number,
  width: number,
  pad: number,
  zoom: number,
  enabledGroupIds: ReadonlySet<string>,
  visibleOverlayGroupIds: Set<string>,
) {
  for (const overlay of overlays) {
    const x0 = pad + worldToScreen(overlay.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(overlay.endYear, viewport, innerWidth);
    const hasVisibleViewportEdge =
      (x0 >= pad && x0 <= width - pad) || (x1 >= pad && x1 <= width - pad);

    if (
      overlay.groupId &&
      enabledGroupIds.has(overlay.groupId) &&
      isTimelineDecorationVisibleAtZoom(overlay, zoom) &&
      hasVisibleViewportEdge
    ) {
      visibleOverlayGroupIds.add(overlay.groupId);
    }

    if (overlay.children && overlay.children.length > 0) {
      addVisibleOverlayGroupIdsWithViewportEdges(
        overlay.children,
        viewport,
        innerWidth,
        width,
        pad,
        zoom,
        enabledGroupIds,
        visibleOverlayGroupIds,
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

export function getVisibleTimelineOverlayGroupIdsWithViewportEdges(
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
  const visibleOverlayGroupIds = new Set<string>();

  addVisibleOverlayGroupIdsWithViewportEdges(
    overlays,
    viewport,
    innerWidth,
    width,
    pad,
    viewport.zoom,
    enabledGroupIds,
    visibleOverlayGroupIds,
  );

  return visibleOverlayGroupIds;
}

export function filterHiddenOverlayBands(
  overlays: TimelineOverlayBand[],
  hiddenOverlayIds: ReadonlySet<string>,
): TimelineOverlayBand[] {
  if (hiddenOverlayIds.size === 0) {
    return overlays;
  }

  let didChange = false;
  const filtered: TimelineOverlayBand[] = [];

  for (const overlay of overlays) {
    if (hiddenOverlayIds.has(overlay.id)) {
      didChange = true;
      continue;
    }

    if (!overlay.children) {
      filtered.push(overlay);
      continue;
    }

    const children = filterHiddenOverlayBands(
      overlay.children,
      hiddenOverlayIds,
    );

    if (children === overlay.children) {
      filtered.push(overlay);
      continue;
    }

    didChange = true;
    filtered.push({
      ...overlay,
      children,
    });
  }

  return didChange ? filtered : overlays;
}
