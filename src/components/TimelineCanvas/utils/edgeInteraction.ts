export type EdgeRailSide = "left" | "right";

type EdgeRailGlowInput = {
  totalTravelPx: number;
  deltaYPx: number;
  deltaTimeMs: number;
};

type EdgeRailZoomInput = {
  deltaYPx: number;
  deltaTimeMs: number;
};

const EDGE_ZOOM_DRAG_THRESHOLD_PX = 6;
const EDGE_ZOOM_BASE_DELTA_PER_PIXEL = 0.021;
const EDGE_ZOOM_SPEED_REFERENCE_PX_PER_MS = 1.45;
const EDGE_ZOOM_SPEED_BOOST_MAX = 1.1;
const EDGE_VERTICAL_ACTIVITY_THRESHOLD_PX = 0.85;

export function hasEdgeRailVerticalIntent(deltaYPx: number) {
  return Math.abs(deltaYPx) >= EDGE_VERTICAL_ACTIVITY_THRESHOLD_PX;
}

export function shouldShowEdgeRailZoomState(totalTravelPx: number) {
  return totalTravelPx > EDGE_ZOOM_DRAG_THRESHOLD_PX;
}

export function getEdgeRailGlowIntensity({
  totalTravelPx,
  deltaYPx,
  deltaTimeMs,
}: EdgeRailGlowInput) {
  const pointerSpeed = Math.abs(deltaYPx) / Math.max(deltaTimeMs, 8);
  const speedBoostRatio = Math.min(
    pointerSpeed / EDGE_ZOOM_SPEED_REFERENCE_PX_PER_MS,
    1,
  );

  return Math.min(
    0.28 + Math.min(totalTravelPx / 96, 1) * 0.26 + speedBoostRatio * 0.24,
    0.9,
  );
}

export function getEdgeRailZoomDelta({
  deltaYPx,
  deltaTimeMs,
}: EdgeRailZoomInput) {
  if (!hasEdgeRailVerticalIntent(deltaYPx)) {
    return null;
  }

  const pointerSpeed = Math.abs(deltaYPx) / Math.max(deltaTimeMs, 8);
  const speedBoostRatio = Math.min(
    pointerSpeed / EDGE_ZOOM_SPEED_REFERENCE_PX_PER_MS,
    1,
  );
  const zoomBoost = 1 + speedBoostRatio * EDGE_ZOOM_SPEED_BOOST_MAX;

  return -deltaYPx * EDGE_ZOOM_BASE_DELTA_PER_PIXEL * zoomBoost;
}
