const PINCH_SCALE_DEADZONE = 0.012;
const PINCH_ZOOM_SENSITIVITY = 0.07;
const PINCH_ZOOM_MAX_DELTA = 0.05;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getPinchZoomDeltaFromScale(scaleRatio: number) {
  if (!Number.isFinite(scaleRatio) || scaleRatio <= 0) {
    return null;
  }

  const scaleDelta = scaleRatio - 1;

  if (Math.abs(scaleDelta) <= PINCH_SCALE_DEADZONE) {
    return null;
  }

  const effectiveScale =
    1 + Math.sign(scaleDelta) * (Math.abs(scaleDelta) - PINCH_SCALE_DEADZONE);
  const zoomDelta =
    Math.log2(Math.max(effectiveScale, 0.001)) * PINCH_ZOOM_SENSITIVITY;

  if (Math.abs(zoomDelta) <= 0.0001) {
    return null;
  }

  return clamp(zoomDelta, -PINCH_ZOOM_MAX_DELTA, PINCH_ZOOM_MAX_DELTA);
}
