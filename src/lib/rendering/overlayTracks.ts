import type { TimelineOverlayBand } from "../core/timelineTypes";
import {
  getVisibleRange,
  worldToScreen,
  type TimelineViewport,
} from "../core/viewport";
import {
  isDecorationGroupEnabled,
  isTimelineDecorationVisibleAtZoom,
} from "./queries/visibility";
import {
  getAssignedOverlayLanes,
  type AssignedTimelineOverlayBand,
} from "./layout/laneAssignment";

export type ResolvedTimelineOverlayBand = {
  band: TimelineOverlayBand;
  laneIndex: number;
  laneCount: number;
  x0: number;
  x1: number;
  clippedX0: number;
  clippedX1: number;
  centerX: number;
  visibleWidth: number;
  renderX: number;
  renderWidth: number;
  renderAlphaMultiplier: number;
  isHairline: boolean;
};

const OVERLAY_MIN_VISIBLE_WIDTH_DEVICE_PX = 0.5;
const ALL_GROUPS_CACHE_KEY = "__all__";

type CachedLaneAssignment = {
  assigned: AssignedTimelineOverlayBand[];
  laneCount: number;
};

const enabledOverlayLaneCache = new WeakMap<
  TimelineOverlayBand[],
  Map<string, CachedLaneAssignment>
>();

function getEnabledGroupCacheKey(
  enabledGroupIds?: ReadonlySet<string> | null,
) {
  if (!enabledGroupIds) {
    return ALL_GROUPS_CACHE_KEY;
  }

  return Array.from(enabledGroupIds).sort().join("\u001f");
}

function getAssignedEnabledOverlayLanes(
  overlays: TimelineOverlayBand[],
  enabledGroupIds?: ReadonlySet<string> | null,
) {
  const cacheKey = getEnabledGroupCacheKey(enabledGroupIds);
  let cacheByGroupSignature = enabledOverlayLaneCache.get(overlays);

  if (!cacheByGroupSignature) {
    cacheByGroupSignature = new Map();
    enabledOverlayLaneCache.set(overlays, cacheByGroupSignature);
  }

  const cached = cacheByGroupSignature.get(cacheKey);

  if (cached) {
    return cached;
  }

  const enabledOverlays = enabledGroupIds
    ? overlays.filter((overlay) =>
        isDecorationGroupEnabled(overlay, enabledGroupIds),
      )
    : overlays;
  const computed =
    enabledOverlays === overlays
      ? getAssignedOverlayLanes(overlays)
      : getAssignedOverlayLanes(enabledOverlays);

  cacheByGroupSignature.set(cacheKey, computed);
  return computed;
}

function resolveOverlayRenderGeometry(
  clippedX0: number,
  clippedX1: number,
  minX: number,
  maxX: number,
  devicePixelRatio: number,
) {
  const visibleWidth = Math.max(clippedX1 - clippedX0, 0);
  const pixelRatio = Math.max(devicePixelRatio, 1);
  const minVisibleWidth = OVERLAY_MIN_VISIBLE_WIDTH_DEVICE_PX / pixelRatio;
  const minRenderWidth = 1 / pixelRatio;

  if (visibleWidth < minVisibleWidth) {
    return null;
  }

  if (visibleWidth >= minRenderWidth) {
    return {
      visibleWidth,
      renderX: clippedX0,
      renderWidth: visibleWidth,
      renderAlphaMultiplier: 1,
      isHairline: false,
    };
  }

  const midpoint = (clippedX0 + clippedX1) / 2;
  const pixelStep = 1 / pixelRatio;
  const maxRenderX = Math.max(minX, maxX - minRenderWidth);
  const snappedRenderX =
    Math.round((midpoint - minRenderWidth / 2) / pixelStep) * pixelStep;
  const renderX = Math.min(Math.max(snappedRenderX, minX), maxRenderX);

  return {
    visibleWidth,
    renderX,
    renderWidth: minRenderWidth,
    renderAlphaMultiplier: visibleWidth / minRenderWidth,
    isHairline: true,
  };
}

export function resolveTimelineOverlayTracks(
  overlays: TimelineOverlayBand[],
  viewport: TimelineViewport,
  width: number,
  pad: number,
  devicePixelRatio = 1,
  enabledGroupIds?: ReadonlySet<string> | null,
): ResolvedTimelineOverlayBand[] {
  const innerWidth = Math.max(width - pad * 2, 1);
  const [visibleStart, visibleEnd] = getVisibleRange(viewport, innerWidth);

  if (overlays.length === 0) {
    return [];
  }

  const { assigned, laneCount } = getAssignedEnabledOverlayLanes(
    overlays,
    enabledGroupIds,
  );
  const visibleOverlays: ResolvedTimelineOverlayBand[] = [];

  for (const { band, laneIndex } of assigned) {
    if (
      !isTimelineDecorationVisibleAtZoom(band, viewport.zoom) ||
      band.endYear < visibleStart ||
      band.startYear > visibleEnd
    ) {
      continue;
    }

    const x0 = pad + worldToScreen(band.startYear, viewport, innerWidth);
    const x1 = pad + worldToScreen(band.endYear, viewport, innerWidth);
    const clippedX0 = Math.max(x0, pad);
    const clippedX1 = Math.min(x1, width - pad);
    const renderGeometry = resolveOverlayRenderGeometry(
      clippedX0,
      clippedX1,
      pad,
      width - pad,
      devicePixelRatio,
    );

    if (!renderGeometry) {
      continue;
    }

    const centerX =
      renderGeometry.visibleWidth > 0
        ? clippedX0 + renderGeometry.visibleWidth / 2
        : Math.min(Math.max((x0 + x1) / 2, pad), width - pad);
    visibleOverlays.push({
      band,
      laneIndex,
      laneCount,
      x0,
      x1,
      clippedX0,
      clippedX1,
      centerX,
      visibleWidth: renderGeometry.visibleWidth,
      renderX: renderGeometry.renderX,
      renderWidth: renderGeometry.renderWidth,
      renderAlphaMultiplier: renderGeometry.renderAlphaMultiplier,
      isHairline: renderGeometry.isHairline,
    });
  }

  return visibleOverlays;
}
