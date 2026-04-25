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

type EdgeRailPanInput = {
  heldForMs: number;
  idleForMs: number;
  hasRecentZoomIntent: boolean;
};

const EDGE_ZOOM_DRAG_THRESHOLD_PX = 6;
const EDGE_ZOOM_BASE_DELTA_PER_PIXEL = 0.021;
const EDGE_ZOOM_SPEED_REFERENCE_PX_PER_MS = 1.45;
const EDGE_ZOOM_SPEED_BOOST_MAX = 1.1;
const EDGE_VERTICAL_ACTIVITY_THRESHOLD_PX = 0.85;
const EDGE_VERTICAL_ACTIVITY_INTERRUPT_PAN_THRESHOLD_PX = 2.6;
const EDGE_PAN_HOLD_DELAY_MS = 280;
const EDGE_PAN_VERTICAL_IDLE_MS = 140;
const EDGE_PAN_AFTER_ZOOM_IDLE_MS = 460;
const EDGE_PAN_BASE_PIXELS_PER_FRAME = 1.4;
const EDGE_PAN_MAX_PIXELS_PER_FRAME = 10;
const EDGE_PAN_RAMP_MS = 900;

export function hasEdgeRailVerticalIntent(
  deltaYPx: number,
  options: { interruptingPan?: boolean } = {},
) {
  const threshold = options.interruptingPan
    ? EDGE_VERTICAL_ACTIVITY_INTERRUPT_PAN_THRESHOLD_PX
    : EDGE_VERTICAL_ACTIVITY_THRESHOLD_PX;

  return Math.abs(deltaYPx) >= threshold;
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

export function shouldPanEdgeRail({
  heldForMs,
  idleForMs,
  hasRecentZoomIntent,
}: EdgeRailPanInput) {
  const requiredIdleMs = hasRecentZoomIntent
    ? EDGE_PAN_AFTER_ZOOM_IDLE_MS
    : EDGE_PAN_VERTICAL_IDLE_MS;

  return heldForMs >= EDGE_PAN_HOLD_DELAY_MS && idleForMs >= requiredIdleMs;
}

export function getEdgeRailPanPixelsPerFrame(heldForMs: number) {
  const rampProgress = Math.min(heldForMs / EDGE_PAN_RAMP_MS, 1);
  const easedRampProgress = 1 - (1 - rampProgress) ** 2;

  return (
    EDGE_PAN_BASE_PIXELS_PER_FRAME +
    (EDGE_PAN_MAX_PIXELS_PER_FRAME - EDGE_PAN_BASE_PIXELS_PER_FRAME) *
      easedRampProgress
  );
}
