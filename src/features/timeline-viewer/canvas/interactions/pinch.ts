const PINCH_SCALE_DEADZONE = 0.003;

export function getPinchZoomForScale(startZoom: number, scaleRatio: number) {
  if (!Number.isFinite(scaleRatio) || scaleRatio <= 0) {
    return null;
  }

  const scaleDelta = scaleRatio - 1;

  if (Math.abs(scaleDelta) <= PINCH_SCALE_DEADZONE) {
    return null;
  }

  const effectiveScale =
    1 + Math.sign(scaleDelta) * (Math.abs(scaleDelta) - PINCH_SCALE_DEADZONE);
  const zoomDelta = Math.log2(Math.max(effectiveScale, 0.001));

  if (Math.abs(zoomDelta) <= 0.0001) {
    return startZoom;
  }

  return startZoom + zoomDelta;
}
